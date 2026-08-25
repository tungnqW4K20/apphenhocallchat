const express = require('express');
const router = express.Router();
const { getGifts, sendGift } = require('../controllers/giftController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', getGifts);
router.post('/send', sendGift);

module.exports = router;
