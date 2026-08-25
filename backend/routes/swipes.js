const express = require('express');
const router = express.Router();
const { getCardDeck, swipe, getMatches } = require('../controllers/swipeController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/deck', getCardDeck);
router.post('/', swipe);
router.get('/matches', getMatches);

module.exports = router;
