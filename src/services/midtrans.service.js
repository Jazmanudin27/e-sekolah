class MidtransService {
  constructor() {
    this.serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-oRFj2p6jrFzxUVGwO6Tj6w8B';
    this.clientKey = process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-gtkZISrCZJZHYwwZ';
    this.isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    this.baseUrl = this.isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
  }

  getAuthHeader() {
    const authString = Buffer.from(`${this.serverKey}:`).toString('base64');
    return `Basic ${authString}`;
  }

  /**
   * Create Snap Payment Transaction & Get Snap Token + Redirect URL
   */
  async createSnapTransaction({ orderId, grossAmount, customerName = 'Siswa', email = '', items = [] }) {
    const payload = {
      transaction_details: {
        order_id: orderId || `INV-MID-${Date.now()}`,
        gross_amount: Number(grossAmount)
      },
      customer_details: {
        first_name: customerName,
        email: email || 'siswa@artanita.sch.id'
      },
      enabled_payments: [
        'bni_va', 'bca_va', 'bri_va', 'mandiri_va', 'permata_va',
        'gopay', 'qris', 'shopeepay', 'other_va'
      ],
      callbacks: {
        finish: process.env.MIDTRANS_FINISH_URL || 'https://mobile.sistemiartas.com/'
      }
    };

    if (items && items.length > 0) {
      payload.item_details = items.map((item, idx) => ({
        id: item.id || `ITEM-${idx + 1}`,
        price: Number(item.price || item.nominal_tagihan || grossAmount),
        quantity: Number(item.quantity || 1),
        name: String(item.name || item.nama_pos || 'Pembayaran SPP Sekolah').substring(0, 50)
      }));
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data && data.token) {
        return {
          token: data.token,
          redirect_url: data.redirect_url,
          order_id: payload.transaction_details.order_id
        };
      }
      throw new Error(data.error_messages ? data.error_messages.join(', ') : 'Gagal membuat Snap token Midtrans');
    } catch (err) {
      console.error('Midtrans Create Snap Token Error:', err.message);
      throw err;
    }
  }
}

module.exports = new MidtransService();
