const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  getUserDetails,
  toggleBanUser,
  updateUserRole,
  resetUserPassword,
  adjustBalance,
  getDeposits,
  approveDeposit,
  rejectDeposit,
  getWithdrawals,
  reviewWithdrawal,
  getVerifications,
  reviewVerification,
  getReports,
  updateReportStatus,
  getSystemSettings,
  updateSystemSetting,
  manageGift
} = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware, adminMiddleware);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/ban', toggleBanUser);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/reset-password', resetUserPassword);
router.post('/users/:id/balance', adjustBalance);

// VietQR Deposits
router.get('/deposits', getDeposits);
router.put('/deposits/:id/approve', approveDeposit);
router.put('/deposits/:id/reject', rejectDeposit);

// Withdrawals
router.get('/withdrawals', getWithdrawals);
router.put('/withdrawals/:id/review', reviewWithdrawal);

// KYC & Reports
router.get('/verifications', getVerifications);
router.put('/verifications/:id', reviewVerification);
router.get('/reports', getReports);
router.put('/reports/:id', updateReportStatus);

// Settings & Gifts
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSetting);
router.post('/gifts', manageGift);

module.exports = router;
