const dataService = require('../models/dataService');

const getCallHistory = async (req, res) => {
  try {
    const logs = await dataService.getUserCallLogs(req.user.id);
    return res.json({ success: true, count: logs.length, call_logs: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const logCall = async (req, res) => {
  try {
    const { receiver_id, call_type, duration_seconds, coins_spent, diamonds_earned, status } = req.body;

    const log = await dataService.createCallLog({
      caller_id: req.user.id,
      receiver_id: Number(receiver_id),
      call_type: call_type || 'direct_video',
      duration_seconds: Number(duration_seconds) || 0,
      coins_spent: Number(coins_spent) || 0,
      diamonds_earned: Number(diamonds_earned) || 0,
      status: status || 'completed'
    });

    return res.status(201).json({ success: true, log });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Deduct coins per minute
const deductCallMinute = async (req, res) => {
  try {
    const { receiver_id, call_type } = req.body;
    const callerId = req.user.id;
    const receiver = await dataService.findUserById(receiver_id);

    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Người nhận không tồn tại' });
    }

    const caller = await dataService.findUserById(callerId);
    if (caller && receiver && caller.gender === receiver.gender) {
      return res.status(400).json({ success: false, message: 'Hệ thống chỉ hỗ trợ gọi điện cho người dùng khác giới tính!' });
    }
    let rate = 20; // default 20 coins per minute
    if (receiver.is_host && receiver.call_rate_per_min) {
      rate = receiver.call_rate_per_min;
    }

    if (caller.coins < rate) {
      return res.status(400).json({
        success: false,
        insufficient_coins: true,
        message: 'Bạn đã hết Xu. Cuộc gọi sẽ kết thúc.'
      });
    }

    // Deduct from caller
    const diamondReward = Math.floor(rate * 0.7); // 70% host commission
    await dataService.updateUserBalance(callerId, -rate, 0);
    await dataService.updateUserBalance(receiver.id, 0, diamondReward);

    const updatedCaller = await dataService.findUserById(callerId);

    return res.json({
      success: true,
      remaining_coins: updatedCaller.coins,
      rate,
      diamondReward
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBusySuggestions = async (req, res) => {
  try {
    const { busy_user_id } = req.query;
    const suggestions = await dataService.getBusyCallSuggestions(req.user.id, busy_user_id, 5);
    return res.json({ success: true, suggestions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCallHistory, logCall, deductCallMinute, getBusySuggestions };
