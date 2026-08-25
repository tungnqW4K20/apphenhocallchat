import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

const WebRTCContext = createContext(null);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:openrelay.metered.ca:80' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ],
  iceCandidatePoolSize: 10
};

export const WebRTCProvider = ({ children }) => {
  const { socket } = useSocket();
  const { currentUser, updateBalance } = useAuth();

  const [isInCall, setIsInCall] = useState(false);
  const [callPartner, setCallPartner] = useState(null);
  const [callType, setCallType] = useState('video'); // 'video' | 'voice'
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [beautyFilter, setBeautyFilter] = useState(false);

  // Live Coin Deduction Notification (e.g. -20 Xu Phút 1)
  const [latestCoinTick, setLatestCoinTick] = useState(null);

  // Streams state for reliable UI attachment
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // Random Queue State
  const [isSearchingQueue, setIsSearchingQueue] = useState(false);
  const [queueMessage, setQueueMessage] = useState('');

  // Floating gift animations in call
  const [giftAnimations, setGiftAnimations] = useState([]);

  // In-call live chat messages
  const [inCallMessages, setInCallMessages] = useState([]);

  // Busy Call & Fallback Suggestions State
  const [busyCallData, setBusyCallData] = useState(null);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const partnerSocketIdRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);
  const callSessionIdRef = useRef(null);
  const durationTimerRef = useRef(null);
  const billingTimerRef = useRef(null);
  const callPartnerRef = useRef(null);
  const callTypeRef = useRef('video');

  const incomingIceCandidatesQueueRef = useRef([]);

  const addOrQueueIceCandidate = async (candidate) => {
    if (!candidate) return;
    if (!peerConnectionRef.current || !peerConnectionRef.current.remoteDescription) {
      incomingIceCandidatesQueueRef.current.push(candidate);
      return;
    }
    try {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.warn('Add ice candidate error:', e);
    }
  };

  const flushIncomingIceCandidates = async () => {
    if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription && incomingIceCandidatesQueueRef.current.length > 0) {
      const candidates = [...incomingIceCandidatesQueueRef.current];
      incomingIceCandidatesQueueRef.current = [];
      for (const cand of candidates) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {
          console.warn('Flush incoming candidate error:', e);
        }
      }
    }
  };

  const flushPendingIceCandidates = (targetSocketId) => {
    if (targetSocketId && socket && pendingIceCandidatesRef.current.length > 0) {
      pendingIceCandidatesRef.current.forEach(candidate => {
        socket.emit('webrtc_ice_candidate', {
          targetSocketId,
          candidate
        });
      });
      pendingIceCandidatesRef.current = [];
    }
  };

  useEffect(() => {
    callPartnerRef.current = callPartner;
  }, [callPartner]);

  useEffect(() => {
    callTypeRef.current = callType;
  }, [callType]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Reactively attach streams to video elements whenever state changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isInCall]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isInCall]);

  useEffect(() => {
    if (!socket) return;

    socket.on('call_accepted', async (data) => {
      partnerSocketIdRef.current = data.receiverSocketId;
      flushPendingIceCandidates(data.receiverSocketId);
      if (peerConnectionRef.current && data.answer) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          await flushIncomingIceCandidates();
        } catch (e) {
          console.warn('Set remote desc error:', e);
        }
      }
    });

    socket.on('webrtc_offer', async (data) => {
      partnerSocketIdRef.current = data.fromSocketId;
      flushPendingIceCandidates(data.fromSocketId);
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
          await flushIncomingIceCandidates();
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          socket.emit('webrtc_answer', {
            targetSocketId: data.fromSocketId,
            answer
          });
        } catch (e) {
          console.warn('Handle webrtc_offer error:', e);
        }
      }
    });

    socket.on('webrtc_answer', async (data) => {
      partnerSocketIdRef.current = data.fromSocketId;
      flushPendingIceCandidates(data.fromSocketId);
      if (peerConnectionRef.current && data.answer) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          await flushIncomingIceCandidates();
        } catch (e) {
          console.warn('Handle webrtc_answer error:', e);
        }
      }
    });

    socket.on('webrtc_ice_candidate', async (data) => {
      if (data.candidate) {
        await addOrQueueIceCandidate(data.candidate);
      }
    });

    socket.on('ice_candidate', async (data) => {
      if (data.candidate) {
        await addOrQueueIceCandidate(data.candidate);
      }
    });

    socket.on('call_rejected', (data) => {
      alert(data.reason || 'Cuộc gọi đã bị từ chối.');
      cleanupCall();
    });

    socket.on('call_busy', (data) => {
      cleanupCall();
      setBusyCallData(data);
    });

    socket.on('call_ended', () => {
      cleanupCall();
    });

    socket.on('call_ended_insufficient_coins', (data) => {
      alert(data.message || 'Cuộc gọi kết thúc do hết Xu!');
      cleanupCall();
    });

    socket.on('call_coin_tick', (data) => {
      updateBalance(data.remaining_coins, undefined);
    });

    socket.on('call_diamond_tick', (data) => {
      updateBalance(undefined, data.total_diamonds);
    });

    // Random Match Events
    socket.on('random_queue_waiting', (data) => {
      setQueueMessage(data.message || 'Đang tìm kiếm đối phương...');
    });

    socket.on('random_match_found', async (data) => {
      setIsSearchingQueue(false);
      partnerSocketIdRef.current = data.partnerSocketId;
      callSessionIdRef.current = data.sessionId;
      setCallPartner(data.partner);
      setCallType('video');
      setIsInCall(true);

      const stream = await initializeMedia(true);
      const pc = await createPeerConnection(stream);

      if (data.isInitiator) {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          flushPendingIceCandidates(data.partnerSocketId);
          socket.emit('webrtc_offer', {
            targetSocketId: data.partnerSocketId,
            offer
          });
        } catch (err) {
          console.error('Error creating offer:', err);
        }
      }
    });

    socket.on('random_queue_error', (data) => {
      alert(data.message || 'Lỗi ghép đôi');
      setIsSearchingQueue(false);
    });

    socket.on('partner_skipped', () => {
      cleanupCall();
      alert('Đối phương đã chuyển sang người khác.');
    });

    // In-call live Gift Animation
    socket.on('call_gift_effect', (data) => {
      triggerGiftVisual(data);
    });

    // In-call live Chat
    socket.on('in_call_message', (msg) => {
      setInCallMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('call_accepted');
      socket.off('webrtc_offer');
      socket.off('webrtc_answer');
      socket.off('webrtc_ice_candidate');
      socket.off('ice_candidate');
      socket.off('call_rejected');
      socket.off('call_ended');
      socket.off('call_ended_insufficient_coins');
      socket.off('call_coin_tick');
      socket.off('call_diamond_tick');
      socket.off('random_queue_waiting');
      socket.off('random_match_found');
      socket.off('random_queue_error');
      socket.off('partner_skipped');
      socket.off('call_gift_effect');
      socket.off('in_call_message');
    };
  }, [socket, currentUser]);

  const triggerGiftVisual = (giftData) => {
    if (['full_screen', 'blast', 'fireworks'].includes(giftData.animationType)) {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 }
      });
    }

    const animId = Date.now() + Math.random();
    setGiftAnimations(prev => [...prev, { id: animId, ...giftData }]);

    setTimeout(() => {
      setGiftAnimations(prev => prev.filter(g => g.id !== animId));
    }, 4000);
  };

  const initializeMedia = async (isVideo = true) => {
    try {
      if (localStreamRef.current) {
        setLocalStream(localStreamRef.current);
        return localStreamRef.current;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false,
        audio: true
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.warn('Physical camera/mic not accessible, rendering simulated camera feed with profile image:', err);

      // Create an animated high-res canvas avatar video feed so user's face is 100% visible!
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');

      const avatarImg = new Image();
      avatarImg.crossOrigin = 'anonymous';
      avatarImg.src = currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500';

      let step = 0;
      const renderMock = () => {
        step += 0.05;
        ctx.fillStyle = '#14121f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Avatar with subtle breathing zoom effect
        const zoom = 1 + Math.sin(step) * 0.02;
        const w = 240 * zoom;
        const h = 240 * zoom;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2 - 20;

        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2 - 20, 110, 0, Math.PI * 2);
        ctx.clip();
        try {
          if (avatarImg.complete && avatarImg.naturalWidth > 0) {
            ctx.drawImage(avatarImg, x, y, w, h);
          } else {
            ctx.fillStyle = '#FD297B';
            ctx.fill();
          }
        } catch (e) {
          ctx.fillStyle = '#FD297B';
          ctx.fill();
        }
        ctx.restore();

        // Glowing border
        ctx.strokeStyle = '#FD297B';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2 - 20, 112, 0, Math.PI * 2);
        ctx.stroke();

        // Draw Live Badge
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.roundRect ? ctx.roundRect(canvas.width / 2 - 90, canvas.height - 70, 180, 36, 18) : ctx.fillRect(canvas.width / 2 - 90, canvas.height - 70, 180, 36);
        ctx.fill();

        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(canvas.width / 2 - 60, canvas.height - 52, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(currentUser?.full_name || 'HD Camera Live', canvas.width / 2 - 45, canvas.height - 48);

        requestAnimationFrame(renderMock);
      };

      renderMock();

      const mockStream = canvas.captureStream(30);
      localStreamRef.current = mockStream;
      setLocalStream(mockStream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mockStream;
      }
      return mockStream;
    }
  };

  const createPeerConnection = async (stream) => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    const media = stream || localStreamRef.current;
    if (media) {
      media.getTracks().forEach(track => {
        pc.addTrack(track, media);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        if (partnerSocketIdRef.current && socket) {
          socket.emit('webrtc_ice_candidate', {
            targetSocketId: partnerSocketIdRef.current,
            candidate: event.candidate
          });
          socket.emit('ice_candidate', {
            targetSocketId: partnerSocketIdRef.current,
            candidate: event.candidate
          });
        } else {
          pendingIceCandidatesRef.current.push(event.candidate);
        }
      }
    };

    pc.ontrack = (event) => {
      console.log('🎥 Live Remote Media Stream Received:', event.streams[0]);
      remoteStreamRef.current = event.streams[0];
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play().catch(() => {});
      }
    };

    setCallDuration(0);
    clearInterval(durationTimerRef.current);
    clearInterval(billingTimerRef.current);

    let seconds = 0;
    durationTimerRef.current = setInterval(() => {
      seconds += 1;
      setCallDuration(seconds);

      // Every 60 seconds (1 minute of active call) -> Deduct coin
      if (seconds > 0 && seconds % 60 === 0) {
        const minuteNum = Math.floor(seconds / 60);
        if (callPartnerRef.current) {
          api.deductCallMinute({
            receiver_id: callPartnerRef.current.id,
            call_type: callTypeRef.current || 'video'
          }).then(res => {
            if (res.success) {
              updateBalance(res.remaining_coins, undefined);
              setLatestCoinTick({
                amount: res.rate || 20,
                minute: minuteNum,
                id: Date.now()
              });
              setTimeout(() => setLatestCoinTick(null), 4000);
            }
          }).catch(err => {
            console.warn('Minute billing tick error:', err);
            if (err.message && (err.message.includes('hết Xu') || err.message.includes('không đủ'))) {
              alert('⚠️ Bạn đã hết Xu để duy trì cuộc gọi! Cuộc gọi kết thúc.');
              endCurrentCall();
            }
          });
        }
      }
    }, 1000);

    return pc;
  };

  const startDirectCall = async (partner, type = 'video') => {
    if (!currentUser || !partner) return;
    if ((currentUser.coins || 0) < 20) {
      alert('Bạn cần tối thiểu 20 Xu để thực hiện cuộc gọi. Vui lòng nạp thêm Xu!');
      return;
    }

    let targetPartner = partner;
    if (typeof partner === 'number' || typeof partner === 'string' || !partner.full_name) {
      try {
        const pId = typeof partner === 'object' ? partner.id : Number(partner);
        const res = await api.getUserDetails(pId);
        if (res.success && res.user) {
          targetPartner = res.user;
        }
      } catch (e) {
        console.warn('Could not fetch user details:', e);
      }
    }

    // Check if partner is BUSY in another call
    if (targetPartner.is_in_call) {
      const res = await api.getBusySuggestions(targetPartner.id).catch(() => ({}));
      setBusyCallData({
        message: `${targetPartner.full_name} hiện đang bận cuộc gọi với người khác!`,
        busyUser: { id: targetPartner.id, full_name: targetPartner.full_name, avatar: targetPartner.avatar },
        suggestions: res.suggestions || []
      });
      return;
    }

    // Check if partner is OFFLINE
    if (!targetPartner.is_online) {
      const res = await api.getBusySuggestions(targetPartner.id).catch(() => ({}));
      setBusyCallData({
        message: `${targetPartner.full_name} hiện đang ngoại tuyến!`,
        busyUser: { id: targetPartner.id, full_name: targetPartner.full_name, avatar: targetPartner.avatar },
        suggestions: res.suggestions || []
      });
      return;
    }

    setCallPartner(targetPartner);
    setCallType(type);
    setIsInCall(true);
    setInCallMessages([]);

    const stream = await initializeMedia(type === 'video');
    const pc = await createPeerConnection(stream);

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (socket) {
        socket.emit('call_user', {
          receiverId: targetPartner.id,
          callType: type,
          offer
        });
      }
    } catch (err) {
      console.error('Start call error:', err);
      cleanupCall();
    }
  };

  const answerIncomingCall = async (callData) => {
    if (!socket) return;
    setCallPartner(callData.caller);
    setCallType(callData.callType || 'video');
    partnerSocketIdRef.current = callData.callerSocketId;
    setIsInCall(true);
    setInCallMessages([]);

    const stream = await initializeMedia(callData.callType !== 'voice');
    const pc = await createPeerConnection(stream);

    try {
      if (callData.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
        await flushIncomingIceCandidates();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        flushPendingIceCandidates(callData.callerSocketId);

        socket.emit('answer_call', {
          callerSocketId: callData.callerSocketId,
          answer
        });
      }
    } catch (err) {
      console.error('Answer call error:', err);
      cleanupCall();
    }
  };

  const startRandomMatchQueue = (genderFilter = 'all', regionFilter = 'all') => {
    if (!socket || !currentUser) return;
    if ((currentUser.coins || 0) < 20) {
      alert('Bạn cần tối thiểu 20 Xu để tham gia ghép đôi video ngẫu nhiên!');
      return;
    }
    setIsSearchingQueue(true);
    setQueueMessage('Đang kết nối hệ thống radar tìm kiếm...');
    socket.emit('join_random_queue', { genderFilter, regionFilter });
  };

  const leaveRandomMatchQueue = () => {
    if (socket) socket.emit('leave_random_queue');
    setIsSearchingQueue(false);
    setQueueMessage('');
  };

  const skipRandomPartner = () => {
    if (socket && partnerSocketIdRef.current) {
      socket.emit('skip_random_partner', {
        partnerSocketId: partnerSocketIdRef.current,
        sessionId: callSessionIdRef.current
      });
    }
    cleanupCall();
    startRandomMatchQueue();
  };

  const endCurrentCall = () => {
    if (socket && partnerSocketIdRef.current) {
      socket.emit('end_call', {
        targetSocketId: partnerSocketIdRef.current,
        sessionId: callSessionIdRef.current
      });
    }
    cleanupCall();
  };

  const cleanupCall = () => {
    clearInterval(durationTimerRef.current);
    clearInterval(billingTimerRef.current);
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    partnerSocketIdRef.current = null;
    callSessionIdRef.current = null;
    setIsInCall(false);
    setCallPartner(null);
    setCallDuration(0);
    setLatestCoinTick(null);
    setInCallMessages([]);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoDisabled(!isVideoDisabled);
    }
  };

  const toggleBeautyFilter = () => {
    setBeautyFilter(!beautyFilter);
  };

  const sendCallGift = async (gift) => {
    if (!currentUser || !callPartner) return;
    if ((currentUser.coins || 0) < gift.coin_price) {
      alert('Số dư Xu không đủ để tặng quà này!');
      return;
    }

    try {
      const res = await api.sendGift(callPartner.id, gift.id);
      if (res.success) {
        updateBalance(res.remainingCoins, undefined);
        triggerGiftVisual({
          gift,
          senderName: currentUser.full_name || 'Bạn',
          animationType: gift.animation_type || 'floating'
        });

        if (socket && partnerSocketIdRef.current) {
          socket.emit('call_gift', {
            targetSocketId: partnerSocketIdRef.current,
            gift,
            senderName: currentUser.full_name || 'Bạn'
          });
        }
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi tặng quà');
    }
  };

  const sendInCallMessage = (text) => {
    if (!text.trim()) return;
    const msgObj = {
      id: Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.full_name || 'Bạn',
      content: text.trim()
    };
    setInCallMessages(prev => [...prev, msgObj]);

    if (socket && partnerSocketIdRef.current) {
      socket.emit('in_call_message', {
        targetSocketId: partnerSocketIdRef.current,
        message: msgObj
      });
    }
  };

  return (
    <WebRTCContext.Provider value={{
      isInCall,
      callPartner,
      callType,
      callDuration,
      isMuted,
      isVideoDisabled,
      beautyFilter,
      localStream,
      remoteStream,
      isSearchingQueue,
      queueMessage,
      giftAnimations,
      inCallMessages,
      latestCoinTick,
      localVideoRef,
      remoteVideoRef,
      startDirectCall,
      answerIncomingCall,
      endCurrentCall,
      startRandomMatchQueue,
      leaveRandomMatchQueue,
      skipRandomPartner,
      toggleMute,
      toggleVideo,
      toggleBeautyFilter,
      sendCallGift,
      sendInCallMessage,
      busyCallData,
      setBusyCallData
    }}>
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => useContext(WebRTCContext);
