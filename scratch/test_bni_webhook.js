require('dotenv').config({ path: __dirname + '/../.env' });
const { handleBniWebhook } = require('../src/controllers/bniWebhook.controller');

async function testWebhookSimulation() {
  console.log('🧪 [WEBHOOK TEST] Memulai Simulasi Webhook Pembayaran BNI...');

  const reqMock = {
    headers: {
      'x-timestamp': new Date().toISOString(),
      'x-signature': 'SIMULATED_TEST_SIGNATURE',
      'authorization': 'Bearer TEST_TOKEN'
    },
    body: {
      virtualAccountNo: '88812345',
      amount: { value: '350000.00', currency: 'IDR' },
      paymentRequestId: 'SIM-PAY-001',
      trxId: 'REQ-1234567'
    }
  };

  const resMock = {
    status: function(statusCode) {
      console.log('📌 HTTP Response Code:', statusCode);
      return this;
    },
    json: function(data) {
      console.log('📌 Response JSON:', JSON.stringify(data, null, 2));
      return this;
    }
  };

  await handleBniWebhook(reqMock, resMock);
}

testWebhookSimulation();
