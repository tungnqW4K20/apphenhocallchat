const dataService = require('../models/dataService');
const securityService = require('../services/securityService');

// Maps to track active users, queues, and call sessions
const userSockets = new Map(); // userId -> Set of socketIds
const socketUsers = new Map(); // socketId -> userId
const randomQueue = []; // [{ socketId, userId, user, genderFilter, regionFilter, joinedAt }]
const activeCallSessions = new Map(); // sessionId -> { callerId, receiverId, callType, startedAt, timerInterval, callerSocketId, receiverSocketId, hasFree2MinVoucher }

function isUserInActiveCall(userId) {
  for (const session of activeCallSessions.values()) {
    if (session.callerId === userId || session.receiverId === userId) {
      return true;
    }
  }
  return false;
}

function setupSockets(io) {
  io.on('connection', (socket) => {
    const userId = Number(socket.handshake.query.userId);

    const bindUserSocket = (uId) => {
      if (uId && !isNaN(uId)) {
        socketUsers.set(socket.id, uId);
        if (!userSockets.has(uId)) {
          userSockets.set(uId, new Set());
        }
        userSockets.get(uId).add(socket.id);

        dataService.updateUser(uId, { is_online: true }).catch(console.error);
        io.emit('user_presence_change', { userId: uId, is_online: true });
        console.log(`👤 User bound to socket: ${uId} (Socket: ${socket.id})`);
      }
    };

    if (userId && !isNaN(userId)) {
      bindUserSocket(userId);
    }

    socket.on('register_user', (data) => {
      const uId = Number(data?.userId);
      bindUserSocket(uId);
    });

    console.log(`⚡ Socket connected: ${socket.id} (User: ${userId || 'Guest'})`);

    // ================= REAL-TIME CHAT =================
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, receiverId, messageType, content, metadata } = data;
        const senderId = socketUsers.get(socket.id) || data.senderId;

        const newMsg = await dataService.createMessage(
          conversationId,
          senderId,
          receiverId,
          messageType || 'text',
          content,
          metadata || {}
        );

        // Emit to sender
        socket.emit('new_message', newMsg);

        // Emit to receiver's sockets if online
        const receiverSockets = userSockets.get(Number(receiverId));
        if (receiverSockets) {
          receiverSockets.forEach(sId => {
            io.to(sId).emit('new_message', newMsg);
          });
        }
      } catch (err) {
        console.error('Socket send_message error:', err);
      }
    });

    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      const senderId = socketUsers.get(socket.id);
      const receiverSockets = userSockets.get(Number(receiverId));
      if (receiverSockets) {
        receiverSockets.forEach(sId => {
          io.to(sId).emit('user_typing', { senderId, isTyping });
        });
      }
    });

    // ================= 1v1 DIRECT VIDEO/VOICE CALL =================
    socket.on('call_user', async (data) => {
      try {
        const { receiverId, callType, offer } = data;
        let callerId = socketUsers.get(socket.id);
        if (!callerId && data.callerId) {
          callerId = Number(data.callerId);
          bindUserSocket(callerId);
        }

        const caller = await dataService.findUserById(callerId);
        const receiver = await dataService.findUserById(receiverId);

        if (!receiver) {
          return socket.emit('call_failed', { message: 'Người dùng không tồn tại' });
        }

        // Check if caller has enough coins (minimum 20 coins for 1 min), free for admin and female accounts
        const isFreeCaller = caller?.role === 'admin' || caller?.gender === 'female';
        if (caller && !isFreeCaller && (caller.coins || 0) < 20) {
          return socket.emit('call_failed', { message: 'Số dư không đủ để thực hiện cuộc gọi (cần tối thiểu 20 Xu)!' });
        }

        // 1. Check if receiver is BUSY in another call
        if (receiver.is_in_call || isUserInActiveCall(Number(receiverId))) {
          const suggestions = await dataService.getBusyCallSuggestions(callerId, receiverId, 4);
          return socket.emit('call_busy', {
            message: `${receiver.full_name} hiện đang bận cuộc gọi khác!`,
            busyUser: { id: receiver.id, full_name: receiver.full_name, avatar: receiver.avatar },
            suggestions
          });
        }

        // 2. Check if receiver is connected via real WebSockets
        const receiverSockets = userSockets.get(Number(receiverId));
        if (receiverSockets && receiverSockets.size > 0) {
          const { password: _, ...callerSafe } = caller;
          receiverSockets.forEach(sId => {
            io.to(sId).emit('incoming_call', {
              caller: callerSafe,
              callerSocketId: socket.id,
              callType: callType || 'video',
              offer
            });
          });
          socket.emit('call_ringing', { receiver: { id: receiver.id, full_name: receiver.full_name, avatar: receiver.avatar } });
        } else {
          // Real registered user who is currently not connected on socket
          const suggestions = await dataService.getBusyCallSuggestions(callerId, receiverId, 4);
          return socket.emit('call_busy', {
            message: `${receiver.full_name} hiện không có kết nối trực tuyến (chưa mở app)! Hãy thử lại khi đối phương online hoặc chọn người khác bên dưới.`,
            busyUser: { id: receiver.id, full_name: receiver.full_name, avatar: receiver.avatar },
            suggestions
          });
        }
      } catch (err) {
        console.error('Socket call_user error:', err);
      }
    });

    socket.on('answer_call', async (data) => {
      try {
        const { callerSocketId, answer } = data;
        const receiverId = socketUsers.get(socket.id);
        const callerId = socketUsers.get(callerSocketId);

        const caller = await dataService.findUserById(callerId);
        const receiver = await dataService.findUserById(receiverId);

        // Mark both in call
        if (callerId) dataService.updateUser(callerId, { is_in_call: true }).catch(console.error);
        if (receiverId) dataService.updateUser(receiverId, { is_in_call: true }).catch(console.error);

        // Check if caller has a Free 2-Min Call Voucher
        const hasFree2MinVoucher = callerId ? await dataService.consumeFreeCallVoucher(callerId) : false;

        // Generate Watermark Tokens for Anti-Screen Capture Protection
        const callerWatermark = caller ? securityService.generateCallWatermark(caller.id, caller.full_name, caller.role) : null;
        const receiverWatermark = receiver ? securityService.generateCallWatermark(receiver.id, receiver.full_name, receiver.role) : null;

        io.to(callerSocketId).emit('call_accepted', {
          receiverSocketId: socket.id,
          receiverId,
          answer,
          hasFree2MinVoucher,
          watermark: receiverWatermark
        });

        socket.emit('call_started_info', {
          hasFree2MinVoucher,
          watermark: callerWatermark
        });

        // Start call session billing
        startCallBilling(io, callerSocketId, socket.id, callerId, receiverId, 'direct_video', null, hasFree2MinVoucher);
      } catch (err) {
        console.error('answer_call error:', err);
      }
    });

    socket.on('reject_call', (data) => {
      const { callerSocketId, reason } = data;
      io.to(callerSocketId).emit('call_rejected', {
        reason: reason || 'Người nhận đã từ chối cuộc gọi'
      });
    });

    socket.on('ice_candidate', (data) => {
      const { targetSocketId, candidate } = data;
      if (targetSocketId && candidate) {
        io.to(targetSocketId).emit('webrtc_ice_candidate', {
          candidate,
          fromSocketId: socket.id
        });
      }
    });

    socket.on('webrtc_offer', (data) => {
      const { targetSocketId, offer } = data;
      if (targetSocketId && offer) {
        io.to(targetSocketId).emit('webrtc_offer', {
          offer,
          fromSocketId: socket.id
        });
      }
    });

    socket.on('webrtc_answer', (data) => {
      const { targetSocketId, answer } = data;
      if (targetSocketId && answer) {
        io.to(targetSocketId).emit('webrtc_answer', {
          answer,
          fromSocketId: socket.id
        });
      }
    });

    socket.on('webrtc_ice_candidate', (data) => {
      const { targetSocketId, candidate } = data;
      if (targetSocketId && candidate) {
        io.to(targetSocketId).emit('webrtc_ice_candidate', {
          candidate,
          fromSocketId: socket.id
        });
      }
    });

    socket.on('end_call', async (data) => {
      const { targetSocketId, sessionId } = data;
      if (targetSocketId) {
        io.to(targetSocketId).emit('call_ended', { by: socket.id });
      }
      stopCallBilling(sessionId || `${socket.id}_${targetSocketId}`);
    });

    // ================= AYARCHAT RANDOM VIDEO MATCH =================
    socket.on('join_random_queue', async (data) => {
      try {
        let uId = socketUsers.get(socket.id);
        if (!uId && data?.userId) {
          uId = Number(data.userId);
          bindUserSocket(uId);
        }
        if (!uId) return;

        const user = await dataService.findUserById(uId);
        if (!user) return;

        // Check if user has coins (at least 20 xu for male users)
        if (user.gender !== 'female' && (user.coins || 0) < 20) {
          return socket.emit('random_queue_error', { message: 'Bạn cần tối thiểu 20 Xu để bắt đầu ghép đôi video ngẫu nhiên!' });
        }

        // Remove from existing queue if already present
        const existingIdx = randomQueue.findIndex(q => q.userId === uId || q.socketId === socket.id);
        if (existingIdx !== -1) {
          randomQueue.splice(existingIdx, 1);
        }

        const { genderFilter = 'all', regionFilter = 'all' } = data || {};
        const targetOppositeGender = user.gender === 'male' ? 'female' : 'male';

        // Find match in queue
        let matchIndex = -1;
        for (let i = 0; i < randomQueue.length; i++) {
          const candidate = randomQueue[i];
          if (candidate.userId === uId || candidate.socketId === socket.id) continue;

          // Priority 1: Match opposite gender
          if (candidate.user.gender === targetOppositeGender || candidate.user.gender !== user.gender) {
            matchIndex = i;
            break;
          }
        }

        // Fallback: If only 2 users in queue, match them immediately
        if (matchIndex === -1 && randomQueue.length > 0) {
          matchIndex = 0;
        }

        if (matchIndex !== -1) {
          // Found a match!
          const partner = randomQueue.splice(matchIndex, 1)[0];
          const sessionId = `rand_${uId}_${partner.userId}_${Date.now()}`;

          const { password: _1, ...userSafe } = user;
          const { password: _2, ...partnerSafe } = partner.user;

          // Check Free 2-Min voucher for initiator
          const hasFree2MinVoucher = await dataService.consumeFreeCallVoucher(uId);

          // Watermarks
          const userWatermark = securityService.generateCallWatermark(user.id, user.full_name, user.role);
          const partnerWatermark = securityService.generateCallWatermark(partner.user.id, partner.user.full_name, partner.user.role);

          // Mark in-call
          dataService.updateUser(uId, { is_in_call: true }).catch(console.error);
          dataService.updateUser(partner.userId, { is_in_call: true }).catch(console.error);

          socket.emit('random_match_found', {
            partner: partnerSafe,
            partnerSocketId: partner.socketId,
            isInitiator: true,
            sessionId,
            hasFree2MinVoucher,
            watermark: partnerWatermark
          });

          io.to(partner.socketId).emit('random_match_found', {
            partner: userSafe,
            partnerSocketId: socket.id,
            isInitiator: false,
            sessionId,
            hasFree2MinVoucher,
            watermark: userWatermark
          });

          // Start billing session
          startCallBilling(io, socket.id, partner.socketId, uId, partner.userId, 'random_video', sessionId, hasFree2MinVoucher);
        } else {
          // Add to queue
          randomQueue.push({
            socketId: socket.id,
            userId: uId,
            user,
            genderFilter,
            regionFilter,
            joinedAt: Date.now()
          });
          socket.emit('random_queue_waiting', { message: 'Đang tìm kiếm đối phương phù hợp gần bạn...' });
        }
      } catch (err) {
        console.error('join_random_queue error:', err);
      }
    });

    socket.on('leave_random_queue', () => {
      const idx = randomQueue.findIndex(q => q.socketId === socket.id);
      if (idx !== -1) {
        randomQueue.splice(idx, 1);
      }
      socket.emit('random_queue_left');
    });

    socket.on('skip_random_partner', (data) => {
      const { partnerSocketId, sessionId } = data;
      if (partnerSocketId) {
        io.to(partnerSocketId).emit('partner_skipped');
      }
      stopCallBilling(sessionId);
    });

    // ================= IN-CALL LIVE GIFTS (AYARCHAT) =================
    socket.on('send_call_gift', async (data) => {
      try {
        const { targetSocketId, targetUserId, giftId, sessionId } = data;
        const senderId = socketUsers.get(socket.id);

        const result = await dataService.sendGift(senderId, targetUserId, giftId);

        // Broadcast gift animation to both participants
        const giftPayload = {
          gift: result.gift,
          senderName: result.sender.full_name,
          senderAvatar: result.sender.avatar,
          animationType: result.gift.animation_type || 'floating'
        };

        socket.emit('call_gift_effect', { ...giftPayload, isMine: true });
        if (targetSocketId) {
          io.to(targetSocketId).emit('call_gift_effect', { ...giftPayload, isMine: false });
        }

        // Notify updated balance
        const updatedSender = await dataService.findUserById(senderId);
        const updatedReceiver = await dataService.findUserById(targetUserId);
        socket.emit('balance_updated', { coins: updatedSender.coins, diamonds: updatedSender.diamonds });
        if (targetSocketId) {
          io.to(targetSocketId).emit('balance_updated', { coins: updatedReceiver.coins, diamonds: updatedReceiver.diamonds });
        }
      } catch (err) {
        socket.emit('call_gift_error', { message: err.message });
      }
    });

    // ================= IN-CALL LIVE CHAT MESSAGING =================
    socket.on('in_call_message', (data) => {
      const { targetSocketId, message } = data;
      if (targetSocketId) {
        io.to(targetSocketId).emit('in_call_message', message);
      }
    });

    // ================= DISCONNECT =================
    socket.on('disconnect', async (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} (Lý do: ${reason})`);
      const uId = socketUsers.get(socket.id);
      socketUsers.delete(socket.id);

      // Remove from random queue
      const qIdx = randomQueue.findIndex(q => q.socketId === socket.id);
      if (qIdx !== -1) randomQueue.splice(qIdx, 1);

      // Clean up user sockets
      if (uId && userSockets.has(uId)) {
        const set = userSockets.get(uId);
        set.delete(socket.id);
        if (set.size === 0) {
          userSockets.delete(uId);
          await dataService.updateUser(uId, { is_online: false, is_in_call: false }).catch(console.error);
          io.emit('user_presence_change', { userId: uId, is_online: false });
        }
      }

      // Check active calls and end if participant disconnected
      for (const [sId, session] of activeCallSessions.entries()) {
        if (session.callerSocketId === socket.id || session.receiverSocketId === socket.id) {
          const otherSocket = session.callerSocketId === socket.id ? session.receiverSocketId : session.callerSocketId;
          io.to(otherSocket).emit('call_ended', { reason: 'Đối phương đã mất kết nối' });
          stopCallBilling(sId);
        }
      }
    });
  });
}

// Live Call Billing Engine (Every 60s) with 2-Minute Free Voucher Support
function startCallBilling(io, callerSocketId, receiverSocketId, callerId, receiverId, callType, customSessionId, hasFree2MinVoucher = false) {
  const sessionId = customSessionId || `${callerSocketId}_${receiverSocketId}_${Date.now()}`;
  if (activeCallSessions.has(sessionId)) return;

  const startedAt = Date.now();
  let totalCoinsSpent = 0;
  let totalDiamondsEarned = 0;
  let minutesElapsed = 0;

  const timerInterval = setInterval(async () => {
    try {
      minutesElapsed += 1;
      const caller = await dataService.findUserById(callerId);
      const receiver = await dataService.findUserById(receiverId);

      if (!caller || !receiver) {
        stopCallBilling(sessionId);
        return;
      }

      // Free calls for admin and female accounts
      const isFreeAccount = caller.role === 'admin' || caller.gender === 'female';
      const rate = receiver.is_host ? (receiver.call_rate_per_min || 20) : 20;

      // Check if this minute is FREE under the 2-min free call voucher
      const isFreeMinute = isFreeAccount || (hasFree2MinVoucher && minutesElapsed <= 2);

      if (!isFreeMinute) {
        if ((caller.coins || 0) < rate) {
          // Insufficient coins -> End call automatically
          io.to(callerSocketId).emit('call_ended_insufficient_coins', { message: 'Bạn đã hết Xu để duy trì cuộc gọi. Vui lòng nạp thêm Xu!' });
          io.to(receiverSocketId).emit('call_ended_insufficient_coins', { message: 'Cuộc gọi kết thúc do đối phương không đủ Xu!' });
          stopCallBilling(sessionId);
          return;
        }

        // Deduct coins & reward diamonds
        const diamondReward = Math.floor(rate * 0.7);
        await dataService.updateUserBalance(callerId, -rate, 0);
        await dataService.updateUserBalance(receiverId, 0, diamondReward);

        totalCoinsSpent += rate;
        totalDiamondsEarned += diamondReward;
      }

      const updatedCaller = await dataService.findUserById(callerId);
      const updatedReceiver = await dataService.findUserById(receiverId);

      // Emit live updates to caller
      io.to(callerSocketId).emit('call_coin_tick', {
        deducted: isFreeMinute ? 0 : rate,
        is_free: isFreeMinute,
        minute: minutesElapsed,
        free_reason: isFreeMinute ? (isFreeAccount ? 'Miễn phí cho Nữ / Admin' : `Miễn phí phút ${minutesElapsed}/2 (Voucher)`) : null,
        remaining_coins: updatedCaller ? updatedCaller.coins : 0,
        duration_seconds: Math.floor((Date.now() - startedAt) / 1000)
      });
      if (updatedCaller) {
        io.to(callerSocketId).emit('balance_updated', {
          coins: updatedCaller.coins,
          diamonds: updatedCaller.diamonds
        });
      }

      // Emit live updates to receiver
      io.to(receiverSocketId).emit('call_diamond_tick', {
        earned: isFreeMinute ? 0 : Math.floor(rate * 0.7),
        total_diamonds: updatedReceiver ? updatedReceiver.diamonds : 0,
        minute: minutesElapsed,
        duration_seconds: Math.floor((Date.now() - startedAt) / 1000)
      });
      if (updatedReceiver) {
        io.to(receiverSocketId).emit('balance_updated', {
          coins: updatedReceiver.coins,
          diamonds: updatedReceiver.diamonds
        });
      }
    } catch (err) {
      console.error('Call billing tick error:', err);
    }
  }, 60000); // 60 seconds per minute

  activeCallSessions.set(sessionId, {
    callerSocketId,
    receiverSocketId,
    callerId,
    receiverId,
    callType,
    startedAt,
    timerInterval,
    hasFree2MinVoucher,
    getStats: () => ({
      duration: Math.floor((Date.now() - startedAt) / 1000),
      coinsSpent: totalCoinsSpent,
      diamondsEarned: totalDiamondsEarned
    })
  });
}

function stopCallBilling(sessionIdOrSocketId) {
  if (!sessionIdOrSocketId) return;
  let targetSessionId = sessionIdOrSocketId;
  let session = activeCallSessions.get(targetSessionId);

  if (!session) {
    for (const [sId, sess] of activeCallSessions.entries()) {
      if (sess.callerSocketId === sessionIdOrSocketId || sess.receiverSocketId === sessionIdOrSocketId || sId.includes(sessionIdOrSocketId)) {
        targetSessionId = sId;
        session = sess;
        break;
      }
    }
  }

  if (session) {
    clearInterval(session.timerInterval);
    const stats = session.getStats ? session.getStats() : { duration: 0, coinsSpent: 0, diamondsEarned: 0 };

    // Reset in_call status
    if (session.callerId) dataService.updateUser(session.callerId, { is_in_call: false }).catch(console.error);
    if (session.receiverId) dataService.updateUser(session.receiverId, { is_in_call: false }).catch(console.error);

    // Save call log
    dataService.createCallLog({
      caller_id: session.callerId,
      receiver_id: session.receiverId,
      call_type: session.callType,
      duration_seconds: stats.duration,
      coins_spent: stats.coinsSpent,
      diamonds_earned: stats.diamondsEarned,
      status: 'completed'
    }).catch(console.error);

    activeCallSessions.delete(targetSessionId);
  }
}

module.exports = { setupSockets };
