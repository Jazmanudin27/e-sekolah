const crypto = require('crypto');
const axios = require('axios');

class BniSnapService {
  constructor() {
    this.clientId = process.env.BNI_CLIENT_ID || '';
    this.clientSecret = process.env.BNI_CLIENT_SECRET || '';
    this.partnerId = process.env.BNI_PARTNER_ID || process.env.BNI_CLIENT_ID || '';
    this.baseUrl = process.env.BNI_BASE_URL || 'https://sandbox.bni.co.id';
    this.privateKey = (process.env.BNI_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    this.bniPublicKey = (process.env.BNI_PUBLIC_KEY || '').replace(/\\n/g, '\n');
  }

  /**
   * Generate ISO 8601 Timestamp (Format: YYYY-MM-DDTHH:mm:ss+07:00)
   */
  getTimestamp() {
    const d = new Date();
    const off = -d.getTimezoneOffset();
    const sign = off >= 0 ? '+' : '-';
    const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, '0');
    return d.toISOString().replace(/\.\d{3}Z$/, `${sign}${pad(off / 60)}:${pad(off % 60)}`);
  }

  /**
   * Generate Asymmetric Signature for B2B Token Request (RSA-SHA256)
   */
  generateAsymmetricSignature(timestamp) {
    if (!this.privateKey) {
      throw new Error('BNI_PRIVATE_KEY belum dikonfigurasi di .env');
    }
    const stringToSign = `${this.clientId}|${timestamp}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(stringToSign);
    return signer.sign(this.privateKey, 'base64');
  }

  /**
   * Get B2B Access Token from BNI SNAP Endpoint
   */
  async getAccessToken() {
    const timestamp = this.getTimestamp();
    const signature = this.generateAsymmetricSignature(timestamp);

    const headers = {
      'Content-Type': 'application/json',
      'X-CLIENT-KEY': this.clientId,
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': signature
    };

    const payload = {
      grantType: 'client_credentials'
    };

    try {
      const res = await axios.post(`${this.baseUrl}/api/v1.0/access-token/b2b`, payload, { headers });
      if (res.data && res.data.accessToken) {
        return {
          accessToken: res.data.accessToken,
          expiresIn: res.data.expiresIn
        };
      }
      throw new Error(res.data?.responseDescription || 'Gagal mendapatkan Access Token dari BNI');
    } catch (err) {
      console.error('BNI Get Access Token Error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.responseDescription || err.message);
    }
  }

  /**
   * Generate Symmetric Signature (HMAC-SHA512) for Transaction & Webhook Validation
   */
  generateSymmetricSignature(method, endpointUrl, accessToken, bodyObj, timestamp) {
    const minifiedBody = JSON.stringify(bodyObj || {});
    const bodyHash = crypto.createHash('sha256').update(minifiedBody).digest('hex').toLowerCase();
    const stringToSign = `${method.toUpperCase()}:${endpointUrl}:${accessToken}:${bodyHash}:${timestamp}`;

    return crypto
      .createHmac('sha512', this.clientSecret)
      .update(stringToSign)
      .digest('base64');
  }

  /**
   * Create Virtual Account (BNI SNAP API /api/v1.0/transfer-va/create-va)
   */
  async createVirtualAccount({ vaNumber, customerName, amount, expiredTime, description = 'Tagihan Sekolah' }) {
    const tokenObj = await this.getAccessToken();
    const accessToken = tokenObj.accessToken;
    const timestamp = this.getTimestamp();
    const endpoint = '/api/v1.0/transfer-va/create-va';
    const externalId = `REQ-${Date.now()}`;

    const body = {
      partnerServiceId: process.env.BNI_VA_PREFIX || '888',
      customerNo: vaNumber,
      virtualAccountNo: `${process.env.BNI_VA_PREFIX || '888'}${vaNumber}`,
      virtualAccountName: customerName,
      trxId: externalId,
      totalAmount: {
        value: Number(amount).toFixed(2),
        currency: 'IDR'
      },
      virtualAccountTrxType: '1', // 1: One Off, 2: Multiple
      expiredDate: expiredTime || new Date(Date.now() + 86400000 * 30).toISOString(), // Default 30 hari
      description
    };

    const signature = this.generateSymmetricSignature('POST', endpoint, accessToken, body, timestamp);

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': signature,
      'X-PARTNER-ID': this.partnerId,
      'X-EXTERNAL-ID': externalId
    };

    try {
      const res = await axios.post(`${this.baseUrl}${endpoint}`, body, { headers });
      return res.data;
    } catch (err) {
      console.error('BNI Create VA Error:', err.response?.data || err.message);
      throw new Error(err.response?.data?.responseDescription || err.message);
    }
  }

  /**
   * Verify Webhook Payment Notification Signature from BNI
   */
  verifyWebhookSignature(headers, body, endpointUrl = '/api/v1.0/transfer-va/payment-notify') {
    const timestamp = headers['x-timestamp'] || headers['X-TIMESTAMP'];
    const bniSignature = headers['x-signature'] || headers['X-SIGNATURE'];
    const authHeader = headers['authorization'] || headers['AUTHORIZATION'] || '';
    const accessToken = authHeader.replace(/^Bearer\s+/i, '');

    if (!timestamp || !bniSignature) return false;

    const expectedSignature = this.generateSymmetricSignature('POST', endpointUrl, accessToken, body, timestamp);
    return expectedSignature === bniSignature;
  }
}

module.exports = new BniSnapService();
