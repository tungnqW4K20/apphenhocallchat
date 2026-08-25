const dataService = require('../models/dataService');

const getUserDetails = async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const user = await dataService.findUserById(targetId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const { password: _, ...userSafe } = user;
    const photos = await dataService.getUserPhotos(targetId);
    userSafe.photos = photos.map(p => p.photo_url);

    // Distance calculation
    if (req.user && req.user.latitude && req.user.longitude && user.latitude && user.longitude) {
      userSafe.distance_km = Math.max(1, Math.round(dataService.calcDistance(req.user.latitude, req.user.longitude, user.latitude, user.longitude)));
    } else {
      userSafe.distance_km = 3;
    }

    return res.json({ success: true, user: userSafe });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getNearbyUsers = async (req, res) => {
  try {
    const { gender, minAge, maxAge, onlineOnly, isHostOnly } = req.query;
    const allUsers = await dataService.getDeckUsers(req.user.id, { gender, minAge, maxAge });

    let filtered = allUsers;
    if (onlineOnly === 'true') {
      filtered = filtered.filter(u => u.is_online);
    }
    if (isHostOnly === 'true') {
      filtered = filtered.filter(u => u.is_host);
    }

    return res.json({ success: true, users: filtered });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh để tải lên' });
    }

    const isPrimary = req.body.is_primary === 'true';
    const photoUrl = `/uploads/${req.file.filename}`;

    const newPhoto = await dataService.addUserPhoto(req.user.id, photoUrl, isPrimary);
    if (isPrimary) {
      await dataService.updateUser(req.user.id, { avatar: photoUrl });
    }

    const photos = await dataService.getUserPhotos(req.user.id);
    return res.json({
      success: true,
      message: 'Tải ảnh lên thành công!',
      photo: newPhoto,
      photos: photos.map(p => p.photo_url)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deletePhoto = async (req, res) => {
  try {
    const photoId = Number(req.params.photoId);
    await dataService.deleteUserPhoto(req.user.id, photoId);
    const photos = await dataService.getUserPhotos(req.user.id);
    return res.json({ success: true, message: 'Đã xóa ảnh khỏi album', photos });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const requestVerification = async (req, res) => {
  try {
    const { selfie_photo, id_card_photo } = req.body;
    if (!selfie_photo) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp ảnh selfie xác thực khuôn mặt' });
    }

    const store = require('../config/db').getMockStore();
    const isFallback = require('../config/db').isUsingFallback();

    if (!isFallback) {
      await require('../config/db').query(
        `INSERT INTO verifications (user_id, selfie_photo, id_card_photo, status) VALUES (?, ?, ?, 'pending')`,
        [req.user.id, selfie_photo, id_card_photo || null]
      );
    } else {
      store.verifications.push({
        id: store.autoIncrementIds.verifications++,
        user_id: req.user.id,
        selfie_photo,
        id_card_photo: id_card_photo || null,
        status: 'pending',
        admin_note: '',
        created_at: new Date().toISOString()
      });
      require('../config/db').saveStore();
    }

    return res.json({ success: true, message: 'Yêu cầu xác minh tích xanh đã được gửi tới Quản trị viên!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const reportUser = async (req, res) => {
  try {
    const { reported_id, reason, details } = req.body;
    if (!reported_id || !reason) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp lý do báo cáo' });
    }

    const isFallback = require('../config/db').isUsingFallback();
    const store = require('../config/db').getMockStore();

    if (!isFallback) {
      await require('../config/db').query(
        `INSERT INTO reports (reporter_id, reported_id, reason, details, status) VALUES (?, ?, ?, ?, 'pending')`,
        [req.user.id, reported_id, reason, details || '']
      );
    } else {
      store.reports.push({
        id: store.autoIncrementIds.reports++,
        reporter_id: req.user.id,
        reported_id: Number(reported_id),
        reason,
        details: details || '',
        status: 'pending',
        created_at: new Date().toISOString()
      });
      require('../config/db').saveStore();
    }

    return res.json({ success: true, message: 'Đã gửi báo cáo vi phạm. Đội ngũ kiểm duyệt sẽ xử lý nhanh chóng.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const toggleFollowUser = async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const result = await dataService.toggleFollow(req.user.id, targetId);
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getFriendsList = async (req, res) => {
  try {
    const friends = await dataService.getFriends(req.user.id);
    return res.json({ success: true, friends });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getFollowingList = async (req, res) => {
  try {
    const following = await dataService.getFollowing(req.user.id);
    return res.json({ success: true, following });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getFollowersList = async (req, res) => {
  try {
    const followers = await dataService.getFollowers(req.user.id);
    return res.json({ success: true, followers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, city } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Tọa độ không hợp lệ' });
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    let resolvedCity = city;
    if (!resolvedCity) {
      const locationService = require('../services/locationService');
      const geo = await locationService.reverseGeocode(lat, lon);
      resolvedCity = geo.city;
    }

    await dataService.updateUser(req.user.id, {
      latitude: lat,
      longitude: lon,
      city: resolvedCity
    });

    return res.json({
      success: true,
      message: 'Cập nhật vị trí GPS thành công',
      location: {
        latitude: lat,
        longitude: lon,
        city: resolvedCity
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserDetails,
  getNearbyUsers,
  updateLocation,
  uploadPhoto,
  deletePhoto,
  requestVerification,
  reportUser,
  toggleFollowUser,
  getFriendsList,
  getFollowingList,
  getFollowersList
};

