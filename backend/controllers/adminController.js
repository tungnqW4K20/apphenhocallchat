const dataService = require('../models/dataService');
const bcrypt = require('bcryptjs');

const getDashboardStats = async (req, res) => {
  try {
    const stats = await dataService.getDashboardStats();
    const deposits = await dataService.getDeposits('pending');
    stats.pending_deposits = deposits.length;
    return res.json({ success: true, stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const users = await dataService.getAllUsersAdmin(search || '');
    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const details = await dataService.getAdminUserDetails(targetId);
    return res.json({ success: true, ...details });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const toggleBanUser = async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const user = await dataService.findUserById(targetId);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    const newBanStatus = !user.is_banned;
    await dataService.updateUser(targetId, { is_banned: newBanStatus });

    return res.json({
      success: true,
      message: newBanStatus ? `Đã khóa tài khoản ${user.full_name}` : `Đã mở khóa tài khoản ${user.full_name}`,
      is_banned: newBanStatus
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const { role, is_host, vip_level } = req.body;

    const updates = {};
    if (role !== undefined) updates.role = role;
    if (is_host !== undefined) updates.is_host = Boolean(is_host);
    if (vip_level !== undefined) updates.vip_level = Number(vip_level);

    await dataService.updateUser(targetId, updates);
    const updated = await dataService.findUserById(targetId);

    return res.json({
      success: true,
      message: 'Cập nhật thông tin phân quyền thành công!',
      user: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới tối thiểu 6 ký tự' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await dataService.updateUser(targetId, { password: hashedPassword });

    return res.json({ success: true, message: 'Đã đặt lại mật khẩu cho tài khoản thành công!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const adjustBalance = async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const { delta_coins, delta_diamonds, reason } = req.body;

    const updated = await dataService.updateUserBalance(
      targetId,
      Number(delta_coins) || 0,
      Number(delta_diamonds) || 0
    );

    if (delta_coins) {
      await dataService.createTransaction({
        user_id: targetId,
        type: Number(delta_coins) > 0 ? 'deposit' : 'gift_sent',
        amount: Math.abs(Number(delta_coins)),
        description: `Admin điều chỉnh: ${reason || 'Thưởng/Phạt'}`
      });
    }

    return res.json({
      success: true,
      message: 'Đã cập nhật số dư tài khoản',
      coins: updated.coins,
      diamonds: updated.diamonds
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= VIETQR DEPOSITS MANAGEMENT =================
const getDeposits = async (req, res) => {
  try {
    const { status } = req.query;
    const deposits = await dataService.getDeposits(status || 'all');
    return res.json({ success: true, count: deposits.length, deposits });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const approveDeposit = async (req, res) => {
  try {
    const depositId = Number(req.params.id);
    const { admin_note } = req.body;
    const deposit = await dataService.approveDeposit(depositId, admin_note);

    return res.json({
      success: true,
      message: `Đã duyệt đơn nạp! Cộng ${deposit.total_coins} Xu vào ví người dùng thành công! 🎉`,
      deposit
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const rejectDeposit = async (req, res) => {
  try {
    const depositId = Number(req.params.id);
    const { reason } = req.body;
    const deposit = await dataService.rejectDeposit(depositId, reason);

    return res.json({
      success: true,
      message: 'Đã từ chối đơn nạp tiền',
      deposit
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= WITHDRAWALS MANAGEMENT =================
const getWithdrawals = async (req, res) => {
  try {
    const isFallback = require('../config/db').isUsingFallback();
    const store = require('../config/db').getMockStore();
    let withdrawals = [];

    if (!isFallback) {
      withdrawals = await require('../config/db').query(
        `SELECT t.*, u.full_name, u.avatar, u.email FROM transactions t
         JOIN users u ON t.user_id = u.id
         WHERE t.type = 'withdrawal'
         ORDER BY t.created_at DESC`
      );
    } else {
      withdrawals = (store.transactions || []).filter(t => t.type === 'withdrawal').map(t => {
        const u = store.users.find(user => user.id === t.user_id) || {};
        return {
          ...t,
          full_name: u.full_name,
          avatar: u.avatar,
          email: u.email
        };
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return res.json({ success: true, count: withdrawals.length, withdrawals });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const reviewWithdrawal = async (req, res) => {
  try {
    const transactionId = Number(req.params.id);
    const { status, admin_note } = req.body; // 'completed' | 'rejected'
    const isFallback = require('../config/db').isUsingFallback();
    const store = require('../config/db').getMockStore();

    if (isFallback) {
      const t = (store.transactions || []).find(item => item.id === transactionId);
      if (!t) return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
      t.status = status;
      t.description = `${t.description} [${status === 'completed' ? 'Đã chi trả' : 'Từ chối'}: ${admin_note || ''}]`;
      
      // If rejected, refund diamonds
      if (status === 'rejected') {
        await dataService.updateUserBalance(t.user_id, 0, t.amount);
      }
      require('../config/db').saveStore();
    }

    return res.json({ success: true, message: `Đã ${status === 'completed' ? 'duyệt chi trả' : 'từ chối và hoàn kim cương'} yêu cầu rút tiền!` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getVerifications = async (req, res) => {
  try {
    const list = await dataService.getVerifications();
    return res.json({ success: true, verifications: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const reviewVerification = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, admin_note } = req.body; // status: 'approved' | 'rejected'

    await dataService.updateVerification(id, status, admin_note || '');
    return res.json({ success: true, message: `Đã ${status === 'approved' ? 'phê duyệt' : 'từ chối'} yêu cầu xác thực!` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await dataService.getReports();
    return res.json({ success: true, reports });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const isFallback = require('../config/db').isUsingFallback();
    const store = require('../config/db').getMockStore();

    if (!isFallback) {
      await require('../config/db').query('UPDATE reports SET status = ? WHERE id = ?', [status, id]);
    } else {
      const r = store.reports.find(item => item.id === id);
      if (r) r.status = status;
      require('../config/db').saveStore();
    }

    return res.json({ success: true, message: 'Đã cập nhật trạng thái báo cáo vi phạm' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSystemSettings = async (req, res) => {
  try {
    const settings = await dataService.getSystemSettings();
    return res.json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateSystemSetting = async (req, res) => {
  try {
    const { settings } = req.body;
    for (const [k, v] of Object.entries(settings)) {
      await dataService.updateSystemSetting(k, v);
    }
    return res.json({ success: true, message: 'Cập nhật cấu hình hệ thống thành công!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const manageGift = async (req, res) => {
  try {
    const { name, icon, animation_type, coin_price, diamond_reward, category } = req.body;
    const store = require('../config/db').getMockStore();
    const isFallback = require('../config/db').isUsingFallback();

    if (!isFallback) {
      const db = require('../config/db');
      await db.query(
        `INSERT INTO gifts (name, icon, animation_type, coin_price, diamond_reward, category)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, icon, animation_type || 'floating', Number(coin_price), Number(diamond_reward), category || 'popular']
      );
    } else {
      store.gifts.push({
        id: store.autoIncrementIds.gifts++,
        name,
        icon,
        animation_type: animation_type || 'floating',
        coin_price: Number(coin_price),
        diamond_reward: Number(diamond_reward),
        category: category || 'popular',
        created_at: new Date().toISOString()
      });
      require('../config/db').saveStore();
    }

    return res.json({ success: true, message: 'Đã thêm quà tặng mới vào kho!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getUserDetails,
  toggleBanUser,
  updateUserRole,
  resetUserPassword,
  adjustBalance,
  getDeposits,
  approveDeposit,
  rejectDeposit,
  getWithdrawals,
  reviewWithdrawal,
  getVerifications,
  reviewVerification,
  getReports,
  updateReportStatus,
  getSystemSettings,
  updateSystemSetting,
  manageGift
};
