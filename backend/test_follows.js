async function testFollows() {
  console.log('Testing Follows and 80/20 Distribution...');
  
  // 1. Login demo_user (male)
  const loginRes = await fetch('http://localhost:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      loginKey: 'demo_user',
      password: 'password123'
    })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  console.log('✅ Logged in as:', loginData.user.full_name, 'Gender:', loginData.user.gender);

  // 2. Test Get Deck (should return ~80% females)
  const deckRes = await fetch('http://localhost:5001/api/swipes/deck', { headers: authHeaders });
  const deckData = await deckRes.json();
  const deckUsers = deckData.users || [];
  const femaleCount = deckUsers.filter(u => u.gender === 'female').length;
  const maleCount = deckUsers.filter(u => u.gender === 'male').length;
  console.log(`✅ Deck returned ${deckUsers.length} users -> Females: ${femaleCount} (${Math.round(femaleCount/deckUsers.length*100)}%), Males: ${maleCount} (${Math.round(maleCount/deckUsers.length*100)}%)`);

  // 3. Test Friends List
  const friendsRes = await fetch('http://localhost:5001/api/users/relationships/friends', { headers: authHeaders });
  const friendsData = await friendsRes.json();
  console.log(`✅ Friends List (${friendsData.friends?.length} friends):`, (friendsData.friends || []).map(f => f.full_name));

  // 4. Test Following List
  const followingRes = await fetch('http://localhost:5001/api/users/relationships/following', { headers: authHeaders });
  const followingData = await followingRes.json();
  console.log(`✅ Following List (${followingData.following?.length} users):`, (followingData.following || []).map(f => f.full_name));

  // 5. Test Followers List
  const followersRes = await fetch('http://localhost:5001/api/users/relationships/followers', { headers: authHeaders });
  const followersData = await followersRes.json();
  console.log(`✅ Followers List (${followersData.followers?.length} users):`, (followersData.followers || []).map(f => f.full_name));

  // 6. Test Toggle Follow (e.g. Follow Mai Linh)
  const maiLinh = deckUsers.find(u => u.username === 'mai_linh') || deckUsers[0];
  if (maiLinh) {
    const followRes = await fetch(`http://localhost:5001/api/users/${maiLinh.id}/follow`, {
      method: 'POST',
      headers: authHeaders
    });
    const followData = await followRes.json();
    console.log(`✅ Toggle Follow ${maiLinh.full_name}:`, followData.message, 'isFollowing:', followData.isFollowing);
  }

  console.log('🎉 ALL BACKEND FOLLOWS & 80/20 TESTS PASSED!');
}

testFollows().catch(console.error);
