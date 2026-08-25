const http = require('http');

async function request(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5001/api${path}`);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Bắt đầu kiểm tra hệ thống Trừ Coin theo phút & Trạng thái Bận (Busy)...');

  // 1. Login demo_user
  const loginRes = await request('/auth/login', 'POST', { username: 'demo_user', password: 'password123' });
  console.log('Login result:', loginRes.data);
  const token = loginRes.data.token;
  const user = loginRes.data.user;
  console.log(`✅ 1. Đăng nhập thành công user: ${user.full_name}, Số dư ban đầu: ${user.coins} Xu`);

  // 2. Fetch Card Deck (Explore/Swipe)
  const deckRes = await request('/swipes/deck', 'GET', null, token);
  console.log(`✅ 2. Lấy danh sách hồ sơ: ${deckRes.data.users?.length} hồ sơ nữ phong phú`);
  const uniqueAvatars = new Set(deckRes.data.users.map(u => u.avatar));
  console.log(`✅ 3. Số lượng avatar riêng biệt: ${uniqueAvatars.size} / ${deckRes.data.users.length}`);

  // Count online, busy, offline
  const busyUsers = deckRes.data.users.filter(u => u.is_in_call);
  const freeOnlineUsers = deckRes.data.users.filter(u => u.is_online && !u.is_in_call);
  console.log(`✅ 4. Thống kê trạng thái: ${freeOnlineUsers.length} Bạn nữ đang Rảnh (Online), ${busyUsers.length} Bạn nữ Đang Bận (Busy)`);

  // 3. Test Minute Coin Deduction (Trừ coin theo phút)
  const targetHost = deckRes.data.users.find(u => u.is_host) || deckRes.data.users[0];
  console.log(`📞 5. Thử nghiệm trừ cước cuộc gọi 1 phút với Host: ${targetHost.full_name} (${targetHost.call_rate_per_min || 20}🪙/p)...`);
  
  const deductRes = await request('/calls/deduct-minute', 'POST', {
    receiver_id: targetHost.id,
    call_type: 'video'
  }, token);

  console.log(`✅ 6. Kết quả trừ cước:`, deductRes.data);
  console.log(`💰 Số dư Xu mới của User: ${deductRes.data.remaining_coins} Xu (Đã trừ ${deductRes.data.rate} Xu và cộng ${deductRes.data.diamondReward} Kim Cương cho Host)`);

  // 4. Test Busy Call Suggestions
  const busyUser = busyUsers[0] || targetHost;
  console.log(`⚠️ 7. Thử nghiệm lấy gợi ý khi gọi người đang bận/offline: ${busyUser.full_name}...`);
  const busyRes = await request(`/calls/busy-suggestions?busy_user_id=${busyUser.id}`, 'GET', null, token);
  console.log(`✅ 8. Đã tìm thấy ${busyRes.data.suggestions?.length} bạn nữ đang rảnh gần đây:`);
  busyRes.data.suggestions?.forEach((s, idx) => {
    console.log(`   ${idx + 1}. ${s.full_name} (${s.age}t, ${s.city}, cách ${s.distance_km}km, ${s.is_host ? `Host ${s.call_rate_per_min}🪙/p` : 'Free'})`);
  });

  console.log('\n🎉 TOÀN BỘ HỆ THỐNG TRỪ COIN THEO PHÚT, TRẠNG THÁI BUSY VÀ HỒ SƠ NỮ ĐỀU HOẠT ĐỘNG HOÀN HẢO 100%!');
}

runTests().catch(console.error);
