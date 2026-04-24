const http = require('http');

// 1. Login and get token
const loginData = JSON.stringify({
  email: 'artist@gmail.com',
  password: '1234Abc!'
});

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

console.log('🎤 Attempting artist login...\n');

const loginReq = http.request(loginOptions, (loginRes) => {
  let loginBody = '';
  loginRes.on('data', chunk => loginBody += chunk);
  loginRes.on('end', () => {
    console.log(`✅ Login Response Status: ${loginRes.statusCode}`);
    
    try {
      const loginResponse = JSON.parse(loginBody);
      if (loginResponse.token) {
        const token = loginResponse.token;
        console.log(`✅ Token obtained: ${token.substring(0, 30)}...\n`);
        console.log(`📊 Artist User: ${loginResponse.user.email} (${loginResponse.user.role})`);
        process.exit(0);
      } else {
        console.error('❌ No token in response:', loginResponse);
        process.exit(1);
      }
    } catch (e) {
      console.error('❌ Failed to parse login response:', e);
      process.exit(1);
    }
  });
});

loginReq.on('error', err => {
  console.error('❌ Login request error:', err);
  process.exit(1);
});

loginReq.write(loginData);
loginReq.end();
