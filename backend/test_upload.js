const fs = require('fs');
const path = require('path');

async function testUpload() {
  // 1. Login
  const loginRes = await fetch('http://localhost:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginKey: 'demo_user', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('Login status:', loginData.success, 'User:', loginData.user?.full_name);

  // 2. Create sample image buffer
  const sampleBuf = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const blob = new Blob([sampleBuf], { type: 'image/png' });
  const form = new FormData();
  form.append('file', blob, 'test.png');

  // 3. Upload to /api/chat/upload
  const uploadRes = await fetch('http://localhost:5001/api/chat/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form
  });
  const uploadData = await uploadRes.json();
  console.log('Upload result:', uploadData);

  // 4. Send Message with Image
  const msgRes = await fetch('http://localhost:5001/api/chat/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      conversation_id: 1,
      receiver_id: 3,
      message_type: 'image',
      content: uploadData.url || uploadData.mediaUrl
    })
  });
  const msgData = await msgRes.json();
  console.log('Send Image Message Result:', msgData);
}

testUpload();
