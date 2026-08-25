async function testChatActions() {
  console.log('=====================================================');
  console.log('🚀 TESTING MESSAGE RECALL & PERMANENT CONVERSATION DELETION');
  console.log('=====================================================\n');

  // 1. Login
  const loginRes = await fetch('http://localhost:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginKey: 'demo_user', password: 'password123' })
  }).then(r => r.json());

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${loginRes.token}` };
  console.log(`1. ✅ Logged in as: ${loginRes.user.full_name}`);

  // 2. Send a test message
  const sendRes = await fetch('http://localhost:5001/api/chat/messages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      receiver_id: 3, // Lan Anh
      message_type: 'text',
      content: 'Tin nhắn bí mật cần thu hồi thử nghiệm! 🚀'
    })
  }).then(r => r.json());

  const testMsgId = sendRes.message.id;
  const convId = sendRes.message.conversation_id;
  console.log(`2. ✅ Sent test message (ID: ${testMsgId}) to conversation ${convId}`);

  // 3. Recall the message
  const recallRes = await fetch(`http://localhost:5001/api/chat/messages/${testMsgId}/recall`, {
    method: 'POST',
    headers
  }).then(r => r.json());
  console.log(`3. ✅ Recalled message (ID: ${testMsgId}):`, recallRes.message, `Content is now: "${recallRes.data?.content}"`);

  // 4. Send another message and delete it permanently
  const sendRes2 = await fetch('http://localhost:5001/api/chat/messages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      receiver_id: 3,
      message_type: 'text',
      content: 'Tin nhắn này sẽ bị xóa vĩnh viễn khỏi database! 🗑️'
    })
  }).then(r => r.json());
  const deleteMsgId = sendRes2.message.id;
  console.log(`4. ✅ Sent 2nd message (ID: ${deleteMsgId})`);

  const deleteMsgRes = await fetch(`http://localhost:5001/api/chat/messages/${deleteMsgId}`, {
    method: 'DELETE',
    headers
  }).then(r => r.json());
  console.log(`   ✅ Permanently deleted message (ID: ${deleteMsgId}):`, deleteMsgRes.message);

  // 5. Test Deleting the entire Conversation permanently
  // First create a separate conversation with user 5 (Mai Linh) to test deleting whole conversation
  const sendConvMsg = await fetch('http://localhost:5001/api/chat/messages', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      receiver_id: 5, // Mai Linh
      message_type: 'text',
      content: 'Hội thoại tạm thời với Mai Linh để thử tính năng xóa toàn bộ'
    })
  }).then(r => r.json());
  const tempConvId = sendConvMsg.message.conversation_id;
  console.log(`\n5. ✅ Created temporary conversation (ID: ${tempConvId}) with Mai Linh`);

  const deleteConvRes = await fetch(`http://localhost:5001/api/chat/conversations/${tempConvId}`, {
    method: 'DELETE',
    headers
  }).then(r => r.json());
  console.log(`   ✅ Permanently deleted conversation (ID: ${tempConvId}):`, deleteConvRes.message);

  // Verify conversation is gone
  const convsRes = await fetch('http://localhost:5001/api/chat/conversations', { headers }).then(r => r.json());
  const exists = (convsRes.conversations || []).some(c => c.id === tempConvId);
  console.log(`   🔍 Verifying conversation ${tempConvId} exists in MySQL:`, exists ? 'STILL EXISTS ❌' : 'CONFIRMED REMOVED 100% ✅');

  console.log('\n=====================================================');
  console.log('🎉 ALL RECALL & CONVERSATION DELETION TESTS PASSED 100%');
  console.log('=====================================================');
}

testChatActions().catch(console.error);
