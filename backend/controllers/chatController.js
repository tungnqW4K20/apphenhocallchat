const dataService = require('../models/dataService');

const getConversations = async (req, res) => {
  try {
    const convs = await dataService.getUserConversations(req.user.id);
    return res.json({ success: true, count: convs.length, conversations: convs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);
    const messages = await dataService.getConversationMessages(conversationId);
    await dataService.markMessagesAsRead(conversationId, req.user.id);
    return res.json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { conversation_id, receiver_id, message_type, content, metadata } = req.body;

    if (!receiver_id || !content) {
      return res.status(400).json({ success: false, message: 'Dữ liệu tin nhắn không đầy đủ' });
    }

    const newMsg = await dataService.createMessage(
      conversation_id,
      req.user.id,
      receiver_id,
      message_type || 'text',
      content,
      metadata || {}
    );

    return res.status(201).json({ success: true, message: newMsg });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadChatMedia = async (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ success: false, message: 'Không có tệp tải lên' });
    }
    const mediaUrl = `/uploads/${file.filename}`;
    const fullUrl = `http://localhost:5001${mediaUrl}`;
    const isAudio = file.mimetype.startsWith('audio');

    return res.json({
      success: true,
      mediaUrl,
      url: fullUrl,
      type: isAudio ? 'audio' : 'image'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const recallMessage = async (req, res) => {
  try {
    const messageId = Number(req.params.id);
    const updatedMsg = await dataService.recallMessage(messageId, req.user.id);

    // Socket.io real-time broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${updatedMsg.conversation_id}`).emit('message_recalled', {
        messageId: updatedMsg.id,
        conversationId: updatedMsg.conversation_id,
        message: updatedMsg
      });
      io.to(`user_${updatedMsg.receiver_id}`).emit('message_recalled', {
        messageId: updatedMsg.id,
        conversationId: updatedMsg.conversation_id,
        message: updatedMsg
      });
    }

    return res.json({ success: true, message: 'Đã thu hồi tin nhắn thành công', data: updatedMsg });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const messageId = Number(req.params.id);
    const result = await dataService.deleteMessage(messageId, req.user.id);

    // Socket.io real-time broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${result.conversation_id}`).emit('message_deleted', {
        messageId: result.id,
        conversationId: result.conversation_id
      });
      if (result.receiver_id) {
        io.to(`user_${result.receiver_id}`).emit('message_deleted', {
          messageId: result.id,
          conversationId: result.conversation_id
        });
      }
    }

    return res.json({ success: true, message: 'Đã xóa tin nhắn vĩnh viễn', data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const conversationId = Number(req.params.id);
    const result = await dataService.deleteConversation(conversationId, req.user.id);

    // Socket.io real-time broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation_${conversationId}`).emit('conversation_deleted', {
        conversationId
      });
      if (result.partnerId) {
        io.to(`user_${result.partnerId}`).emit('conversation_deleted', {
          conversationId
        });
      }
    }

    return res.json({ success: true, message: 'Đã xóa toàn bộ cuộc hội thoại khỏi hệ thống', data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getConversations, 
  getMessages, 
  sendMessage, 
  uploadChatMedia,
  recallMessage,
  deleteMessage,
  deleteConversation
};

