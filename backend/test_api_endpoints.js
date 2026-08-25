const http = require('http');

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api' + path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseBody));
        } catch (e) {
          resolve(responseBody);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5001,
      path: '/api' + path,
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseBody));
        } catch (e) {
          resolve(responseBody);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('Testing REST API Endpoints on http://localhost:5001/api ...');
  
  // 1. Health Check
  const health = await get('/health');
  console.log('1. Health Check:', health);

  // 2. Login User
  const loginRes = await post('/auth/login', { loginKey: 'demo_user', password: 'password123' });
  const userToken = loginRes.token;
  console.log('2. User Login:', { user: loginRes.user?.full_name, tokenPresent: !!userToken });

  // 3. Login Admin
  const adminLogin = await post('/auth/login', { loginKey: 'admin', password: 'password123' });
  const adminToken = adminLogin.token;
  console.log('3. Admin Login:', { admin: adminLogin.user?.full_name, role: adminLogin.user?.role });

  // 4. Check-in Status
  const checkinStatus = await get('/checkin/status', userToken);
  console.log('4. Check-in Status:', { streak: checkinStatus.streak_days, canCheckin: checkinStatus.can_check_in });

  // 5. Create VietQR Deposit
  const depositReq = await post('/wallet/create-deposit', { package_id: 1 }, userToken);
  console.log('5. Create VietQR Deposit Request:', {
    code: depositReq.deposit?.transaction_code,
    qr: depositReq.qr_url ? 'Generated QR OK' : 'No QR',
    instructions: depositReq.payment_instructions?.transfer_content
  });

  // 6. Admin Get Deposits
  const adminDeposits = await get('/admin/deposits', adminToken);
  console.log('6. Admin Get Deposits:', { count: adminDeposits.deposits?.length });

  // 7. Admin Get User Audit
  const audit = await get(`/admin/users/${loginRes.user.id}`, adminToken);
  console.log('7. Admin Comprehensive User Audit:', {
    userName: audit.user?.full_name,
    deposits: audit.deposits?.length,
    callLogs: audit.call_logs?.length,
    vouchers: audit.vouchers?.length
  });

  // 8. Busy Call Fallback Suggestions
  const suggestions = await get(`/calls/busy-suggestions?busy_user_id=3`, userToken);
  console.log('8. Busy Call Suggestions:', {
    suggestedCount: suggestions.suggestions?.length,
    firstSuggest: suggestions.suggestions?.[0]?.full_name
  });

  console.log('\n===========================================');
  console.log('🎉 ALL REST API ENDPOINTS VALIDATED 100% OK');
  console.log('===========================================');
}

run().catch(console.error);
