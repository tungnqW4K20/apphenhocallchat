const express = require('express');
const router = express.Router();
const { getCallHistory, logCall, deductCallMinute, getBusySuggestions } = require('../controllers/callController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/history', getCallHistory);
router.get('/busy-suggestions', getBusySuggestions);
router.post('/log', logCall);
router.post('/deduct-minute', deductCallMinute);

module.exports = router;
