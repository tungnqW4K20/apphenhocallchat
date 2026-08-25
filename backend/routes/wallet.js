const express = require('express');
const router = express.Router();
const { 
  getCoinPackages, 
  getTransactions, 
  depositCoins, 
  buyVip, 
  requestWithdrawal,
  createDepositRequest,
  getBankTransferInfo,
  confirmDepositSent
} = require('../controllers/walletController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/packages', getCoinPackages);
router.get('/bank-info', getBankTransferInfo);
router.get('/transactions', getTransactions);
router.post('/create-deposit', createDepositRequest);
router.post('/confirm-deposit', confirmDepositSent);
router.post('/deposit', depositCoins);
router.post('/buy-vip', buyVip);
router.post('/withdraw', requestWithdrawal);

module.exports = router;
