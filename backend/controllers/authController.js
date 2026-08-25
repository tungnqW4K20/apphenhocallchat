const dataService = require('../models/dataService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'super_secret_dating_jwt_key_2026_ayan_tinder',
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

const register = async (req, res) => {
  try {
    const { username, email, password, full_name, gender, birth_date, age, bio, avatar, job, city } = req.body;

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc' });
    }

    const existingEmail = await dataService.findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng' });
    }

    const existingUsername = await dataService.findUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Tên người dùng này đã tồn tại' });
    }

    const user = await dataService.createUser({
      username,
      email,
      password,
      full_name,
      gender: gender || 'male',
      birth_date: birth_date || '2002-01-01',
      age: Number(age) || 22,
      bio: bio || 'Xin chào! Rất vui được làm quen trên app ✨',
      avatar: avatar || (gender === 'female' ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500' : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500'),
      job: job || 'Thành viên',
      city: city || 'Hà Nội',
      coins: 200, // Tặng 200 xu khi đăng ký mới để trải nghiệm
      diamonds: 0,
      role: 'user'
    });

    // Add avatar as primary photo in album
    if (user.avatar) {
      await dataService.addUserPhoto(user.id, user.avatar, true);
    }

    const token = generateToken(user);
    const { password: _, ...userSafe } = user;

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công! Tặng ngay 200 Xu trải nghiệm 🎉',
      token,
      user: userSafe
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đăng ký: ' + error.message });
  }
};

const login = async (req, res) => {
  try {
    const loginKey = req.body.loginKey || req.body.username || req.body.email;
    const { password } = req.body;

    if (!loginKey || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập/email và mật khẩu' });
    }

    let user = await dataService.findUserByEmail(loginKey);
    if (!user) {
      user = await dataService.findUserByUsername(loginKey);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    if (user.is_banned) {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa vĩnh viễn' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    // Set online
    await dataService.updateUser(user.id, { is_online: true });

    const token = generateToken(user);
    const { password: _, ...userSafe } = user;
    const photos = await dataService.getUserPhotos(user.id);
    userSafe.photos = photos.map(p => p.photo_url);

    return res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: userSafe
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi đăng nhập: ' + error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await dataService.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    const { password: _, ...userSafe } = user;
    const photos = await dataService.getUserPhotos(user.id);
    userSafe.photos = photos.map(p => p.photo_url);
    return res.json({ success: true, user: userSafe });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'full_name', 'bio', 'job', 'company_or_school', 'city', 'country',
      'gender', 'age', 'birth_date', 'interests', 'avatar',
      'is_host', 'call_rate_per_min', 'latitude', 'longitude'
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const updatedUser = await dataService.updateUser(req.user.id, updateData);
    const { password: _, ...userSafe } = updatedUser;
    const photos = await dataService.getUserPhotos(req.user.id);
    userSafe.photos = photos.map(p => p.photo_url);

    return res.json({
      success: true,
      message: 'Cập nhật hồ sơ thành công!',
      user: userSafe
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
