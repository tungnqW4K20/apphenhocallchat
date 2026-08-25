const db = require('../config/db');
const { getMockStore, saveStore, isUsingFallback } = db;
const bcrypt = require('bcryptjs');
const queueService = require('../services/queueService');
const locationService = require('../services/locationService');
const checkinService = require('../services/checkinService');
const securityService = require('../services/securityService');

class DataService {
  // ====================== USER OPERATIONS ======================
  async findUserById(id) {
    id = Number(id);
    if (!id || isNaN(id)) return null;
    if (!isUsingFallback()) {
      const rows = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      if (Array.isArray(rows) && rows.length > 0) {
        const user = rows[0];
        if (user && typeof user.interests === 'string') {
          try { user.interests = JSON.parse(user.interests); } catch (e) { user.interests = []; }
        }
        return user;
      }
    }
    const store = getMockStore();
    return store.users.find(u => u.id === id) || null;
  }

  async findUserByEmail(email) {
    if (!isUsingFallback()) {
      const rows = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0] || null;
    }
    const store = getMockStore();
    return store.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserByUsername(username) {
    if (!isUsingFallback()) {
      const rows = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0] || null;
    }
    const store = getMockStore();
    return store.users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  }

  async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const interestsJson = JSON.stringify(userData.interests || ['Du lịch', 'Cà phê', 'Âm nhạc']);
    
    if (!isUsingFallback()) {
      const res = await db.query(
        `INSERT INTO users (username, email, password, full_name, gender, birth_date, age, bio, avatar, job, company_or_school, city, country, latitude, longitude, interests, coins, diamonds, vip_level, is_host, call_rate_per_min, is_verified, is_online, role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.username,
          userData.email,
          hashedPassword,
          userData.full_name,
          userData.gender || 'male',
          userData.birth_date || '2002-01-01',
          userData.age || 22,
          userData.bio || 'Chào bạn! Rất vui được làm quen trên app ✨',
          userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
          userData.job || 'Designer',
          userData.company_or_school || 'Đại học Quốc Gia',
          userData.city || 'Hà Nội',
          userData.country || 'Việt Nam',
          userData.latitude || 21.0285,
          userData.longitude || 105.8542,
          interestsJson,
          userData.coins !== undefined ? userData.coins : 200,
          userData.diamonds !== undefined ? userData.diamonds : 0,
          userData.vip_level || 0,
          userData.is_host || false,
          userData.call_rate_per_min || 20,
          userData.is_verified || false,
          true,
          userData.role || 'user'
        ]
      );
      return this.findUserById(res.insertId);
    }

    const store = getMockStore();
    const newId = store.autoIncrementIds.users++;
    const newUser = {
      id: newId,
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      full_name: userData.full_name,
      gender: userData.gender || 'male',
      birth_date: userData.birth_date || '2002-01-01',
      age: userData.age || 22,
      bio: userData.bio || 'Chào bạn! Rất vui được làm quen trên app ✨',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      job: userData.job || 'Designer',
      company_or_school: userData.company_or_school || 'Đại học Quốc Gia',
      city: userData.city || 'Hà Nội',
      country: userData.country || 'Việt Nam',
      latitude: userData.latitude || 21.0285,
      longitude: userData.longitude || 105.8542,
      interests: userData.interests || ['Du lịch', 'Cà phê', 'Âm nhạc'],
      coins: userData.coins !== undefined ? userData.coins : 200,
      diamonds: userData.diamonds !== undefined ? userData.diamonds : 0,
      vip_level: userData.vip_level || 0,
      vip_expires_at: null,
      is_host: userData.is_host || false,
      call_rate_per_min: userData.call_rate_per_min || 20,
      is_verified: userData.is_verified || false,
      is_online: true,
      is_in_call: false,
      role: userData.role || 'user',
      is_banned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.users.push(newUser);
    saveStore();
    return newUser;
  }

  async updateUser(id, updateData) {
    id = Number(id);
    if (!isUsingFallback()) {
      const fields = [];
      const values = [];
      for (const [key, val] of Object.entries(updateData)) {
        if (key === 'interests' && typeof val === 'object') {
          fields.push(`interests = ?`);
          values.push(JSON.stringify(val));
        } else {
          fields.push(`${key} = ?`);
          values.push(val);
        }
      }
      values.push(id);
      if (fields.length > 0) {
        await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
      }
      return this.findUserById(id);
    }

    const store = getMockStore();
    const userIndex = store.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      store.users[userIndex] = {
        ...store.users[userIndex],
        ...updateData,
        updated_at: new Date().toISOString()
      };
      saveStore();
      return store.users[userIndex];
    }
    return null;
  }

  async updateUserBalance(id, deltaCoins = 0, deltaDiamonds = 0) {
    id = Number(id);
    const user = await this.findUserById(id);
    if (!user) throw new Error('User not found');
    const newCoins = Math.max(0, (user.coins || 0) + deltaCoins);
    const newDiamonds = Math.max(0, (user.diamonds || 0) + deltaDiamonds);
    return this.updateUser(id, { coins: newCoins, diamonds: newDiamonds });
  }

  // ====================== PHOTOS ======================
  async getUserPhotos(userId) {
    userId = Number(userId);
    if (!isUsingFallback()) {
      return await db.query('SELECT * FROM user_photos WHERE user_id = ? ORDER BY is_primary DESC, id ASC', [userId]);
    }
    const store = getMockStore();
    return store.user_photos.filter(p => p.user_id === userId);
  }

  async addUserPhoto(userId, photoUrl, isPrimary = false) {
    userId = Number(userId);
    if (!isUsingFallback()) {
      if (isPrimary) {
        await db.query('UPDATE user_photos SET is_primary = FALSE WHERE user_id = ?', [userId]);
      }
      const res = await db.query('INSERT INTO user_photos (user_id, photo_url, is_primary) VALUES (?, ?, ?)', [userId, photoUrl, isPrimary]);
      return { id: res.insertId, user_id: userId, photo_url: photoUrl, is_primary: isPrimary };
    }
    const store = getMockStore();
    if (isPrimary) {
      store.user_photos.forEach(p => { if (p.user_id === userId) p.is_primary = false; });
    }
    const newPhoto = {
      id: store.autoIncrementIds.user_photos++,
      user_id: userId,
      photo_url: photoUrl,
      is_primary: isPrimary,
      created_at: new Date().toISOString()
    };
    store.user_photos.push(newPhoto);
    saveStore();
    return newPhoto;
  }

  async deleteUserPhoto(userId, photoId) {
    userId = Number(userId);
    photoId = Number(photoId);
    if (!isUsingFallback()) {
      await db.query('DELETE FROM user_photos WHERE id = ? AND user_id = ?', [photoId, userId]);
      return true;
    }
    const store = getMockStore();
    store.user_photos = store.user_photos.filter(p => !(p.id === photoId && p.user_id === userId));
    saveStore();
    return true;
  }

  // ====================== TINDER SWIPES & MATCHES ======================
  async getDeckUsers(userId, filters = {}) {
    userId = Number(userId);
    const currentUser = await this.findUserById(userId);
    if (!currentUser) return [];

    let users = [];
    // Strict Opposite Gender Rule: Men only discover Women, Women only discover Men
    const targetOppositeGender = currentUser.gender === 'male' ? 'female' : 'male';

    if (!isUsingFallback()) {
      let sql = `
        SELECT u.* FROM users u
        WHERE u.id != ? AND u.is_banned = FALSE
          AND u.id NOT IN (SELECT target_id FROM swipes WHERE swiper_id = ?)
          AND u.gender = ?
      `;
      const params = [userId, userId, targetOppositeGender];
      if (filters.minAge) { sql += ` AND u.age >= ?`; params.push(Number(filters.minAge)); }
      if (filters.maxAge) { sql += ` AND u.age <= ?`; params.push(Number(filters.maxAge)); }
      sql += ` ORDER BY u.is_online DESC, RAND() LIMIT 50`;
      users = await db.query(sql, params);
    } else {
      const store = getMockStore();
      const swipedTargetIds = (store.swipes || []).filter(s => s.swiper_id === userId).map(s => s.target_id);
      const candidates = store.users.filter(u => {
        if (u.id === userId || u.is_banned || swipedTargetIds.includes(u.id)) return false;
        if (u.gender !== targetOppositeGender) return false;
        if (filters.minAge && u.age < Number(filters.minAge)) return false;
        if (filters.maxAge && u.age > Number(filters.maxAge)) return false;
        return true;
      });
      users = candidates;
    }

    // Attach photos, calculated distance, and follow status to each user
    const fullUsers = await Promise.all(users.map(async u => {
      const photos = await this.getUserPhotos(u.id);
      const photoUrls = photos.length > 0 ? photos.map(p => p.photo_url) : [u.avatar];
      const isFollowing = await this.isFollowing(userId, u.id);
      let distance = 3;
      if (currentUser.latitude && currentUser.longitude && u.latitude && u.longitude) {
        distance = Math.max(1, Math.round(locationService.calculateDistance(currentUser.latitude, currentUser.longitude, u.latitude, u.longitude) || 3));
      }
      return {
        ...u,
        photos: photoUrls,
        distance_km: distance,
        is_following: isFollowing
      };
    }));

    // Rank by Online Status (1000 pts) > Availability (500 pts) > Proximity (Haversine Distance)
    const ranked = locationService.rankCandidates(currentUser, fullUsers);
    return ranked.map(u => {
      const { password: _, ...safe } = u;
      return safe;
    });
  }

  calcDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async recordSwipe(swiperId, targetId, action) {
    swiperId = Number(swiperId);
    targetId = Number(targetId);

    // Save swipe
    if (!isUsingFallback()) {
      await db.query(
        `INSERT INTO swipes (swiper_id, target_id, action) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE action = ?`,
        [swiperId, targetId, action, action]
      );
    } else {
      const store = getMockStore();
      const existingIdx = store.swipes.findIndex(s => s.swiper_id === swiperId && s.target_id === targetId);
      if (existingIdx !== -1) {
        store.swipes[existingIdx].action = action;
      } else {
        store.swipes.push({
          id: store.autoIncrementIds.swipes++,
          swiper_id: swiperId,
          target_id: targetId,
          action: action,
          created_at: new Date().toISOString()
        });
      }
      saveStore();
    }

    // Check if target has liked swiper (Mutual Match)
    let isMatch = false;
    let targetUser = null;

    if (action === 'like' || action === 'superlike') {
      const swiperUser = await this.findUserById(swiperId);
      const targetCheck = await this.findUserById(targetId);
      if (swiperUser && targetCheck && swiperUser.gender === targetCheck.gender) {
        throw new Error('Hệ thống hẹn hò chỉ cho phép ghép đôi với người dùng khác giới tính!');
      }

      let targetSwipe = null;
      if (!isUsingFallback()) {
        const rows = await db.query(
          `SELECT * FROM swipes WHERE swiper_id = ? AND target_id = ? AND action IN ('like', 'superlike')`,
          [targetId, swiperId]
        );
        targetSwipe = rows[0] || null;
      } else {
        const store = getMockStore();
        targetSwipe = store.swipes.find(s => s.swiper_id === targetId && s.target_id === swiperId && (s.action === 'like' || s.action === 'superlike'));
      }

      if (targetSwipe) {
        isMatch = true;
        targetUser = await this.findUserById(targetId);
        // Create match and conversation
        await this.createMatch(swiperId, targetId);
      }
    }

    return { isMatch, targetUser };
  }

  async createMatch(user1Id, user2Id) {
    user1Id = Number(user1Id);
    user2Id = Number(user2Id);
    const minId = Math.min(user1Id, user2Id);
    const maxId = Math.max(user1Id, user2Id);

    if (!isUsingFallback()) {
      await db.query(
        `INSERT IGNORE INTO matches (user1_id, user2_id) VALUES (?, ?)`,
        [minId, maxId]
      );
    } else {
      const store = getMockStore();
      const existing = store.matches.find(m => m.user1_id === minId && m.user2_id === maxId);
      if (!existing) {
        store.matches.push({
          id: store.autoIncrementIds.matches++,
          user1_id: minId,
          user2_id: maxId,
          is_active: true,
          matched_at: new Date().toISOString()
        });
        saveStore();
      }
    }
    // Also prepare conversation
    await this.getOrCreateConversation(user1Id, user2Id);
  }

  async getUserMatches(userId) {
    userId = Number(userId);
    let matchedUserIds = [];

    if (!isUsingFallback()) {
      const rows = await db.query(
        `SELECT CASE WHEN user1_id = ? THEN user2_id ELSE user1_id END AS other_id, matched_at
         FROM matches WHERE (user1_id = ? OR user2_id = ?) AND is_active = TRUE
         ORDER BY matched_at DESC`,
        [userId, userId, userId]
      );
      matchedUserIds = rows;
    } else {
      const store = getMockStore();
      matchedUserIds = store.matches
        .filter(m => (m.user1_id === userId || m.user2_id === userId) && m.is_active)
        .map(m => ({
          other_id: m.user1_id === userId ? m.user2_id : m.user1_id,
          matched_at: m.matched_at
        }));
    }

    const results = await Promise.all(matchedUserIds.map(async m => {
      const user = await this.findUserById(m.other_id);
      if (!user) return null;
      const photos = await this.getUserPhotos(user.id);
      const isFollowing = await this.isFollowing(userId, user.id);
      return {
        ...user,
        matched_at: m.matched_at,
        photos: photos.map(p => p.photo_url),
        is_following: isFollowing,
        is_friend: true
      };
    }));

    return results.filter(Boolean);
  }

  // ====================== FOLLOWS & FRIENDS ======================
  async isFollowing(followerId, followingId) {
    followerId = Number(followerId);
    followingId = Number(followingId);
    if (!isUsingFallback()) {
      const rows = await db.query(
        'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
        [followerId, followingId]
      );
      return rows.length > 0;
    }
    const store = getMockStore();
    return (store.follows || []).some(f => f.follower_id === followerId && f.following_id === followingId);
  }

  async toggleFollow(followerId, followingId) {
    followerId = Number(followerId);
    followingId = Number(followingId);
    const followerUser = await this.findUserById(followerId);
    const followingUser = await this.findUserById(followingId);
    if (!followingUser) throw new Error('Người dùng không tồn tại');

    const alreadyFollowing = await this.isFollowing(followerId, followingId);

    if (!alreadyFollowing && followerUser && followingUser && followerUser.gender === followingUser.gender) {
      throw new Error('Hệ thống chỉ cho phép kết bạn / theo dõi người dùng khác giới tính!');
    }

    if (!isUsingFallback()) {
      if (alreadyFollowing) {
        await db.query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [followerId, followingId]);
        return { isFollowing: false, message: `Đã hủy theo dõi ${followingUser.full_name}` };
      } else {
        await db.query('INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)', [followerId, followingId]);
        return { isFollowing: true, message: `Đã theo dõi ${followingUser.full_name} ✨` };
      }
    } else {
      const store = getMockStore();
      if (!store.follows) store.follows = [];
      if (alreadyFollowing) {
        store.follows = store.follows.filter(f => !(f.follower_id === followerId && f.following_id === followingId));
        saveStore();
        return { isFollowing: false, message: `Đã hủy theo dõi ${followingUser.full_name}` };
      } else {
        store.follows.push({
          id: store.autoIncrementIds.follows++,
          follower_id: followerId,
          following_id: followingId,
          created_at: new Date().toISOString()
        });
        saveStore();
        return { isFollowing: true, message: `Đã theo dõi ${followingUser.full_name} ✨` };
      }
    }
  }

  async getFollowing(userId) {
    userId = Number(userId);
    let targetIds = [];
    if (!isUsingFallback()) {
      const rows = await db.query(
        'SELECT following_id as id, created_at FROM follows WHERE follower_id = ? ORDER BY created_at DESC',
        [userId]
      );
      targetIds = rows;
    } else {
      const store = getMockStore();
      targetIds = (store.follows || []).filter(f => f.follower_id === userId).map(f => ({ id: f.following_id, created_at: f.created_at }));
    }

    const currentUser = await this.findUserById(userId);
    const users = await Promise.all(targetIds.map(async item => {
      const u = await this.findUserById(item.id);
      if (!u) return null;
      const photos = await this.getUserPhotos(u.id);
      let distance = 3;
      if (currentUser?.latitude && currentUser?.longitude && u.latitude && u.longitude) {
        distance = Math.max(1, Math.round(this.calcDistance(currentUser.latitude, currentUser.longitude, u.latitude, u.longitude)));
      }
      return {
        ...u,
        photos: photos.map(p => p.photo_url),
        distance_km: distance,
        followed_at: item.created_at,
        is_following: true
      };
    }));
    return users.filter(Boolean);
  }

  async getFollowers(userId) {
    userId = Number(userId);
    let followerIds = [];
    if (!isUsingFallback()) {
      const rows = await db.query(
        'SELECT follower_id as id, created_at FROM follows WHERE following_id = ? ORDER BY created_at DESC',
        [userId]
      );
      followerIds = rows;
    } else {
      const store = getMockStore();
      followerIds = (store.follows || []).filter(f => f.following_id === userId).map(f => ({ id: f.follower_id, created_at: f.created_at }));
    }

    const currentUser = await this.findUserById(userId);
    const users = await Promise.all(followerIds.map(async item => {
      const u = await this.findUserById(item.id);
      if (!u) return null;
      const photos = await this.getUserPhotos(u.id);
      const isFollowingBack = await this.isFollowing(userId, u.id);
      let distance = 3;
      if (currentUser?.latitude && currentUser?.longitude && u.latitude && u.longitude) {
        distance = Math.max(1, Math.round(this.calcDistance(currentUser.latitude, currentUser.longitude, u.latitude, u.longitude)));
      }
      return {
        ...u,
        photos: photos.map(p => p.photo_url),
        distance_km: distance,
        followed_at: item.created_at,
        is_following: isFollowingBack,
        is_mutual: isFollowingBack
      };
    }));
    return users.filter(Boolean);
  }

  async getFriends(userId) {
    userId = Number(userId);
    const currentUser = await this.findUserById(userId);
    let friendIds = new Set();

    // 1. Mutual Matches from swipes
    const matches = await this.getUserMatches(userId);
    matches.forEach(m => friendIds.add(m.id));

    // 2. Mutual Follows
    if (!isUsingFallback()) {
      const mutualRows = await db.query(
        `SELECT f1.following_id as id
         FROM follows f1
         JOIN follows f2 ON f1.follower_id = f2.following_id AND f1.following_id = f2.follower_id
         WHERE f1.follower_id = ?`,
        [userId]
      );
      mutualRows.forEach(r => friendIds.add(r.id));
    } else {
      const store = getMockStore();
      const myFollowing = (store.follows || []).filter(f => f.follower_id === userId).map(f => f.following_id);
      const myFollowers = (store.follows || []).filter(f => f.following_id === userId).map(f => f.follower_id);
      myFollowing.forEach(id => {
        if (myFollowers.includes(id)) friendIds.add(id);
      });
    }

    const users = await Promise.all(Array.from(friendIds).map(async id => {
      const u = await this.findUserById(id);
      if (!u) return null;
      const photos = await this.getUserPhotos(u.id);
      let distance = 3;
      if (currentUser?.latitude && currentUser?.longitude && u.latitude && u.longitude) {
        distance = Math.max(1, Math.round(this.calcDistance(currentUser.latitude, currentUser.longitude, u.latitude, u.longitude)));
      }
      return {
        ...u,
        photos: photos.map(p => p.photo_url),
        distance_km: distance,
        is_friend: true,
        is_following: true
      };
    }));

    return users.filter(Boolean);
  }

  // ====================== CONVERSATIONS & MESSAGES ======================
  async getOrCreateConversation(user1Id, user2Id) {
    user1Id = Number(user1Id);
    user2Id = Number(user2Id);
    const minId = Math.min(user1Id, user2Id);
    const maxId = Math.max(user1Id, user2Id);

    const user1 = await this.findUserById(user1Id);
    const user2 = await this.findUserById(user2Id);
    if (user1 && user2 && user1.gender === user2.gender) {
      throw new Error('Hệ thống hẹn hò chỉ hỗ trợ tạo cuộc trò chuyện với người dùng khác giới tính!');
    }

    if (!isUsingFallback()) {
      let rows = await db.query(
        `SELECT * FROM conversations WHERE user1_id = ? AND user2_id = ?`,
        [minId, maxId]
      );
      if (rows.length > 0) return rows[0];
      const res = await db.query(
        `INSERT INTO conversations (user1_id, user2_id, last_message, last_message_at) VALUES (?, ?, '', NOW())`,
        [minId, maxId]
      );
      return { id: res.insertId, user1_id: minId, user2_id: maxId, last_message: '', last_message_at: new Date() };
    }

    const store = getMockStore();
    let conv = store.conversations.find(c => c.user1_id === minId && c.user2_id === maxId);
    if (!conv) {
      conv = {
        id: store.autoIncrementIds.conversations++,
        user1_id: minId,
        user2_id: maxId,
        last_message: 'Các bạn đã được ghép đôi! Hãy gửi lời chào 👋',
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      store.conversations.push(conv);
      saveStore();
    }
    return conv;
  }

  async getUserConversations(userId) {
    userId = Number(userId);
    let convs = [];

    if (!isUsingFallback()) {
      convs = await db.query(
        `SELECT c.*, 
          CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END AS partner_id,
          (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.receiver_id = ? AND m.is_read = FALSE) AS unread_count,
          (SELECT m.sender_id FROM messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) AS last_sender_id,
          (SELECT m.message_type FROM messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) AS last_message_type,
          (SELECT m.content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) AS latest_content
         FROM conversations c
         WHERE c.user1_id = ? OR c.user2_id = ?
         ORDER BY c.last_message_at DESC`,
        [userId, userId, userId, userId]
      );
    } else {
      const store = getMockStore();
      convs = store.conversations
        .filter(c => c.user1_id === userId || c.user2_id === userId)
        .map(c => {
          const partner_id = c.user1_id === userId ? c.user2_id : c.user1_id;
          const unread_count = store.messages.filter(m => m.conversation_id === c.id && m.receiver_id === userId && !m.is_read).length;
          const convMsgs = store.messages.filter(m => m.conversation_id === c.id);
          const lastMsg = convMsgs[convMsgs.length - 1];
          return {
            ...c,
            partner_id,
            unread_count,
            last_sender_id: lastMsg?.sender_id,
            last_message_type: lastMsg?.message_type,
            latest_content: lastMsg?.content || c.last_message
          };
        })
        .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
    }

    const detailedConvs = await Promise.all(convs.map(async c => {
      const partner = await this.findUserById(c.partner_id);
      const isMeSender = c.last_sender_id === userId;
      const isImage = c.last_message_type === 'image' || (c.last_message && (c.last_message.startsWith('http') || c.last_message.startsWith('data:') || c.last_message.startsWith('/uploads')));
      
      let displayMessage = c.latest_content || c.last_message || 'Bắt đầu cuộc trò chuyện';
      if (isImage) {
        displayMessage = isMeSender ? 'Bạn đã gửi một hình ảnh 📷' : `${partner?.full_name || 'Đối phương'} đã gửi một hình ảnh 📷`;
      } else if (c.last_message_type === 'gift' || (c.last_message && c.last_message.includes('tặng'))) {
        displayMessage = `🎁 ${c.latest_content || c.last_message}`;
      } else if (isMeSender && displayMessage && !displayMessage.startsWith('Bạn:')) {
        displayMessage = `Bạn: ${displayMessage}`;
      }

      return {
        ...c,
        partner,
        display_last_message: displayMessage,
        last_message: displayMessage
      };
    }));

    return detailedConvs;
  }

  async getConversationMessages(conversationId) {
    conversationId = Number(conversationId);
    if (!isUsingFallback()) {
      const rows = await db.query(
        `SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 100`,
        [conversationId]
      );
      return rows.map(m => {
        if (typeof m.metadata === 'string') {
          try { m.metadata = JSON.parse(m.metadata); } catch(e) { m.metadata = {}; }
        }
        return m;
      });
    }
    const store = getMockStore();
    return store.messages.filter(m => m.conversation_id === conversationId).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  async createMessage(conversationId, senderId, receiverId, messageType, content, metadata = {}) {
    senderId = Number(senderId);
    receiverId = Number(receiverId);
    let convId = Number(conversationId);

    const sender = await this.findUserById(senderId);
    const receiver = await this.findUserById(receiverId);
    if (sender && receiver && sender.gender === receiver.gender) {
      throw new Error('Hệ thống hẹn hò chỉ hỗ trợ nhắn tin với người dùng khác giới tính!');
    }

    // Auto resolve conversation if not provided or NaN
    if (!convId || isNaN(convId)) {
      const conv = await this.getOrCreateConversation(senderId, receiverId);
      convId = conv.id;
    }

    const metaJson = JSON.stringify(metadata || {});
    const previewContent = messageType === 'image' ? '[Hình ảnh 📷]' : content;

    if (!isUsingFallback()) {
      const res = await db.query(
        `INSERT INTO messages (conversation_id, sender_id, receiver_id, message_type, content, metadata, is_read)
         VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
        [convId, senderId, receiverId, messageType, content, metaJson]
      );
      await db.query(
        `UPDATE conversations SET last_message = ?, last_message_at = NOW() WHERE id = ?`,
        [previewContent, convId]
      );
      return {
        id: res.insertId,
        conversation_id: convId,
        sender_id: senderId,
        receiver_id: receiverId,
        message_type: messageType,
        content,
        metadata,
        is_read: false,
        created_at: new Date()
      };
    }

    const store = getMockStore();
    const newMsg = {
      id: store.autoIncrementIds.messages++,
      conversation_id: convId,
      sender_id: senderId,
      receiver_id: receiverId,
      message_type: messageType,
      content,
      metadata,
      is_read: false,
      created_at: new Date().toISOString()
    };
    store.messages.push(newMsg);

    const conv = store.conversations.find(c => c.id === convId);
    if (conv) {
      conv.last_message = previewContent;
      conv.last_message_at = new Date().toISOString();
    }
    saveStore();
    return newMsg;
  }

  async markMessagesAsRead(conversationId, userId) {
    conversationId = Number(conversationId);
    userId = Number(userId);
    if (!isUsingFallback()) {
      await db.query('UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND receiver_id = ?', [conversationId, userId]);
    } else {
      const store = getMockStore();
      store.messages.forEach(m => {
        if (m.conversation_id === conversationId && m.receiver_id === userId) {
          m.is_read = true;
        }
      });
      saveStore();
    }
  }

  async recallMessage(messageId, userId) {
    messageId = Number(messageId);
    userId = Number(userId);

    let msg = null;
    if (!isUsingFallback()) {
      const rows = await db.query('SELECT * FROM messages WHERE id = ?', [messageId]);
      msg = rows[0] || null;
      if (!msg) throw new Error('Không tìm thấy tin nhắn');
      if (msg.sender_id !== userId) throw new Error('Bạn chỉ có thể thu hồi tin nhắn của chính mình');

      await db.query(
        `UPDATE messages SET is_recalled = TRUE, content = 'Tin nhắn đã được thu hồi' WHERE id = ?`,
        [messageId]
      );
      const lastMsgRows = await db.query('SELECT * FROM messages WHERE conversation_id = ? ORDER BY id DESC LIMIT 1', [msg.conversation_id]);
      if (lastMsgRows.length > 0 && lastMsgRows[0].id === messageId) {
        await db.query('UPDATE conversations SET last_message = ? WHERE id = ?', ['Tin nhắn đã được thu hồi', msg.conversation_id]);
      }
      return { ...msg, is_recalled: true, content: 'Tin nhắn đã được thu hồi' };
    } else {
      const store = getMockStore();
      msg = store.messages.find(m => m.id === messageId);
      if (!msg) throw new Error('Không tìm thấy tin nhắn');
      if (msg.sender_id !== userId) throw new Error('Bạn chỉ có thể thu hồi tin nhắn của chính mình');

      msg.is_recalled = true;
      msg.content = 'Tin nhắn đã được thu hồi';
      const conv = store.conversations.find(c => c.id === msg.conversation_id);
      if (conv) conv.last_message = 'Tin nhắn đã được thu hồi';
      saveStore();
      return msg;
    }
  }

  async deleteMessage(messageId, userId) {
    messageId = Number(messageId);
    userId = Number(userId);

    let msg = null;
    if (!isUsingFallback()) {
      const rows = await db.query('SELECT * FROM messages WHERE id = ?', [messageId]);
      msg = rows[0] || null;
      if (!msg) throw new Error('Không tìm thấy tin nhắn');
      if (msg.sender_id !== userId) throw new Error('Bạn chỉ có thể xóa tin nhắn của chính mình');

      await db.query('DELETE FROM messages WHERE id = ?', [messageId]);
      const lastMsgRows = await db.query('SELECT * FROM messages WHERE conversation_id = ? ORDER BY id DESC LIMIT 1', [msg.conversation_id]);
      const newLastMsg = lastMsgRows.length > 0 ? (lastMsgRows[0].message_type === 'image' ? '[Hình ảnh 📷]' : lastMsgRows[0].content) : '';
      await db.query('UPDATE conversations SET last_message = ? WHERE id = ?', [newLastMsg, msg.conversation_id]);
      return { id: messageId, conversation_id: msg.conversation_id, receiver_id: msg.receiver_id };
    } else {
      const store = getMockStore();
      const idx = store.messages.findIndex(m => m.id === messageId);
      if (idx === -1) throw new Error('Không tìm thấy tin nhắn');
      msg = store.messages[idx];
      if (msg.sender_id !== userId) throw new Error('Bạn chỉ có thể xóa tin nhắn của chính mình');

      store.messages.splice(idx, 1);
      const remaining = store.messages.filter(m => m.conversation_id === msg.conversation_id);
      const lastRemaining = remaining[remaining.length - 1];
      const conv = store.conversations.find(c => c.id === msg.conversation_id);
      if (conv) {
        conv.last_message = lastRemaining ? (lastRemaining.message_type === 'image' ? '[Hình ảnh 📷]' : lastRemaining.content) : '';
      }
      saveStore();
      return { id: messageId, conversation_id: msg.conversation_id, receiver_id: msg.receiver_id };
    }
  }

  async deleteConversation(conversationId, userId) {
    conversationId = Number(conversationId);
    userId = Number(userId);

    if (!isUsingFallback()) {
      const rows = await db.query('SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)', [conversationId, userId, userId]);
      if (rows.length === 0) throw new Error('Không tìm thấy cuộc hội thoại hoặc bạn không có quyền xóa');

      const conv = rows[0];
      const partnerId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;

      await db.query('DELETE FROM messages WHERE conversation_id = ?', [conversationId]);
      await db.query('DELETE FROM conversations WHERE id = ?', [conversationId]);
      return { success: true, conversationId, partnerId };
    } else {
      const store = getMockStore();
      const idx = store.conversations.findIndex(c => c.id === conversationId && (c.user1_id === userId || c.user2_id === userId));
      if (idx === -1) throw new Error('Không tìm thấy cuộc hội thoại hoặc bạn không có quyền xóa');

      const conv = store.conversations[idx];
      const partnerId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;

      store.messages = store.messages.filter(m => m.conversation_id !== conversationId);
      store.conversations.splice(idx, 1);
      saveStore();
      return { success: true, conversationId, partnerId };
    }
  }

  // ====================== GIFTS (AYARCHAT) ======================
  async getGifts() {
    if (!isUsingFallback()) {
      return await db.query('SELECT * FROM gifts ORDER BY coin_price ASC');
    }
    const store = getMockStore();
    return store.gifts.sort((a, b) => a.coin_price - b.coin_price);
  }

  async getGiftById(id) {
    id = Number(id);
    if (!isUsingFallback()) {
      const rows = await db.query('SELECT * FROM gifts WHERE id = ?', [id]);
      return rows[0] || null;
    }
    const store = getMockStore();
    return store.gifts.find(g => g.id === id) || null;
  }

  async sendGift(senderId, receiverId, giftId) {
    senderId = Number(senderId);
    receiverId = Number(receiverId);
    giftId = Number(giftId);

    const sender = await this.findUserById(senderId);
    const receiver = await this.findUserById(receiverId);
    const gift = await this.getGiftById(giftId);

    if (!sender || !receiver || !gift) throw new Error('Thông tin quà tặng hoặc người dùng không hợp lệ');
    if (sender.coins < gift.coin_price) throw new Error('Số dư Xu không đủ. Vui lòng nạp thêm Xu!');

    // Deduct coins from sender, add diamonds to receiver
    await this.updateUserBalance(senderId, -gift.coin_price, 0);
    await this.updateUserBalance(receiverId, 0, gift.diamond_reward);

    // Record transactions
    await this.createTransaction({
      user_id: senderId,
      type: 'gift_sent',
      amount: gift.coin_price,
      description: `Tặng ${gift.name} cho ${receiver.full_name}`
    });
    await this.createTransaction({
      user_id: receiverId,
      type: 'gift_received',
      amount: gift.diamond_reward,
      description: `Nhận ${gift.name} từ ${sender.full_name}`
    });

    return { success: true, gift, sender, receiver };
  }

  // ====================== CALL LOGS & BILLING ======================
  async createCallLog(data) {
    if (!isUsingFallback()) {
      const res = await db.query(
        `INSERT INTO call_logs (caller_id, receiver_id, call_type, duration_seconds, coins_spent, diamonds_earned, status, started_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [data.caller_id, data.receiver_id, data.call_type || 'direct_video', data.duration_seconds || 0, data.coins_spent || 0, data.diamonds_earned || 0, data.status || 'completed']
      );
      return { id: res.insertId, ...data };
    }
    const store = getMockStore();
    const newLog = {
      id: store.autoIncrementIds.call_logs++,
      caller_id: Number(data.caller_id),
      receiver_id: Number(data.receiver_id),
      call_type: data.call_type || 'direct_video',
      duration_seconds: data.duration_seconds || 0,
      coins_spent: data.coins_spent || 0,
      diamonds_earned: data.diamonds_earned || 0,
      status: data.status || 'completed',
      started_at: new Date().toISOString(),
      ended_at: null
    };
    store.call_logs.push(newLog);
    saveStore();
    return newLog;
  }

  async getUserCallLogs(userId) {
    userId = Number(userId);
    let logs = [];
    if (!isUsingFallback()) {
      logs = await db.query(
        `SELECT cl.*, 
          u1.full_name as caller_name, u1.avatar as caller_avatar,
          u2.full_name as receiver_name, u2.avatar as receiver_avatar
         FROM call_logs cl
         LEFT JOIN users u1 ON cl.caller_id = u1.id
         LEFT JOIN users u2 ON cl.receiver_id = u2.id
         WHERE cl.caller_id = ? OR cl.receiver_id = ?
         ORDER BY cl.started_at DESC LIMIT 50`,
        [userId, userId]
      );
    } else {
      const store = getMockStore();
      logs = store.call_logs.filter(l => l.caller_id === userId || l.receiver_id === userId)
        .map(l => {
          const u1 = store.users.find(u => u.id === l.caller_id) || {};
          const u2 = store.users.find(u => u.id === l.receiver_id) || {};
          return {
            ...l,
            caller_name: u1.full_name,
            caller_avatar: u1.avatar,
            receiver_name: u2.full_name,
            receiver_avatar: u2.avatar
          };
        })
        .sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
    }
    return logs;
  }

  // ====================== WALLET & TRANSACTIONS ======================
  async getCoinPackages() {
    if (!isUsingFallback()) {
      return await db.query('SELECT * FROM coin_packages ORDER BY price_vnd ASC');
    }
    const store = getMockStore();
    return store.coin_packages.sort((a, b) => a.price_vnd - b.price_vnd);
  }

  async createTransaction(data) {
    if (!isUsingFallback()) {
      const res = await db.query(
        `INSERT INTO transactions (user_id, type, amount, money_amount, status, payment_method, description)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [data.user_id, data.type, data.amount, data.money_amount || 0, data.status || 'completed', data.payment_method || 'Momo/Bank', data.description || '']
      );
      return { id: res.insertId, ...data };
    }
    const store = getMockStore();
    const newTx = {
      id: store.autoIncrementIds.transactions++,
      user_id: Number(data.user_id),
      type: data.type,
      amount: data.amount,
      money_amount: data.money_amount || 0,
      status: data.status || 'completed',
      payment_method: data.payment_method || 'Momo/Bank',
      description: data.description || '',
      created_at: new Date().toISOString()
    };
    store.transactions.push(newTx);
    saveStore();
    return newTx;
  }

  async getUserTransactions(userId) {
    userId = Number(userId);
    if (!isUsingFallback()) {
      return await db.query('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    }
    const store = getMockStore();
    return store.transactions.filter(t => t.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // ====================== ADMIN & MODERATION ======================
  async getDashboardStats() {
    if (!isUsingFallback()) {
      const [uRow] = await db.query('SELECT COUNT(*) as total_users FROM users WHERE role != "admin"');
      const [onRow] = await db.query('SELECT COUNT(*) as online_users FROM users WHERE is_online = TRUE');
      const [mRow] = await db.query('SELECT COUNT(*) as total_matches FROM matches');
      const [cRow] = await db.query('SELECT COUNT(*) as total_calls FROM call_logs');
      const [rRow] = await db.query('SELECT IFNULL(SUM(money_amount), 0) as total_revenue FROM transactions WHERE type = "deposit" AND status = "completed"');
      const [gRow] = await db.query('SELECT COUNT(*) as total_gifts_sent FROM transactions WHERE type = "gift_sent"');
      return {
        total_users: uRow?.total_users || 0,
        online_users: onRow?.online_users || 0,
        total_matches: mRow?.total_matches || 0,
        total_calls: cRow?.total_calls || 0,
        total_revenue: Number(rRow?.total_revenue || 0),
        total_gifts_sent: gRow?.total_gifts_sent || 0
      };
    }
    const store = getMockStore();
    return {
      total_users: store.users.filter(u => u.role !== 'admin').length,
      online_users: store.users.filter(u => u.is_online).length,
      total_matches: store.matches.length,
      total_calls: store.call_logs.length,
      total_revenue: store.transactions.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((sum, t) => sum + (t.money_amount || 0), 0),
      total_gifts_sent: store.transactions.filter(t => t.type === 'gift_sent').length
    };
  }

  async getAllUsersAdmin(search = '') {
    if (!isUsingFallback()) {
      let sql = 'SELECT * FROM users WHERE role != "admin"';
      const params = [];
      if (search) {
        sql += ' AND (full_name LIKE ? OR email LIKE ? OR username LIKE ?)';
        const queryTerm = `%${search}%`;
        params.push(queryTerm, queryTerm, queryTerm);
      }
      sql += ' ORDER BY id DESC';
      return await db.query(sql, params);
    }
    const store = getMockStore();
    return store.users.filter(u => {
      if (u.role === 'admin') return false;
      if (!search) return true;
      const s = search.toLowerCase();
      return u.full_name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.username.toLowerCase().includes(s);
    }).sort((a, b) => b.id - a.id);
  }

  async getVerifications() {
    if (!isUsingFallback()) {
      return await db.query(
        `SELECT v.*, u.full_name, u.email, u.avatar, u.username
         FROM verifications v
         JOIN users u ON v.user_id = u.id
         ORDER BY v.created_at DESC`
      );
    }
    const store = getMockStore();
    return store.verifications.map(v => {
      const u = store.users.find(user => user.id === v.user_id) || {};
      return {
        ...v,
        full_name: u.full_name,
        email: u.email,
        avatar: u.avatar,
        username: u.username
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async updateVerification(id, status, admin_note = '') {
    id = Number(id);
    if (!isUsingFallback()) {
      await db.query('UPDATE verifications SET status = ?, admin_note = ? WHERE id = ?', [status, admin_note, id]);
      const [rows] = await db.query('SELECT user_id FROM verifications WHERE id = ?', [id]);
      if (rows.length > 0 && status === 'approved') {
        await db.query('UPDATE users SET is_verified = TRUE WHERE id = ?', [rows[0].user_id]);
      }
      return true;
    }
    const store = getMockStore();
    const v = store.verifications.find(item => item.id === id);
    if (v) {
      v.status = status;
      v.admin_note = admin_note;
      if (status === 'approved') {
        const u = store.users.find(user => user.id === v.user_id);
        if (u) u.is_verified = true;
      }
      saveStore();
    }
    return true;
  }

  async getReports() {
    if (!isUsingFallback()) {
      return await db.query(
        `SELECT r.*, 
          u1.full_name as reporter_name, u1.avatar as reporter_avatar,
          u2.full_name as reported_name, u2.avatar as reported_avatar, u2.is_banned
         FROM reports r
         LEFT JOIN users u1 ON r.reporter_id = u1.id
         LEFT JOIN users u2 ON r.reported_id = u2.id
         ORDER BY r.created_at DESC`
      );
    }
    const store = getMockStore();
    return store.reports.map(r => {
      const u1 = store.users.find(u => u.id === r.reporter_id) || {};
      const u2 = store.users.find(u => u.id === r.reported_id) || {};
      return {
        ...r,
        reporter_name: u1.full_name,
        reporter_avatar: u1.avatar,
        reported_name: u2.full_name,
        reported_avatar: u2.avatar,
        is_banned: u2.is_banned
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async getSystemSettings() {
    if (!isUsingFallback()) {
      const rows = await db.query('SELECT * FROM system_settings');
      const settings = {};
      rows.forEach(r => { settings[r.key_name] = r.value; });
      return settings;
    }
    const store = getMockStore();
    return store.system_settings;
  }

  async updateSystemSetting(key, value) {
    if (!isUsingFallback()) {
      await db.query(
        'INSERT INTO system_settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
        [key, String(value), String(value)]
      );
    } else {
      const store = getMockStore();
      store.system_settings[key] = String(value);
      saveStore();
    }
  }

  // ====================== VIETQR / BANK DEPOSITS ======================
  async createDepositRequest({ user_id, package_id, money_amount, coins_amount, bonus_coins = 0, bank_name, payment_method }) {
    user_id = Number(user_id);
    const code = securityService.generateDepositCode(user_id, money_amount);
    const store = getMockStore();
    const settings = await this.getSystemSettings();

    const deposit = {
      id: store.autoIncrementIds.deposits++,
      user_id,
      package_id: Number(package_id),
      transaction_code: code,
      money_amount: Number(money_amount),
      coins_amount: Number(coins_amount),
      bonus_coins: Number(bonus_coins),
      total_coins: Number(coins_amount) + Number(bonus_coins),
      bank_name: bank_name || settings.bank_name || 'MBBank',
      bank_account: settings.bank_account || '999988886666',
      bank_holder: settings.bank_holder || 'CONG TY CP AYARFLAME VIETNAM',
      status: 'pending', // 'pending' | 'completed' | 'rejected'
      payment_method: payment_method || 'VietQR Chuyển Khoản Ngân Hàng',
      admin_note: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!isUsingFallback()) {
      try {
        const res = await db.query(
          `INSERT INTO deposits (user_id, package_id, transaction_code, money_amount, coins_amount, bonus_coins, total_coins, bank_name, bank_account, bank_holder, status, payment_method, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            deposit.user_id,
            deposit.package_id,
            deposit.transaction_code,
            deposit.money_amount,
            deposit.coins_amount,
            deposit.bonus_coins,
            deposit.total_coins,
            deposit.bank_name,
            deposit.bank_account,
            deposit.bank_holder,
            deposit.status,
            deposit.payment_method
          ]
        );
        if (res && res.insertId) {
          deposit.id = res.insertId;
        }
      } catch (e) {
        // Table might not exist or column difference, fallback to store ID
      }
    }

    if (!store.deposits) store.deposits = [];
    store.deposits.unshift(deposit);
    saveStore();

    // Enqueue audit job
    queueService.add('audit_logs', {
      action: 'DEPOSIT_REQUEST_CREATED',
      userId: user_id,
      details: { code, amount: money_amount, coins: deposit.total_coins }
    });

    return deposit;
  }

  async getDeposits(status = 'all') {
    const store = getMockStore();
    let list = store.deposits || [];
    if (status !== 'all') {
      list = list.filter(d => d.status === status);
    }
    return list.map(d => {
      const user = store.users.find(u => u.id === d.user_id) || {};
      return {
        ...d,
        user_name: user.full_name || 'Khách hàng',
        user_avatar: user.avatar || '',
        user_email: user.email || '',
        user_phone: user.phone || ''
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async approveDeposit(depositId, adminNote = '') {
    depositId = Number(depositId);
    const store = getMockStore();
    const deposit = (store.deposits || []).find(d => d.id === depositId);
    if (!deposit) throw new Error('Không tìm thấy đơn nạp tiền');
    if (deposit.status === 'completed') throw new Error('Đơn nạp tiền này đã được phê duyệt trước đó');

    deposit.status = 'completed';
    deposit.admin_note = adminNote || 'Admin đã xác nhận nhận tiền chuyển khoản thành công';
    deposit.updated_at = new Date().toISOString();

    // Add coins to user
    await this.updateUserBalance(deposit.user_id, deposit.total_coins, 0);

    // Record completed transaction log
    await this.createTransaction({
      user_id: deposit.user_id,
      type: 'deposit',
      amount: deposit.total_coins,
      money_amount: deposit.money_amount,
      status: 'completed',
      payment_method: deposit.payment_method,
      description: `Nạp tiền VietQR: Mã ${deposit.transaction_code} (+${deposit.total_coins} Xu)`
    });

    saveStore();

    // Trigger async notification job
    queueService.add('deposit_notifications', {
      userId: deposit.user_id,
      depositId: deposit.id,
      coins: deposit.total_coins
    });

    return deposit;
  }

  async rejectDeposit(depositId, reason = '') {
    depositId = Number(depositId);
    const store = getMockStore();
    const deposit = (store.deposits || []).find(d => d.id === depositId);
    if (!deposit) throw new Error('Không tìm thấy đơn nạp tiền');
    if (deposit.status === 'completed') throw new Error('Không thể từ chối đơn đã phê duyệt');

    deposit.status = 'rejected';
    deposit.admin_note = reason || 'Chưa nhận được thanh toán hoặc sai nội dung chuyển khoản';
    deposit.updated_at = new Date().toISOString();
    saveStore();
    return deposit;
  }

  // ====================== VOUCHERS & CHECK-IN SYSTEM ======================
  async getUserVouchers(userId) {
    userId = Number(userId);
    const store = getMockStore();
    if (!store.vouchers) store.vouchers = [];

    const now = new Date();
    // Return active vouchers (amount > 0 and not expired)
    return store.vouchers.filter(v => {
      if (v.user_id !== userId) return false;
      if (v.amount <= 0) return false;
      if (v.expires_at && new Date(v.expires_at) < now) return false;
      return true;
    });
  }

  async addVoucher(userId, voucherType, amount = 1, durationHours = null) {
    userId = Number(userId);
    const store = getMockStore();
    if (!store.vouchers) store.vouchers = [];

    const expiresAt = durationHours ? new Date(Date.now() + durationHours * 3600000).toISOString() : null;

    const titles = {
      free_call_2min: 'Vé Gọi Free 2 Phút Đầu 🎟️',
      free_chat: 'Vé Nhắn Tin Miễn Phí 💬'
    };

    const descriptions = {
      free_call_2min: 'Miễn phí cước gọi 2 phút đầu tiên, từ phút thứ 3 mới bắt đầu trừ xu.',
      free_chat: 'Nhắn tin không tốn 10 xu/tin trong thời hạn vé.'
    };

    // Check if existing stackable voucher exists
    const existing = store.vouchers.find(v => v.user_id === userId && v.voucher_type === voucherType && !v.expires_at);
    if (existing && !expiresAt) {
      existing.amount += Number(amount);
      existing.updated_at = new Date().toISOString();
      saveStore();
      return existing;
    }

    const newVoucher = {
      id: store.autoIncrementIds.vouchers++,
      user_id: userId,
      voucher_type: voucherType,
      title: titles[voucherType] || 'Voucher Ưu Đãi',
      description: descriptions[voucherType] || 'Voucher tiện ích hệ thống',
      amount: Number(amount),
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    store.vouchers.unshift(newVoucher);
    saveStore();
    return newVoucher;
  }

  async consumeFreeCallVoucher(userId) {
    userId = Number(userId);
    const store = getMockStore();
    if (!store.vouchers) return false;

    const voucher = store.vouchers.find(v => v.user_id === userId && v.voucher_type === 'free_call_2min' && v.amount > 0);
    if (voucher) {
      voucher.amount -= 1;
      voucher.updated_at = new Date().toISOString();
      saveStore();
      return true;
    }
    return false;
  }

  async hasFreeChatVoucher(userId) {
    userId = Number(userId);
    const vouchers = await this.getUserVouchers(userId);
    return vouchers.some(v => v.voucher_type === 'free_chat' && v.amount > 0);
  }

  async getUserCheckinStatus(userId) {
    userId = Number(userId);
    const store = getMockStore();
    if (!store.daily_checkins) store.daily_checkins = [];

    const record = store.daily_checkins.find(c => c.user_id === userId);
    const lastDate = record ? record.last_checkin_date : null;
    const currentStreak = record ? record.streak_days : 0;
    const canCheckIn = checkinService.canCheckIn(lastDate);

    return {
      can_check_in: canCheckIn,
      streak_days: currentStreak,
      last_checkin_date: lastDate,
      rewards_config: checkinService.getRewardsConfig()
    };
  }

  async claimDailyCheckin(userId) {
    userId = Number(userId);
    const store = getMockStore();
    if (!store.daily_checkins) store.daily_checkins = [];

    let record = store.daily_checkins.find(c => c.user_id === userId);
    const lastDate = record ? record.last_checkin_date : null;
    const currentStreak = record ? record.streak_days : 0;

    if (!checkinService.canCheckIn(lastDate)) {
      throw new Error('Bạn đã điểm danh hôm nay rồi. Hãy quay lại vào ngày mai nhé!');
    }

    const nextStreak = checkinService.calculateNextStreak(currentStreak, lastDate);
    const rewards = checkinService.getRewardsConfig();
    const todayReward = rewards.find(r => r.day === nextStreak) || rewards[0];

    // Deliver reward
    let rewardSummary = todayReward.title;
    if (todayReward.type === 'coins') {
      await this.updateUserBalance(userId, todayReward.amount, 0);
    } else if (todayReward.type === 'voucher') {
      await this.addVoucher(userId, todayReward.voucher_type, todayReward.amount, todayReward.duration_hours);
    } else if (todayReward.type === 'combo') {
      if (todayReward.coins) await this.updateUserBalance(userId, todayReward.coins, 0);
      for (const v of todayReward.vouchers) {
        await this.addVoucher(userId, v.voucher_type, v.amount);
      }
    }

    const nowIso = new Date().toISOString();
    if (record) {
      record.streak_days = nextStreak;
      record.last_checkin_date = nowIso;
      record.total_checkins = (record.total_checkins || 0) + 1;
    } else {
      record = {
        id: store.autoIncrementIds.daily_checkins++,
        user_id: userId,
        streak_days: nextStreak,
        last_checkin_date: nowIso,
        total_checkins: 1
      };
      store.daily_checkins.push(record);
    }

    saveStore();

    const updatedUser = await this.findUserById(userId);
    const vouchers = await this.getUserVouchers(userId);

    return {
      success: true,
      streak_days: nextStreak,
      reward: todayReward,
      message: `Điểm danh Ngày ${nextStreak} thành công! Nhận: ${rewardSummary} 🎉`,
      new_coins: updatedUser.coins,
      vouchers
    };
  }

  // ====================== BUSY SUGGESTIONS & CALL AVAILABILITY ======================
  async getBusyCallSuggestions(callerId, busyUserId, limit = 4) {
    callerId = Number(callerId);
    busyUserId = Number(busyUserId);
    const caller = await this.findUserById(callerId);
    if (!caller) return [];

    const targetGender = caller.gender === 'male' ? 'female' : 'male';
    const store = getMockStore();

    const candidates = store.users.filter(u =>
      u.id !== callerId &&
      u.id !== busyUserId &&
      u.gender === targetGender &&
      !u.is_banned &&
      u.is_online === true &&
      !u.is_in_call
    );

    // Rank by location & rating using locationService
    const ranked = locationService.rankCandidates(caller, candidates);
    return ranked.slice(0, limit).map(u => {
      const { password: _, ...safe } = u;
      return safe;
    });
  }

  // ====================== COMPREHENSIVE ADMIN USER DETAILS ======================
  async getAdminUserDetails(userId) {
    userId = Number(userId);
    const user = await this.findUserById(userId);
    if (!user) throw new Error('Không tìm thấy người dùng');

    const store = getMockStore();

    // 1. Transactions
    const transactions = (store.transactions || []).filter(t => t.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // 2. Call Logs
    const callLogs = (store.call_logs || []).filter(c => c.caller_id === userId || c.receiver_id === userId).map(c => {
      const partnerId = c.caller_id === userId ? c.receiver_id : c.caller_id;
      const partner = store.users.find(u => u.id === partnerId) || {};
      return {
        ...c,
        is_caller: c.caller_id === userId,
        partner_name: partner.full_name || 'Người dùng',
        partner_avatar: partner.avatar || ''
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // 3. Messages Summary
    const userConversations = (store.conversations || []).filter(c => c.user1_id === userId || c.user2_id === userId).map(c => {
      const partnerId = c.user1_id === userId ? c.user2_id : c.user1_id;
      const partner = store.users.find(u => u.id === partnerId) || {};
      return {
        ...c,
        partner_id: partnerId,
        partner_name: partner.full_name || 'Người dùng',
        partner_avatar: partner.avatar || ''
      };
    });

    // 4. Vouchers
    const vouchers = await this.getUserVouchers(userId);

    // 5. Deposits
    const deposits = (store.deposits || []).filter(d => d.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // 6. Reports (both filed by user and filed against user)
    const reportsAgainst = (store.reports || []).filter(r => r.reported_id === userId);
    const reportsFiled = (store.reports || []).filter(r => r.reporter_id === userId);

    const { password: _, ...safeUser } = user;

    return {
      user: safeUser,
      stats: {
        total_spent_coins: transactions.filter(t => t.amount > 0 && t.type !== 'deposit').reduce((sum, t) => sum + (t.amount || 0), 0),
        total_deposited_money: deposits.filter(d => d.status === 'completed').reduce((sum, d) => sum + (d.money_amount || 0), 0),
        total_calls_made: callLogs.filter(c => c.caller_id === userId).length,
        total_calls_received: callLogs.filter(c => c.receiver_id === userId).length,
        total_reports_received: reportsAgainst.length
      },
      transactions,
      call_logs: callLogs,
      conversations: userConversations,
      vouchers,
      deposits,
      reports_against: reportsAgainst,
      reports_filed: reportsFiled
    };
  }

  // ====================== BUSY CALL SUGGESTIONS ======================
  async getBusyCallSuggestions(callerId, busyUserId, limit = 4) {
    callerId = Number(callerId);
    busyUserId = Number(busyUserId);
    const caller = await this.findUserById(callerId);
    const targetOppositeGender = caller && caller.gender === 'male' ? 'female' : 'male';

    let candidates = [];
    if (!isUsingFallback()) {
      const rows = await db.query(
        `SELECT u.* FROM users u
         WHERE u.id != ? AND u.id != ? AND u.is_banned = FALSE
           AND u.gender = ? AND u.is_online = TRUE AND (u.is_in_call IS NULL OR u.is_in_call = FALSE)
         ORDER BY u.is_host DESC, RAND() LIMIT ?`,
        [callerId, busyUserId, targetOppositeGender, Number(limit) * 2]
      );
      candidates = rows;
    } else {
      const store = getMockStore();
      candidates = (store.users || []).filter(u => {
        if (u.id === callerId || u.id === busyUserId || u.is_banned) return false;
        if (u.gender !== targetOppositeGender) return false;
        if (!u.is_online || u.is_in_call) return false;
        return true;
      });
    }

    // Attach photos and calculate distance
    const fullCandidates = await Promise.all(candidates.map(async u => {
      const photos = await this.getUserPhotos(u.id);
      let distance = 3;
      if (caller && caller.latitude && caller.longitude && u.latitude && u.longitude) {
        distance = Math.max(1, Math.round(this.calcDistance(caller.latitude, caller.longitude, u.latitude, u.longitude)));
      }
      const { password: _, ...safe } = u;
      return {
        ...safe,
        distance_km: distance,
        photos: photos.map(p => p.photo_url)
      };
    }));

    // Sort by proximity & host status
    fullCandidates.sort((a, b) => {
      if (a.is_host !== b.is_host) return (b.is_host ? 1 : 0) - (a.is_host ? 1 : 0);
      return (a.distance_km || 999) - (b.distance_km || 999);
    });

  // ====================== REAL-TIME CHAT & MESSENGER SYSTEM ======================
  async getUserConversations(userId) {
    userId = Number(userId);
    const store = getMockStore();
    if (!store.conversations) store.conversations = [];
    if (!store.messages) store.messages = [];

    const userConvs = store.conversations.filter(c => c.user1_id === userId || c.user2_id === userId);
    
    const detailedConvs = await Promise.all(userConvs.map(async (c) => {
      const partnerId = c.user1_id === userId ? c.user2_id : c.user1_id;
      const partner = await this.findUserById(partnerId);
      if (!partner) return null;

      // Get unread count
      const unreadCount = store.messages.filter(m => m.conversation_id === c.id && m.receiver_id === userId && !m.is_read).length;
      const photos = await this.getUserPhotos(partner.id);
      const { password: _, ...safePartner } = partner;
      safePartner.photos = photos.map(p => p.photo_url);

      return {
        id: c.id,
        partner_id: partner.id,
        partner: safePartner,
        last_message: c.last_message || '',
        last_message_at: c.last_message_at || c.created_at,
        unread_count: unreadCount,
        created_at: c.created_at
      };
    }));

    return detailedConvs.filter(Boolean).sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
  }

  async getConversationMessages(conversationId) {
    conversationId = Number(conversationId);
    const store = getMockStore();
    if (!store.messages) store.messages = [];

    const msgs = store.messages.filter(m => m.conversation_id === conversationId);
    return msgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  async markMessagesAsRead(conversationId, userId) {
    conversationId = Number(conversationId);
    userId = Number(userId);
    const store = getMockStore();
    if (!store.messages) store.messages = [];

    let updated = false;
    store.messages.forEach(m => {
      if (m.conversation_id === conversationId && m.receiver_id === userId && !m.is_read) {
        m.is_read = true;
        updated = true;
      }
    });

    if (updated) saveStore();
    return true;
  }

  async createMessage(conversationId, senderId, receiverId, messageType, content, metadata = {}) {
    senderId = Number(senderId);
    receiverId = Number(receiverId);
    const store = getMockStore();
    if (!store.conversations) store.conversations = [];
    if (!store.messages) store.messages = [];
    if (!store.autoIncrementIds) store.autoIncrementIds = {};
    if (!store.autoIncrementIds.conversations) store.autoIncrementIds.conversations = 1;
    if (!store.autoIncrementIds.messages) store.autoIncrementIds.messages = 1;

    let conv = null;
    if (conversationId && typeof conversationId === 'number') {
      conv = store.conversations.find(c => c.id === Number(conversationId));
    }

    if (!conv) {
      conv = store.conversations.find(c =>
        (c.user1_id === senderId && c.user2_id === receiverId) ||
        (c.user1_id === receiverId && c.user2_id === senderId)
      );
    }

    if (!conv) {
      conv = {
        id: store.autoIncrementIds.conversations++,
        user1_id: Math.min(senderId, receiverId),
        user2_id: Math.max(senderId, receiverId),
        last_message: messageType === 'image' ? '[Hình ảnh]' : messageType === 'video' ? '[Video]' : content,
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      store.conversations.push(conv);
    } else {
      conv.last_message = messageType === 'image' ? '[Hình ảnh]' : messageType === 'video' ? '[Video]' : content;
      conv.last_message_at = new Date().toISOString();
    }

    const newMsg = {
      id: store.autoIncrementIds.messages++,
      conversation_id: conv.id,
      sender_id: senderId,
      receiver_id: receiverId,
      message_type: messageType || 'text',
      content: content,
      metadata: metadata || {},
      is_read: false,
      is_recalled: false,
      created_at: new Date().toISOString()
    };

    store.messages.push(newMsg);
    saveStore();

    return newMsg;
  }

  async recallMessage(messageId, userId) {
    messageId = Number(messageId);
    userId = Number(userId);
    const store = getMockStore();
    const msg = (store.messages || []).find(m => m.id === messageId);
    if (!msg) throw new Error('Không tìm thấy tin nhắn');
    if (msg.sender_id !== userId) throw new Error('Bạn chỉ có thể thu hồi tin nhắn của chính mình');

    msg.is_recalled = true;
    msg.content = 'Tin nhắn đã được thu hồi';
    saveStore();
    return msg;
  }

  async deleteMessage(messageId, userId) {
    messageId = Number(messageId);
    userId = Number(userId);
    const store = getMockStore();
    const msg = (store.messages || []).find(m => m.id === messageId);
    if (!msg) throw new Error('Không tìm thấy tin nhắn');
    if (msg.sender_id !== userId && msg.receiver_id !== userId) throw new Error('Bạn không có quyền xóa tin nhắn này');

    store.messages = store.messages.filter(m => m.id !== messageId);
    saveStore();
    return msg;
  }

  async deleteConversation(conversationId, userId) {
    conversationId = Number(conversationId);
    userId = Number(userId);
    const store = getMockStore();
    store.conversations = (store.conversations || []).filter(c => c.id !== conversationId);
    store.messages = (store.messages || []).filter(m => m.conversation_id !== conversationId);
    saveStore();
    return true;
  }
}

module.exports = new DataService();

