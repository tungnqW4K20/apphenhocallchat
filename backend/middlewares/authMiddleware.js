const jwt = require('jsonwebtoken');
const dataService = require('../models/dataService');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để tiếp tục' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_dating_jwt_key_2026_ayan_tinder');

    const user = await dataService.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại' });
    }

    if (user.is_banned) {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa do vi phạm tiêu chuẩn cộng đồng' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập trang quản trị' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
