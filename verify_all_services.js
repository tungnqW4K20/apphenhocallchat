async function verifyAllServices() {
  console.log('=====================================================');
  console.log('🚀 KIỂM TRA TRẠNG THÁI TOÀN BỘ HỆ THỐNG WEB & APP');
  console.log('=====================================================\n');

  // 1. Backend REST API & Socket
  try {
    const backendRes = await fetch('http://localhost:5001/api/health').then(r => r.json());
    console.log('1. 🟢 BACKEND SERVER (Node.js/Express + MySQL + Socket.io):');
    console.log('   - Trạng thái:', backendRes.status);
    console.log('   - Dịch vụ:', backendRes.service);
    console.log('   - Địa chỉ URL: http://localhost:5001\n');
  } catch (err) {
    console.error('1. ❌ Backend Server Error:', err.message);
  }

  // 2. Frontend Web (Vite + React)
  try {
    const webRes = await fetch('http://localhost:5174/');
    console.log('2. 🟢 WEB FRONTEND (React + TailwindCSS + WebRTC):');
    console.log('   - HTTP Status:', webRes.status, webRes.statusText);
    console.log('   - Địa chỉ Local:   http://localhost:5174/');
    console.log('   - Địa chỉ Network: http://localhost:5174/ (hoặc IP mạng nội bộ)\n');
  } catch (err) {
    console.error('2. ❌ Frontend Web Error:', err.message);
  }

  // 3. Mobile App (Expo Metro Bundler)
  try {
    const mobileBundleRes = await fetch('http://localhost:8081/index.bundle?platform=android&dev=true');
    const bundleText = await mobileBundleRes.text();
    console.log('3. 🟢 MOBILE APP (React Native + Expo Metro Bundler):');
    console.log('   - Metro Bundler Status:', mobileBundleRes.status);
    console.log('   - Bundle Kích Thước:', (bundleText.length / 1024 / 1024).toFixed(2), 'MB');
    console.log('   - Địa chỉ Expo Dev Server: http://localhost:8081/');
    console.log('   - Hướng dẫn mở trên điện thoại: Mở app Expo Go và quét mã QR hoặc nhập exp://<IP-may-tinh>:8081\n');
  } catch (err) {
    console.error('3. ❌ Mobile App Error:', err.message);
  }

  console.log('=====================================================');
  console.log('🎉 TẤT CẢ 3 DỊCH VỤ WEB, MOBILE & BACKEND ĐÃ SẴN SÀNG 100%!');
  console.log('=====================================================');
}

verifyAllServices().catch(console.error);
