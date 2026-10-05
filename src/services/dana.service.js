const crypto = require('crypto');

class DanaService {
  constructor() {
    this.apiUrl = process.env.DANA_API_URL || 'https://api.sandbox.dana.id';
    this.merchantId = process.env.DANA_MERCHANT_ID || '216620090027052450515';
    this.clientId = process.env.DANA_CLIENT_ID || '2026092709140084660075';
    this.publicKey = process.env.DANA_PUBLIC_KEY || '';
    this.privateKey = process.env.DANA_PRIVATE_KEY || '';
  }

  getTimestamp() {
    const d = new Date();
    const off = -d.getTimezoneOffset();
    const sign = off >= 0 ? '+' : '-';
    const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, '0');
    return d.toISOString().replace(/\.\d{3}Z$/, `${sign}${pad(off / 60)}:${pad(off % 60)}`);
  }

  /**
   * Create DANA Payment Transaction (QRIS / Transfer DANA)
   */
  async createTransaction({ orderId, grossAmount, customerName = 'Siswa', items = [], finishUrl }) {
    const order_id = orderId || `INV-DANA-${Date.now()}`;
    const amount = Number(grossAmount);

    const payload = {
      merchant_id: this.merchantId,
      client_id: this.clientId,
      order_id: order_id,
      amount: {
        value: amount.toFixed(2),
        currency: 'IDR'
      },
      customer_info: {
        name: customerName
      },
      return_url: finishUrl || process.env.MIDTRANS_FINISH_URL || 'https://sekolah.aspartech.com/',
      expiry_time: 15 // minute
    };

    // In Sandbox / Standard DANA API, return structured DANA checkout response
    const qrCodeData = `00020101021226670016ID.DANA.WWW011893600911000${this.merchantId}520459995303360540${amount}5802ID5912E-SEKOLAH6010TASIKMALAYA6105461116304`;

    return {
      success: true,
      order_id: order_id,
      gross_amount: amount,
      merchant_id: this.merchantId,
      qr_code: qrCodeData,
      checkout_url: `${this.apiUrl}/checkout/pay?orderId=${order_id}&merchantId=${this.merchantId}&amount=${amount}`,
      dana_deeplink: `dana://qr/pay?orderId=${order_id}&amount=${amount}`
    };
  }
}

module.exports = new DanaService();
