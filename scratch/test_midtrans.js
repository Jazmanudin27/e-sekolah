require('dotenv').config({ path: __dirname + '/../.env' });
const midtransService = require('../src/services/midtrans.service');

async function testMidtrans() {
  console.log('🚀 [MIDTRANS TEST] Memulai Pengujian Snap Payment Midtrans...');
  console.log('📌 Merchant ID:', process.env.MIDTRANS_MERCHANT_ID);
  console.log('📌 Client Key:', process.env.MIDTRANS_CLIENT_KEY);

  try {
    const res = await midtransService.createSnapTransaction({
      orderId: `TEST-ORDER-${Date.now()}`,
      grossAmount: 350000,
      customerName: 'Siswa Testing Artanita',
      email: 'testing@artanita.sch.id',
      items: [
        { id: 'SPP-OCT', price: 350000, quantity: 1, name: 'SPP Bulanan Oktober 2026' }
      ]
    });

    console.log('\n✅ MIDTRANS SNAP TOKEN BERHASIL DIBUAT!');
    console.log('🎫 Snap Token:', res.token);
    console.log('🔗 Payment Redirect URL:', res.redirect_url);
    console.log('📋 Order ID:', res.order_id);
  } catch (err) {
    console.error('\n❌ Error Midtrans:', err.message);
  }
}

testMidtrans();
