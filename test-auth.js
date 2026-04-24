const http = require('http');

// 1. Login and get token
const loginData = JSON.stringify({
  email: 'akwera@gmail.com',
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

console.log('🔓 Attempting login with admin credentials...\n');

const loginReq = http.request(loginOptions, (loginRes) => {
  let loginBody = '';
  loginRes.on('data', chunk => loginBody += chunk);
  loginRes.on('end', () => {
    console.log(`✅ Login Response Status: ${loginRes.statusCode}`);
    console.log(`Response:`, loginBody);
    
    try {
      const loginResponse = JSON.parse(loginBody);
      if (loginResponse.token) {
        const token = loginResponse.token;
        console.log(`\n✅ Token obtained: ${token.substring(0, 30)}...\n`);
        
        // 2. Use token to fetch admin dashboard
        const dashboardOptions = {
          hostname: 'localhost',
          port: 5000,
          path: '/api/admin/dashboard',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };
        
        console.log('📊 Fetching admin dashboard with token...\n');
        
        const dashReq = http.request(dashboardOptions, (dashRes) => {
          let dashBody = '';
          dashRes.on('data', chunk => dashBody += chunk);
          dashRes.on('end', () => {
            console.log(`✅ Dashboard Response Status: ${dashRes.statusCode}`);
            console.log(`Response:`, dashBody);
            process.exit(0);
          });
        });
        
        dashReq.on('error', err => {
          console.error('❌ Dashboard request error:', err);
          process.exit(1);
        });
        
        dashReq.end();
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
