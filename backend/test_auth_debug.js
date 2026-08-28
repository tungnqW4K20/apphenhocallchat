async function testAuth(baseUrl) {
  console.log(`\n================ Testing Auth on ${baseUrl} ================`);
  const testUser = {
    username: 'testuser_' + Date.now().toString().slice(-6),
    email: `test_${Date.now().toString().slice(-6)}@example.com`,
    password: 'Password123!',
    full_name: 'Test Full Name',
    gender: 'male',
    age: 23,
    city: 'Hà Nội'
  };

  console.log('1. Registering new user:', testUser.username, testUser.email);
  try {
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const regData = await regRes.json();
    console.log('Register response status:', regRes.status);
    console.log('Register response body:', regData);

    if (!regData.success) {
      console.error('❌ Register failed!');
      return;
    }

    console.log('\n2. Logging in with Username:', testUser.username);
    const loginUserRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginKey: testUser.username,
        password: testUser.password
      })
    });
    const loginUserData = await loginUserRes.json();
    console.log('Login with Username status:', loginUserRes.status);
    console.log('Login with Username body:', loginUserData);

    console.log('\n3. Logging in with Email:', testUser.email);
    const loginEmailRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginKey: testUser.email,
        password: testUser.password
      })
    });
    const loginEmailData = await loginEmailRes.json();
    console.log('Login with Email status:', loginEmailRes.status);
    console.log('Login with Email body:', loginEmailData);

  } catch (err) {
    console.error('Test Auth Exception:', err.message);
  }
}

async function run() {
  await testAuth('http://localhost:5001/api');
  await testAuth('https://dating-backend-islg.onrender.com/api');
}

run();
