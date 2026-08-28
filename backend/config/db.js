const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let useFallbackDb = false;

// Fallback In-Memory / File Persistent Store
const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let mockStore = {
  users: [],
  user_photos: [],
  swipes: [],
  matches: [],
  conversations: [],
  messages: [],
  gifts: [],
  call_logs: [],
  coin_packages: [],
  transactions: [],
  verifications: [],
  reports: [],
  deposits: [],
  vouchers: [],
  daily_checkins: [],
  system_settings: {
    call_rate_per_min: '20',
    free_daily_matches: '10',
    diamond_to_vnd_rate: '1000',
    vip_silver_price: '500',
    vip_gold_price: '1200',
    vip_platinum_price: '2500',
    bank_name: 'MBBank',
    bank_account: '999988886666',
    bank_holder: 'CONG TY CP AYARFLAME VIETNAM',
    vietqr_template: 'compact2',
    message_fee_coins: '10',
    host_revenue_share: '70'
  },
  autoIncrementIds: {
    users: 1,
    user_photos: 1,
    swipes: 1,
    matches: 1,
    conversations: 1,
    messages: 1,
    gifts: 1,
    call_logs: 1,
    coin_packages: 1,
    transactions: 1,
    verifications: 1,
    reports: 1,
    deposits: 1,
    vouchers: 1,
    daily_checkins: 1
  }
};

function recalculateAutoIncrementIds() {
  const collections = [
    'users', 'user_photos', 'swipes', 'matches', 'conversations',
    'messages', 'gifts', 'call_logs', 'coin_packages', 'transactions',
    'verifications', 'reports', 'deposits', 'vouchers', 'daily_checkins'
  ];
  if (!mockStore.autoIncrementIds) {
    mockStore.autoIncrementIds = {};
  }
  for (const col of collections) {
    const list = Array.isArray(mockStore[col]) ? mockStore[col] : [];
    const maxId = list.reduce((max, item) => (item && Number(item.id) > max ? Number(item.id) : max), 0);
    mockStore.autoIncrementIds[col] = Math.max(maxId + 1, Number(mockStore.autoIncrementIds[col]) || 1);
  }
}

if (fs.existsSync(DATA_FILE)) {
  try {
    const loadedData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    mockStore = { ...mockStore, ...loadedData };
    recalculateAutoIncrementIds();
  } catch (err) {
    console.error('Error loading fallback store:', err);
  }
} else {
  recalculateAutoIncrementIds();
}

function saveStore() {
  if (useFallbackDb || !pool) {
    try {
      recalculateAutoIncrementIds();
      fs.writeFileSync(DATA_FILE, JSON.stringify(mockStore, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving fallback store:', e);
    }
  }
}

async function initDatabase() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'dating_callchat',
      port: Number(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true
    });

    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL Database successfully!');
    
    // Auto-run schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      
      // Auto-migrate new columns
      try {
        await connection.query("ALTER TABLE messages ADD COLUMN is_recalled BOOLEAN DEFAULT FALSE;");
      } catch (e) {}
      try {
        await connection.query("ALTER TABLE deposits ADD COLUMN payment_method VARCHAR(100) DEFAULT 'VietQR Banking';");
      } catch (e) {}
      try {
        await connection.query("ALTER TABLE deposits ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;");
      } catch (e) {}

      console.log('✅ Database schema verified & synced.');
    }
    connection.release();
    useFallbackDb = false;
  } catch (error) {
    console.warn('⚠️ Could not connect to MySQL server (' + error.message + ').');
    console.log('🔄 Activating Dual-Engine Smart Storage (Auto-persisting to JSON store)...');
    useFallbackDb = true;
  }
}

// Universal Query Helper
async function query(sql, params = []) {
  if (!useFallbackDb && pool) {
    try {
      const [results] = await pool.query(sql, params);
      return results;
    } catch (err) {
      console.error('MySQL query error:', err.message);
      throw err;
    }
  } else {
    // Fallback Query Engine for Mock Store
    return executeMockQuery(sql, params);
  }
}

function executeMockQuery(sql, params) {
  // Simple Mock Engine dispatcher
  return { mockStore, saveStore };
}

module.exports = {
  initDatabase,
  query,
  getMockStore: () => mockStore,
  saveStore,
  isUsingFallback: () => useFallbackDb || !pool
};
