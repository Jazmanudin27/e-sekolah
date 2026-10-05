require('dotenv').config({ path: __dirname + '/../.env' });
const bniSnapService = require('../src/services/bniSnap.service');

async function testBni() {
  console.log('🚀 [BNI TEST] Memulai Pengujian Integrasi BNI SNAP API...');
  console.log('📌 BASE URL:', process.env.BNI_BASE_URL);
  console.log('📌 CLIENT ID:', process.env.BNI_CLIENT_ID);

  try {
    console.log('\n1️⃣ Testing Get B2B Access Token dari BNI API...');
    const tokenObj = await bniSnapService.getAccessToken();
    console.log('✅ Access Token Berhasil Diberikan BNI:', tokenObj.accessToken.substring(0, 30) + '...');
    console.log('⏱️ Expires In:', tokenObj.expiresIn, 'detik');

    console.log('\n2️⃣ Testing Create Virtual Account BNI...');
    const vaRes = await bniSnapService.createVirtualAccount({
      vaNumber: '12345678',
      customerName: 'Siswa Test Artanita',
      amount: 350000,
      description: 'Tes SPP BNI'
    });
    console.log('✅ Response Create VA BNI:', JSON.stringify(vaRes, null, 2));

  } catch (err) {
    console.log('\n⚠️ STATUS PENGUJIAN API BNI:');
    console.log('Detail Error:', err.message);
  }
}

testBni();
