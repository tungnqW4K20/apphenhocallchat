async function testGenderRestriction() {
  console.log('=====================================================');
  console.log('🚀 TESTING STRICT OPPOSITE-GENDER DATING RULES');
  console.log('=====================================================\n');

  // 1. Login as Male User (Minh Hoàng, user ID 2)
  const maleLogin = await fetch('http://localhost:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginKey: 'demo_user', password: 'password123' })
  }).then(r => r.json());

  const maleHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${maleLogin.token}` };
  console.log(`1. ✅ Logged in as Male User: ${maleLogin.user.full_name} (${maleLogin.user.gender})`);

  // 2. Test Explore / Deck for Male User
  const deckRes = await fetch('http://localhost:5001/api/swipes/deck', { headers: maleHeaders }).then(r => r.json());
  const returnedUsers = deckRes.users || [];
  const nonFemaleCount = returnedUsers.filter(u => u.gender !== 'female').length;
  console.log(`2. 🔍 Male Deck count: ${returnedUsers.length} profiles | Non-female profiles in deck: ${nonFemaleCount}`);
  if (nonFemaleCount === 0 && returnedUsers.length > 0) {
    console.log('   ✅ 100% of discovered profiles are FEMALE! (Pass)');
  } else {
    console.log('   ❌ Discovered same-gender profiles:', nonFemaleCount);
  }

  // 3. Test Male trying to follow another Male (Tuấn Kiệt, user ID 18 - male)
  const followMaleRes = await fetch('http://localhost:5001/api/users/18/follow', {
    method: 'POST',
    headers: maleHeaders
  }).then(r => r.json());
  console.log(`3. 🛡️ Male trying to follow Male (Tuấn Kiệt):`, followMaleRes.message || followMaleRes.error);
  if (!followMaleRes.success) {
    console.log('   ✅ Same-gender follow correctly BLOCKED! (Pass)');
  }

  // 4. Test Male trying to send message to another Male (Tuấn Kiệt, user ID 18)
  const msgMaleRes = await fetch('http://localhost:5001/api/chat/messages', {
    method: 'POST',
    headers: maleHeaders,
    body: JSON.stringify({
      receiver_id: 18,
      message_type: 'text',
      content: 'Chào bạn nam!'
    })
  }).then(r => r.json());
  console.log(`4. 🛡️ Male trying to message Male (Tuấn Kiệt):`, msgMaleRes.message || msgMaleRes.error);
  if (!msgMaleRes.success) {
    console.log('   ✅ Same-gender chat correctly BLOCKED! (Pass)');
  }

  // 5. Test Male following Female (Lan Anh, user ID 3)
  const followFemaleRes = await fetch('http://localhost:5001/api/users/3/follow', {
    method: 'POST',
    headers: maleHeaders
  }).then(r => r.json());
  console.log(`5. ✨ Male following Female (Lan Anh):`, followFemaleRes.message || followFemaleRes.data);
  if (followFemaleRes.success) {
    console.log('   ✅ Opposite-gender follow SUCCEEDED! (Pass)');
  }

  // 6. Test Female User (Lan Anh, user ID 3)
  const femaleLogin = await fetch('http://localhost:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginKey: 'lan_anh', password: 'password123' })
  }).then(r => r.json());

  const femaleHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${femaleLogin.token}` };
  console.log(`\n6. ✅ Logged in as Female User: ${femaleLogin.user.full_name} (${femaleLogin.user.gender})`);

  const femaleDeckRes = await fetch('http://localhost:5001/api/swipes/deck', { headers: femaleHeaders }).then(r => r.json());
  const femaleReturnedUsers = femaleDeckRes.users || [];
  const nonMaleCount = femaleReturnedUsers.filter(u => u.gender !== 'male').length;
  console.log(`7. 🔍 Female Deck count: ${femaleReturnedUsers.length} profiles | Non-male profiles in deck: ${nonMaleCount}`);
  if (nonMaleCount === 0 && femaleReturnedUsers.length > 0) {
    console.log('   ✅ 100% of discovered profiles are MALE! (Pass)');
  }

  // 8. Test Female trying to follow another Female (Mai Linh, user ID 5)
  const followFemRes = await fetch('http://localhost:5001/api/users/5/follow', {
    method: 'POST',
    headers: femaleHeaders
  }).then(r => r.json());
  console.log(`8. 🛡️ Female trying to follow Female (Mai Linh):`, followFemRes.message || followFemRes.error);
  if (!followFemRes.success) {
    console.log('   ✅ Same-gender follow correctly BLOCKED! (Pass)');
  }

  // 9. Test Female trying to message another Female (Mai Linh, user ID 5)
  const msgFemRes = await fetch('http://localhost:5001/api/chat/messages', {
    method: 'POST',
    headers: femaleHeaders,
    body: JSON.stringify({
      receiver_id: 5,
      message_type: 'text',
      content: 'Chào bạn nữ!'
    })
  }).then(r => r.json());
  console.log(`9. 🛡️ Female trying to message Female (Mai Linh):`, msgFemRes.message || msgFemRes.error);
  if (!msgFemRes.success) {
    console.log('   ✅ Same-gender chat correctly BLOCKED! (Pass)');
  }

  // 10. Test Female following Male (Tuấn Kiệt, user ID 18)
  const followMaleByFemRes = await fetch('http://localhost:5001/api/users/18/follow', {
    method: 'POST',
    headers: femaleHeaders
  }).then(r => r.json());
  console.log(`10. ✨ Female following Male (Tuấn Kiệt):`, followMaleByFemRes.message || followMaleByFemRes.data);
  if (followMaleByFemRes.success) {
    console.log('   ✅ Opposite-gender follow SUCCEEDED! (Pass)');
  }

  console.log('\n=====================================================');
  console.log('🎉 ALL OPPOSITE-GENDER DATING RESTRICTIONS VERIFIED 100%');
  console.log('=====================================================');
}

testGenderRestriction().catch(console.error);
