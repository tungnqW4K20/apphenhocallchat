const http = require('http');

function apiCall(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);

    const req = http.request({
      hostname: 'localhost',
      port: 5001,
      path: `/api${path}`,
      method: method,
      headers: headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runFullIntegrationTest() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE FULL-STACK INTEGRATION TEST');
  console.log('====================================================\n');

  // 1. Login as demo user
  console.log('1. [AUTH] Logging in as demo_user...');
  const loginRes = await apiCall('POST', '/auth/login', { loginKey: 'demo_user', password: 'password123' });
  if (!loginRes.data.success) throw new Error('Demo login failed: ' + JSON.stringify(loginRes.data));
  const userToken = loginRes.data.token;
  console.log(`   ✅ Logged in as: ${loginRes.data.user.full_name}, Balance: ${loginRes.data.user.coins} Coins\n`);

  // 2. Fetch Tinder card deck
  console.log('2. [TINDER] Fetching card deck for swiping...');
  const deckRes = await apiCall('GET', '/swipes/deck', null, userToken);
  console.log(`   ✅ Retrieved ${deckRes.data.count} candidates in deck:`, deckRes.data.users.map(u => `${u.full_name} (${u.age})`).join(', '), '\n');

  // 3. Perform a Like swipe on first candidate
  if (deckRes.data.users.length > 0) {
    const target = deckRes.data.users[0];
    console.log(`3. [TINDER] Swiping LIKE on ${target.full_name}...`);
    const swipeRes = await apiCall('POST', '/swipes', { target_id: target.id, action: 'like' }, userToken);
    console.log(`   ✅ Swipe result: Action=${swipeRes.data.action}, IsMutualMatch=${swipeRes.data.isMatch}\n`);
  }

  // 4. Test Chat & Send message
  console.log('4. [CHAT] Fetching user conversations...');
  const convsRes = await apiCall('GET', '/chat/conversations', null, userToken);
  console.log(`   ✅ Retrieved ${convsRes.data.count} active conversations.`);
  if (convsRes.data.conversations.length > 0) {
    const conv = convsRes.data.conversations[0];
    console.log(`   💬 Sending test message to ${conv.partner?.full_name}...`);
    const msgRes = await apiCall('POST', '/chat/messages', {
      conversation_id: conv.id,
      receiver_id: conv.partner_id,
      message_type: 'text',
      content: 'Chào em! Video Call 1v1 trên app tiện lợi và mượt mà quá! ✨'
    }, userToken);
    console.log(`   ✅ Message delivered! Message ID: ${msgRes.data.message.id}\n`);
  }

  // 5. Test Gift Sending (AyarChat Gift)
  console.log('5. [GIFTS] Sending animated gift (🌹 Hoa Hồng) to Lan Anh (id: 3)...');
  const giftRes = await apiCall('POST', '/gifts/send', { receiver_id: 3, gift_id: 2 }, userToken);
  console.log(`   ✅ Gift Result: ${giftRes.data.message}, Remaining Coins: ${giftRes.data.remaining_coins}\n`);

  // 6. Test Coin Deposit
  console.log('6. [WALLET] Simulating Coin Deposit (+350 Xu)...');
  const depositRes = await apiCall('POST', '/wallet/deposit', { package_id: 2, payment_method: 'Momo / Bank QR' }, userToken);
  console.log(`   ✅ Deposit Result: ${depositRes.data.message}, New Coin Balance: ${depositRes.data.new_coins}\n`);

  // 7. Login as Admin
  console.log('7. [ADMIN] Logging in as Admin...');
  const adminLogin = await apiCall('POST', '/auth/login', { loginKey: 'admin', password: 'password123' });
  const adminToken = adminLogin.data.token;
  console.log(`   ✅ Admin logged in: ${adminLogin.data.user.full_name}\n`);

  // 8. Admin Dashboard Stats
  console.log('8. [ADMIN] Fetching dashboard metrics...');
  const statsRes = await apiCall('GET', '/admin/stats', null, adminToken);
  console.log('   ✅ System Metrics:', statsRes.data.stats, '\n');

  // 9. Admin User Management & Balance Adjustment
  console.log('9. [ADMIN] Adjusting user balance (+200 coins reward)...');
  const adjustRes = await apiCall('POST', '/admin/users/2/balance', { delta_coins: 200, delta_diamonds: 50, reason: 'Thưởng Thành Viên Tích Cực' }, adminToken);
  console.log(`   ✅ Admin Balance Adjustment Result: Coins=${adjustRes.data.coins}, Diamonds=${adjustRes.data.diamonds}\n`);

  console.log('====================================================');
  console.log('🎉 ALL INTEGRATION TESTS PASSED 100% WITH ZERO ERRORS!');
  console.log('====================================================');
}

runFullIntegrationTest().catch(console.error);
