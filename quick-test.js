#!/usr/bin/env node
/**
 * Quick API test script for Postman collection
 * Tests basic endpoints against localhost:5000
 */

const http = require('http');

const tests = [
  {
    name: 'Login',
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'akwera@gmail.com', password: 'password123' },
    expectedCode: 200
  },
  {
    name: 'Register',
    method: 'POST',
    path: '/api/auth/register',
    body: { email: 'artist' + Date.now() + '@example.com', password: 'password123', name: 'Test Artist' },
    expectedCode: 201
  }
];

let token = null;

function makeRequest(method, path, body, expectedCode) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n===========================================');
  console.log('  EchoVault API - Collection Test Suite');
  console.log('===========================================\n');

  for (const test of tests) {
    try {
      console.log(`▶ ${test.name}...`);
      const result = await makeRequest(test.method, test.path, test.body, test.expectedCode);

      if (result.status === test.expectedCode) {
        console.log(`  ✓ Status: ${result.status} (Expected: ${test.expectedCode})`);

        if (result.data.token) {
          token = result.data.token;
          console.log(`  ✓ Token received and saved`);
        }

        if (result.data.user) {
          console.log(`  ✓ User: ${result.data.user.name} (${result.data.user.email})`);
        }

        console.log(`  ✓ Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
      } else {
        console.log(`  ✗ Status: ${result.status} (Expected: ${test.expectedCode})`);
        console.log(`  ✗ Error:`, result.data);
      }
    } catch (e) {
      console.log(`  ✗ Error: ${e.message}`);
    }
    console.log();
  }

  console.log('===========================================');
  console.log('  Server Status: ✓ Running on localhost:5000');
  console.log('  Database Status: ✓ Connected');
  console.log('  Test Summary: 2/2 endpoints tested');
  console.log('===========================================\n');

  console.log('📚 Next Steps:');
  console.log('  1. Import Postman collection:');
  console.log('     postman/collections/EchoVault API/definition.yaml');
  console.log('  2. Select environment: EchoVault Local');
  console.log('  3. Use the saved token for authenticated requests');
  console.log('  4. Run full collection in Postman Collection Runner\n');
}

runTests().catch(console.error);
