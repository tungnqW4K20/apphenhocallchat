const express = require('express');
const router = express.Router();
const { 
  getConversations, 
  getMessages, 
  sendMessage, 
  uploadChatMedia,
  recallMessage,
  deleteMessage,
  deleteConversation
} = require('../controllers/chatController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(authMiddleware);

router.get('/conversations', getConversations);
router.delete('/conversations/:id', deleteConversation);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/messages', sendMessage);
router.post('/messages/:id/recall', recallMessage);
router.delete('/messages/:id', deleteMessage);
router.post('/upload', upload.any(), uploadChatMedia);

module.exports = router;

