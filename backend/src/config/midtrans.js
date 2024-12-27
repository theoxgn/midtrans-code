// config/midtrans.js
const midtransClient = require('midtrans-client');

// Log configuration for debugging
console.log('Midtrans Environment:', {
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKeyExists: !!process.env.MIDTRANS_SERVER_KEY,
  clientKeyExists: !!process.env.MIDTRANS_CLIENT_KEY
});

// Create Core API instance with proper authentication
const core = new midtransClient.CoreApi({
  isProduction: false, // Set explicitly to false for sandbox
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// Test the configuration
core.transaction.status('dummy-order-id')
  .then(response => {
    console.log('Midtrans API Test - Response:', response);
  })
  .catch(error => {
    console.error('Midtrans API Test - Error:', {
      message: error.message,
      response: error.ApiResponse
    });
  });

module.exports = { core };