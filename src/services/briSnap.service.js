const crypto = require('crypto');

class BriSnapService {
  constructor() {
    this.clientId = process.env.BRI_CLIENT_ID || 'bQEvRaN7sV4XMwJDa1DM6sludTJHOWJY';
    this.clientSecret = process.env.BRI_CLIENT_SECRET || 'QY6cqofY3qRCRHru';
    this.baseUrl = process.env.BRI_BASE_URL || 'https://sandbox.partner.api.bri.co.id';
    this.privateKey = (process.env.BRI_PRIVATE_KEY || process.env.BNI_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  }

  getTimestamp() {
    const d = new Date();
    const off = -d.getTimezoneOffset();
    const sign = off >= 0 ? '+' : '-';
    const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, '0');
    return d.toISOString().replace(/\.\d{3}Z$/, `${sign}${pad(off / 60)}:${pad(off % 60)}`);
  }

  generateAsymmetricSignature(timestamp) {
    if (!this.privateKey) {
      throw new Error('BRI_PRIVATE_KEY belum dikonfigurasi di .env');
    }
    const stringToSign = `${this.clientId}|${timestamp}`;
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(stringToSign);
    return signer.sign(this.privateKey, 'base64');
  }

  async getAccessToken() {
    const timestamp = this.getTimestamp();
    const signature = this.generateAsymmetricSignature(timestamp);

    const headers = {
      'Content-Type': 'application/json',
      'X-CLIENT-KEY': this.clientId,
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': signature
    };

    const payload = { grantType: 'client_credentials' };

    try {
      const response = await fetch(`${this.baseUrl}/v1.0/access-token/b2b`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data && data.accessToken) {
        return { accessToken: data.accessToken, expiresIn: data.expiresIn };
      }
      throw new Error(data?.responseDescription || data?.responseMessage || 'Gagal mendapatkan Access Token BRI');
    } catch (err) {
      console.error('BRI Get Access Token Error:', err.message);
      throw err;
    }
  }

  generateSymmetricSignature(method, endpointUrl, accessToken, bodyObj, timestamp) {
    const minifiedBody = JSON.stringify(bodyObj || {});
    const bodyHash = crypto.createHash('sha256').update(minifiedBody).digest('hex').toLowerCase();
    const stringToSign = `${method.toUpperCase()}:${endpointUrl}:${accessToken}:${bodyHash}:${timestamp}`;

    return crypto
      .createHmac('sha512', this.clientSecret)
      .update(stringToSign)
      .digest('base64');
  }

  async createVirtualAccount({ vaNumber, customerName, amount, description = 'Tagihan Sekolah BRIVA' }) {
    const tokenObj = await this.getAccessToken();
    const accessToken = tokenObj.accessToken;
    const timestamp = this.getTimestamp();
    const endpoint = '/v1.0/transfer-va/create-va';
    const externalId = `REQ-BRI-${Date.now()}`;

    const body = {
      partnerServiceId: process.env.BRI_VA_PREFIX || '77777',
      customerNo: vaNumber,
      virtualAccountNo: `${process.env.BRI_VA_PREFIX || '77777'}${vaNumber}`,
      virtualAccountName: customerName,
      trxId: externalId,
      totalAmount: {
        value: Number(amount).toFixed(2),
        currency: 'IDR'
      },
      virtualAccountTrxType: '1',
      description
    };

    const signature = this.generateSymmetricSignature('POST', endpoint, accessToken, body, timestamp);

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-TIMESTAMP': timestamp,
      'X-SIGNATURE': signature,
      'X-PARTNER-ID': this.clientId,
      'X-EXTERNAL-ID': externalId
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      return await response.json();
    } catch (err) {
      console.error('BRI Create BRIVA Error:', err.message);
      throw err;
    }
  }

  verifyWebhookSignature(headers, body, endpointUrl = '/api/keuangan/webhook/bri') {
    const timestamp = headers['x-timestamp'] || headers['X-TIMESTAMP'];
    const signature = headers['x-signature'] || headers['X-SIGNATURE'];
    const authHeader = headers['authorization'] || headers['AUTHORIZATION'] || '';
    const accessToken = authHeader.replace(/^Bearer\s+/i, '');

    if (!timestamp || !signature) return false;
    const expected = this.generateSymmetricSignature('POST', endpointUrl, accessToken, body, timestamp);
    return expected === signature;
  }
}

module.exports = new BriSnapService();
