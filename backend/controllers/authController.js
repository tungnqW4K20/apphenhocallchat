const dataService = require('../models/dataService');
const locationService = require('../services/locationService');
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
    const { username, email, password, full_name, gender, birth_date, age, bio, avatar, job, city, latitude, longitude } = req.body;

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc' });
    }

    const cleanUsername = String(username).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    const existingEmail = await dataService.findUserByEmail(cleanEmail);
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email này đã được sử dụng' });
    }

    const existingUsername = await dataService.findUserByUsername(cleanUsername);
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Tên người dùng này đã tồn tại' });
    }

    const defaultCoords = locationService.getCityCoordinates(city || 'Hà Nội');
    const userLat = (latitude !== undefined && latitude !== null) ? Number(latitude) : defaultCoords.lat;
    const userLon = (longitude !== undefined && longitude !== null) ? Number(longitude) : defaultCoords.lon;

    const user = await dataService.createUser({
      username: cleanUsername,
      email: cleanEmail,
      password: String(password),
      full_name: String(full_name).trim(),
      gender: gender || 'male',
      birth_date: birth_date || '2000-01-01',
      age: age ? Number(age) : 22,
      bio: bio || 'Xin chào! Rất vui được làm quen với mọi người 🌟',
      avatar: avatar || (gender === 'female' ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500' : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500'),
      job: job || 'Thành viên',
      city: city || 'Hà Nội',
      latitude: userLat,
      longitude: userLon,
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
    const rawLoginKey = req.body.loginKey || req.body.username || req.body.email;
    const password = req.body.password;

    if (!rawLoginKey || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên đăng nhập/email và mật khẩu' });
    }

    const loginKey = String(rawLoginKey).trim();

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

    const plainPassword = String(password);
    const isMatch = await bcrypt.compare(plainPassword, user.password);
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

    if (updateData.city && (updateData.latitude === undefined || updateData.latitude === null)) {
      const coords = locationService.getCityCoordinates(updateData.city);
      updateData.latitude = coords.lat;
      updateData.longitude = coords.lon;
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
