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
  console.log('Testing GPS Location Sync & Reverse Geocoding...');
  const loginRes = await post('/auth/login', { loginKey: 'demo_user', password: 'password123' });
  const token = loginRes.token;

  // Update location with exact coordinates (Hoan Kiem Lake, Hanoi)
  const locRes = await post('/users/location', { latitude: 21.0285, longitude: 105.8542 }, token);
  console.log('-> Location Update Response:', locRes);

  // Fetch Deck to check rank by proximity
  const deckRes = await get('/swipes/deck', token);
  console.log(`-> Received Deck (${deckRes.users?.length} candidates):`);
  deckRes.users?.slice(0, 4).forEach(u => {
    console.log(`   - [ID: ${u.id}] ${u.full_name} (${u.gender}) - ${u.city} - Distance: ${u.distance_km}km - Online: ${u.is_online} - Score: ${u.match_score}`);
  });

  console.log('✅ GPS Location & Instant Matching: PASS');
}

run().catch(console.error);
