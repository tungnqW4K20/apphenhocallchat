const dataService = require('../models/dataService');

const getGifts = async (req, res) => {
  try {
    const gifts = await dataService.getGifts();
    return res.json({ success: true, gifts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const sendGift = async (req, res) => {
  try {
    const { receiver_id, gift_id } = req.body;
    if (!receiver_id || !gift_id) {
      return res.status(400).json({ success: false, message: 'Thông tin gửi quà không đầy đủ' });
    }

    const result = await dataService.sendGift(req.user.id, receiver_id, gift_id);
    const updatedUser = await dataService.findUserById(req.user.id);

    return res.json({
      success: true,
      message: `Đã gửi tặng ${result.gift.name} thành công! 🎁`,
      gift: result.gift,
      remaining_coins: updatedUser.coins
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getGifts, sendGift };
