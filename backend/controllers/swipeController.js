const dataService = require('../models/dataService');

const getCardDeck = async (req, res) => {
  try {
    const { gender, minAge, maxAge } = req.query;
    const cards = await dataService.getDeckUsers(req.user.id, { gender, minAge, maxAge });
    return res.json({ success: true, count: cards.length, users: cards });
  } catch (error) {
    console.error('getCardDeck error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const swipe = async (req, res) => {
  try {
    const { target_id, action } = req.body; // action: 'like', 'pass', 'superlike'

    if (!target_id || !['like', 'pass', 'superlike'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Hành động quẹt không hợp lệ' });
    }

    if (Number(target_id) === Number(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Không thể tự quẹt chính mình' });
    }

    // Check superlike coin deduction if user is not VIP
    if (action === 'superlike' && (req.user.vip_level || 0) === 0) {
      if (req.user.coins < 10) {
        return res.status(400).json({ success: false, message: 'Super Like cần 10 Xu hoặc gói VIP. Vui lòng nạp thêm Xu!' });
      }
      await dataService.updateUserBalance(req.user.id, -10, 0);
    }

    const { isMatch, targetUser } = await dataService.recordSwipe(req.user.id, target_id, action);

    let matchInfo = null;
    if (isMatch && targetUser) {
      const { password: _, ...targetSafe } = targetUser;
      matchInfo = {
        matched: true,
        partner: targetSafe,
        message: `Chúc mừng! Bạn và ${targetUser.full_name} đã ghép đôi thành công! 🎉`
      };
    }

    return res.json({
      success: true,
      action,
      isMatch,
      matchInfo
    });
  } catch (error) {
    console.error('swipe error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMatches = async (req, res) => {
  try {
    const matches = await dataService.getUserMatches(req.user.id);
    return res.json({ success: true, count: matches.length, matches });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCardDeck, swipe, getMatches };
