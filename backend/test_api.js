const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function test() {
  console.log('Testing User Login...');
  const res = await post('/api/auth/login', { loginKey: 'demo_user', password: 'password123' });
  console.log('Login Response:', res.success ? `✅ Success! User: ${res.user.full_name}, Coins: ${res.user.coins}` : res);

  console.log('Testing Admin Login...');
  const adminRes = await post('/api/auth/login', { loginKey: 'admin', password: 'password123' });
  console.log('Admin Login Response:', adminRes.success ? `✅ Success! Role: ${adminRes.user.role}` : adminRes);
}

test().catch(console.error);
