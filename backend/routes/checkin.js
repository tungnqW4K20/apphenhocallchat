const express = require('express');
const router = express.Router();
const dataService = require('../models/dataService');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Get user check-in status and available vouchers
router.get('/status', async (req, res) => {
  try {
    const status = await dataService.getUserCheckinStatus(req.user.id);
    const vouchers = await dataService.getUserVouchers(req.user.id);
    return res.json({ success: true, ...status, vouchers });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Claim daily check-in reward
router.post('/claim', async (req, res) => {
  try {
    const result = await dataService.claimDailyCheckin(req.user.id);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// Get user vouchers list
router.get('/vouchers', async (req, res) => {
  try {
    const vouchers = await dataService.getUserVouchers(req.user.id);
    return res.json({ success: true, vouchers });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
