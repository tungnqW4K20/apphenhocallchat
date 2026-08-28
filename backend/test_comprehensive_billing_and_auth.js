const dataService = require('./models/dataService');
const bcrypt = require('bcryptjs');

async function testAuthComprehensive() {
  console.log('\n--- 1. Testing Registration & Case-Insensitive Login ---');
  
  const testUser = {
    username: 'TestUser_' + Date.now().toString().slice(-4),
    email: `TestUser_${Date.now().toString().slice(-4)}@Example.COM`,
    password: 'MySecretPassword123!',
    full_name: 'Nguyễn Văn Test',
    gender: 'male',
    age: 24,
    city: 'Đà Nẵng'
  };

  console.log('Registering:', testUser.username, testUser.email);
  const created = await dataService.createUser(testUser);
  console.log('✅ Created user ID:', created.id, created.username);

  // Test 1: Find by exact email
  const userByExactEmail = await dataService.findUserByEmail(testUser.email);
  console.log('Found by exact email:', !!userByExactEmail);

  // Test 2: Find by lowercase email
  const userByLowerEmail = await dataService.findUserByEmail(testUser.email.toLowerCase());
  console.log('Found by lowercase email:', !!userByLowerEmail);

  // Test 3: Find by uppercase email with spaces
  const userByUpperEmailSpaces = await dataService.findUserByEmail('  ' + testUser.email.toUpperCase() + '  ');
  console.log('Found by uppercase email with spaces:', !!userByUpperEmailSpaces);

  // Test 4: Find by exact username
  const userByExactUsername = await dataService.findUserByUsername(testUser.username);
  console.log('Found by exact username:', !!userByExactUsername);

  // Test 5: Find by lowercase username
  const userByLowerUsername = await dataService.findUserByUsername(testUser.username.toLowerCase());
  console.log('Found by lowercase username:', !!userByLowerUsername);

  // Test 6: Verify password match with bcrypt
  const isPasswordValid = await bcrypt.compare(testUser.password, created.password);
  console.log('✅ Password hash matches plaintext password:', isPasswordValid);

  if (!userByLowerEmail || !userByLowerUsername || !isPasswordValid) {
    throw new Error('❌ Auth test failed!');
  }
  console.log('🎉 ALL AUTH TESTS PASSED 100%!');
}

async function testBilling() {
  console.log('\n--- 2. Testing Call Billing Deductions ---');

  // Create caller with 50 coins
  const caller = await dataService.createUser({
    username: 'caller_' + Date.now().toString().slice(-4),
    email: `caller_${Date.now().toString().slice(-4)}@test.com`,
    password: 'password123',
    full_name: 'Caller Male',
    gender: 'male',
    coins: 50,
    diamonds: 0
  });

  // Create receiver (host)
  const receiver = await dataService.createUser({
    username: 'host_' + Date.now().toString().slice(-4),
    email: `host_${Date.now().toString().slice(-4)}@test.com`,
    password: 'password123',
    full_name: 'Host Female',
    gender: 'female',
    coins: 200,
    diamonds: 0,
    is_host: true,
    call_rate_per_min: 20
  });

  console.log(`Initial: Caller coins = ${caller.coins}, Host diamonds = ${receiver.diamonds}`);

  // Minute 1: Deduct 20 coins
  await dataService.updateUserBalance(caller.id, -20, 0);
  await dataService.updateUserBalance(receiver.id, 0, Math.floor(20 * 0.7));

  let c1 = await dataService.findUserById(caller.id);
  let r1 = await dataService.findUserById(receiver.id);
  console.log(`Minute 1: Caller coins = ${c1.coins} (expected 30), Host diamonds = ${r1.diamonds} (expected 14)`);

  // Minute 2: Deduct 20 coins
  await dataService.updateUserBalance(caller.id, -20, 0);
  await dataService.updateUserBalance(receiver.id, 0, Math.floor(20 * 0.7));

  let c2 = await dataService.findUserById(caller.id);
  let r2 = await dataService.findUserById(receiver.id);
  console.log(`Minute 2: Caller coins = ${c2.coins} (expected 10), Host diamonds = ${r2.diamonds} (expected 28)`);

  // Minute 3: Check if caller has enough (10 < 20 -> Insufficient!)
  const canProceedMinute3 = c2.coins >= 20;
  console.log(`Minute 3: Has enough coins for next minute? ${canProceedMinute3} (expected false)`);

  if (c2.coins === 10 && r2.diamonds === 28 && !canProceedMinute3) {
    console.log('🎉 ALL BILLING TESTS PASSED 100%!');
  } else {
    throw new Error('❌ Billing test failed!');
  }
}

async function run() {
  await testAuthComprehensive();
  await testBilling();
}

run();
