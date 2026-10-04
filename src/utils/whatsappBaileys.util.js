const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');

// Directory to store session credentials
const SESSIONS_DIR = path.join(__dirname, '../../whatsapp_sessions');

let sock = null;
let connectionStatus = 'disconnected'; // 'disconnected' | 'connecting' | 'qr_ready' | 'connected'
let currentQR = null;
let connectedUser = null;
let isInitializing = false;
let reconnectTimeout = null;

// Ensure session directory exists
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

/**
 * Initialize Baileys WhatsApp Socket using dynamic import (since Baileys is ESM)
 */
async function initBaileys(forceRestart = false) {
  if (isInitializing) return;
  if (connectionStatus === 'connected' && !forceRestart) return;

  isInitializing = true;
  connectionStatus = 'connecting';

  try {
    const baileys = await import('@whiskeysockets/baileys');
    const pinoModule = await import('pino');
    const pino = pinoModule.default || pinoModule;

    const {
      default: makeWASocket,
      useMultiFileAuthState,
      DisconnectReason,
      fetchLatestBaileysVersion
    } = baileys;

    const { state, saveCreds } = await useMultiFileAuthState(SESSIONS_DIR);
    let version = [2, 3000, 1015901307];
    try {
      const v = await fetchLatestBaileysVersion();
      if (v?.version) version = v.version;
    } catch (e) {
      // Use fallback version
    }

    if (sock) {
      try {
        sock.ev.removeAllListeners();
        sock.end();
      } catch (err) {
        // ignore
      }
    }

    sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: state,
      browser: ['E-Sekolah System', 'Chrome', '1.0.0'],
      syncFullHistory: false,
      generateHighQualityLinkPreview: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        connectionStatus = 'qr_ready';
        try {
          currentQR = await qrcode.toDataURL(qr, { margin: 2, scale: 6 });
        } catch (qrErr) {
          console.error('[WA QR] Error generating QR code image:', qrErr);
        }
      }

      if (connection === 'open') {
        connectionStatus = 'connected';
        currentQR = null;
        const jid = sock?.user?.id || '';
        const phone = jid.split(':')[0] || jid.split('@')[0];
        connectedUser = {
          phone,
          name: sock?.user?.name || 'Nomor Resmi Sekolah'
        };
        console.log(`[WA Gateway] Terhubung dengan nomor: ${phone}`);
      }

      if (connection === 'close') {
        currentQR = null;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;

        console.log(`[WA Gateway] Sesi tertutup. Status code: ${statusCode}, Logged out: ${isLoggedOut}`);

        if (isLoggedOut) {
          connectionStatus = 'disconnected';
          connectedUser = null;
          // Clean up session folder
          clearSessionFiles();
        } else {
          connectionStatus = 'disconnected';
          // Auto reconnect after brief pause
          clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(() => {
            initBaileys();
          }, 4000);
        }
      }
    });

  } catch (err) {
    console.error('[WA Gateway] Inisialisasi Baileys gagal:', err);
    connectionStatus = 'disconnected';
  } finally {
    isInitializing = false;
  }
}

/**
 * Remove session files on logout
 */
function clearSessionFiles() {
  try {
    if (fs.existsSync(SESSIONS_DIR)) {
      const files = fs.readdirSync(SESSIONS_DIR);
      for (const file of files) {
        fs.unlinkSync(path.join(SESSIONS_DIR, file));
      }
    }
  } catch (e) {
    console.error('[WA Gateway] Gagal membersihkan folder sesi:', e.message);
  }
}

/**
 * Disconnect and remove credentials
 */
async function disconnectBaileys() {
  connectionStatus = 'disconnected';
  currentQR = null;
  connectedUser = null;
  clearTimeout(reconnectTimeout);

  if (sock) {
    try {
      await sock.logout();
    } catch (e) {
      try {
        sock.end();
      } catch (err) {
        // ignore
      }
    }
    sock = null;
  }

  clearSessionFiles();
  return { success: true, message: 'WhatsApp berhasil diputus.' };
}

/**
 * Format phone to standard WhatsApp international format (e.g. 628123456789)
 */
function formatWhatsAppNumber(phone) {
  if (!phone) return null;
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Send WhatsApp text message via active Baileys socket
 */
async function sendBaileysMessage(phoneNumber, messageText) {
  if (connectionStatus !== 'connected' || !sock) {
    throw new Error('WhatsApp belum terhubung! Silakan scan QR code di menu Pengaturan WA.');
  }

  const cleanedPhone = formatWhatsAppNumber(phoneNumber);
  if (!cleanedPhone || cleanedPhone.length < 9) {
    throw new Error(`Nomor telepon tidak valid: ${phoneNumber}`);
  }

  const jid = `${cleanedPhone}@s.whatsapp.net`;

  try {
    const result = await sock.sendMessage(jid, { text: messageText });
    return {
      success: true,
      messageId: result?.key?.id,
      recipient: cleanedPhone,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error(`[WA Gateway] Gagal kirim ke ${cleanedPhone}:`, err.message);
    throw new Error(`Gagal mengirim WhatsApp: ${err.message}`);
  }
}

/**
 * Get current Gateway status
 */
function getBaileysStatus() {
  return {
    status: connectionStatus,
    qr: currentQR,
    user: connectedUser,
    isConnected: connectionStatus === 'connected'
  };
}

// Auto-check on module load: if credentials exist, reconnect automatically
try {
  if (fs.existsSync(SESSIONS_DIR) && fs.readdirSync(SESSIONS_DIR).length > 0) {
    initBaileys();
  }
} catch (e) {
  // silent
}

module.exports = {
  initBaileys,
  disconnectBaileys,
  sendBaileysMessage,
  getBaileysStatus,
  formatWhatsAppNumber
};
