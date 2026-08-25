const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  isLocal ? 'http://localhost:5001/api' : 'https://dating-backend-islg.onrender.com/api'
);

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('dating_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Lỗi yêu cầu: ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),

  // Users & Explore
  getUserDetails: (id) => request(`/users/${id}`),
  updateLocation: (coords) => request('/users/location', { method: 'POST', body: JSON.stringify(coords) }),
  getNearbyUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users/nearby?${query}`);
  },
  toggleFollow: (targetId) => request(`/users/${targetId}/follow`, { method: 'POST' }),
  getFriends: () => request('/users/relationships/friends'),
  getFollowing: () => request('/users/relationships/following'),
  getFollowers: () => request('/users/relationships/followers'),
  uploadPhoto: (formData) => request('/users/photos', { method: 'POST', body: formData }),
  deletePhoto: (photoId) => request(`/users/photos/${photoId}`, { method: 'DELETE' }),
  requestVerification: (data) => request('/users/verification', { method: 'POST', body: JSON.stringify(data) }),
  reportUser: (data) => request('/users/report', { method: 'POST', body: JSON.stringify(data) }),

  // Tinder Swipes & Matches
  getCardDeck: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/swipes/deck?${query}`);
  },
  swipe: (targetId, action) => request('/swipes', { method: 'POST', body: JSON.stringify({ target_id: targetId, action }) }),
  getMatches: () => request('/swipes/matches'),

  // Chat
  getConversations: () => request('/chat/conversations'),
  getMessages: (conversationId) => request(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (msgData) => request('/chat/messages', { method: 'POST', body: JSON.stringify(msgData) }),
  recallMessage: (messageId) => request(`/chat/messages/${messageId}/recall`, { method: 'POST' }),
  deleteMessage: (messageId) => request(`/chat/messages/${messageId}`, { method: 'DELETE' }),
  deleteConversation: (conversationId) => request(`/chat/conversations/${conversationId}`, { method: 'DELETE' }),
  uploadChatMedia: (formData) => request('/chat/upload', { method: 'POST', body: formData }),

  // Calls
  getCallHistory: () => request('/calls/history'),
  getBusySuggestions: (busyUserId) => request(`/calls/busy-suggestions?busy_user_id=${busyUserId || ''}`),
  logCall: (callData) => request('/calls/log', { method: 'POST', body: JSON.stringify(callData) }),
  deductCallMinute: (data) => request('/calls/deduct-minute', { method: 'POST', body: JSON.stringify(data) }),

  // Gifts
  getGifts: () => request('/gifts'),
  sendGift: (receiverId, giftId) => request('/gifts/send', { method: 'POST', body: JSON.stringify({ receiver_id: receiverId, gift_id: giftId }) }),

  // Wallet & VietQR
  getCoinPackages: () => request('/wallet/packages'),
  getBankTransferInfo: () => request('/wallet/bank-info'),
  createDepositRequest: (packageId) => request('/wallet/create-deposit', { method: 'POST', body: JSON.stringify({ package_id: packageId }) }),
  confirmDepositSent: (depositId) => request('/wallet/confirm-deposit', { method: 'POST', body: JSON.stringify({ deposit_id: depositId }) }),
  getTransactions: () => request('/wallet/transactions'),
  depositCoins: (packageId, paymentMethod) => request('/wallet/deposit', { method: 'POST', body: JSON.stringify({ package_id: packageId, payment_method: paymentMethod }) }),
  buyVip: (vipLevel, months) => request('/wallet/buy-vip', { method: 'POST', body: JSON.stringify({ vip_level: vipLevel, months }) }),
  withdraw: (data) => request('/wallet/withdraw', { method: 'POST', body: JSON.stringify(data) }),

  // Daily Check-in & Vouchers
  getCheckinStatus: () => request('/checkin/status'),
  claimDailyCheckin: () => request('/checkin/claim', { method: 'POST' }),
  getUserVouchers: () => request('/checkin/vouchers'),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: (search = '') => request(`/admin/users?search=${encodeURIComponent(search)}`),
  getAdminUserDetails: (id) => request(`/admin/users/${id}`),
  toggleBanUser: (id) => request(`/admin/users/${id}/ban`, { method: 'PUT' }),
  updateUserRole: (id, data) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify(data) }),
  resetUserPassword: (id, newPassword) => request(`/admin/users/${id}/reset-password`, { method: 'PUT', body: JSON.stringify({ new_password: newPassword }) }),
  adjustBalance: (id, data) => request(`/admin/users/${id}/balance`, { method: 'POST', body: JSON.stringify(data) }),
  getAdminDeposits: (status = 'all') => request(`/admin/deposits?status=${status}`),
  approveDeposit: (id, adminNote) => request(`/admin/deposits/${id}/approve`, { method: 'PUT', body: JSON.stringify({ admin_note: adminNote }) }),
  rejectDeposit: (id, reason) => request(`/admin/deposits/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  getAdminWithdrawals: () => request('/admin/withdrawals'),
  reviewWithdrawal: (id, status, adminNote) => request(`/admin/withdrawals/${id}/review`, { method: 'PUT', body: JSON.stringify({ status, admin_note: adminNote }) }),
  getVerifications: () => request('/admin/verifications'),
  reviewVerification: (id, status, adminNote) => request(`/admin/verifications/${id}`, { method: 'PUT', body: JSON.stringify({ status, admin_note: adminNote }) }),
  getReports: () => request('/admin/reports'),
  updateReportStatus: (id, status) => request(`/admin/reports/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getAdminSettings: () => request('/admin/settings'),
  updateAdminSettings: (settings) => request('/admin/settings', { method: 'PUT', body: JSON.stringify({ settings }) }),
  addAdminGift: (giftData) => request('/admin/gifts', { method: 'POST', body: JSON.stringify(giftData) })
};
