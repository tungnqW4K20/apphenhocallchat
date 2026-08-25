const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { initDatabase, getMockStore } = require('./config/db');
const { setupSockets } = require('./sockets/socketHandler');
const seed = require('./seeders/seed');

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const swipeRoutes = require('./routes/swipes');
const chatRoutes = require('./routes/chat');
const callRoutes = require('./routes/calls');
const giftRoutes = require('./routes/gifts');
const walletRoutes = require('./routes/wallet');
const adminRoutes = require('./routes/admin');
const checkinRoutes = require('./routes/checkin');

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for dev / mobile / web
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads folder
const uploadsPath = path.join(__dirname, 'public/uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/swipes', swipeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/checkin', checkinRoutes);

// Health check & Server info
app.get(['/api/ping', '/ping'], (req, res) => {
  res.status(200).send('pong');
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    name: 'Dating & Video Call Chat Backend (Tinder + AyarChat API)'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Đã có lỗi máy chủ xảy ra'
  });
});

// Setup Real-time Sockets
setupSockets(io);

const PORT = process.env.PORT || 5000;

async function startServer() {
  await initDatabase();

  // Auto-seed if mock store has no users
  const store = getMockStore();
  if (!store.users || store.users.length === 0) {
    console.log('🔄 First run detected: Seeding initial data...');
    await seed();
  }

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Dating & Video Call Server running on port ${PORT}`);
    console.log(`🌐 REST API: http://localhost:${PORT}/api/health`);
    console.log(`⚡ Socket.io Real-time Signaling: Active`);
    console.log(`=======================================================`);
  });
}

startServer();
