import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

const WebRTCContext = createContext(null);

// High-speed reliable STUN servers for WebRTC P2P & NAT traversal
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:global.stun.twilio.com:3478' }
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
  const incomingIceCandidatesQueueRef = useRef([]);
  const callSessionIdRef = useRef(null);
  const durationTimerRef = useRef(null);
  const billingTimerRef = useRef(null);
  const callPartnerRef = useRef(null);
  const callTypeRef = useRef('video');
  const simulatedIntervalsRef = useRef([]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    callPartnerRef.current = callPartner;
  }, [callPartner]);

  useEffect(() => {
    callTypeRef.current = callType;
  }, [callType]);

  // Reactively attach local stream to video ref
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, isInCall]);

  // Reactively attach remote stream to video ref
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream, isInCall]);

  // ICE Candidate Queuing & Flushing
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

  // Helper: Create a high-quality simulated stream with BOTH Video and Web Audio tracks (Mobile 9:16 or Desktop 16:9)
  const createSimulatedMediaStream = (user, label = 'HD Camera Live') => {
    const isMobileOrPortrait = typeof window !== 'undefined' && (
      window.innerHeight > window.innerWidth || 
      window.innerWidth <= 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );

    const canvas = document.createElement('canvas');
    canvas.width = isMobileOrPortrait ? 720 : 1280;
    canvas.height = isMobileOrPortrait ? 1280 : 720;
    const ctx = canvas.getContext('2d');

    const avatarImg = new Image();
    avatarImg.src = user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500';

    let step = 0;
    const render = () => {
      step += 0.04;
      
      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#100e1d');
      grad.addColorStop(0.5, '#19152b');
      grad.addColorStop(1, '#0c0a17');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = isMobileOrPortrait ? canvas.height / 2 - 60 : canvas.height / 2 - 30;
      const baseRadius = isMobileOrPortrait ? 160 : 130;

      // Dynamic glow ring
      const glowGrad = ctx.createRadialGradient(
        centerX, centerY, 80,
        centerX, centerY, baseRadius * 1.8
      );
      glowGrad.addColorStop(0, 'rgba(244, 63, 94, 0.25)');
      glowGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.1)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Avatar with smooth breathing zoom
      const zoom = 1 + Math.sin(step) * 0.025;
      const radius = baseRadius * zoom;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();
      try {
        if (avatarImg.complete && avatarImg.naturalWidth > 0) {
          ctx.drawImage(
            avatarImg,
            centerX - radius,
            centerY - radius,
            radius * 2,
            radius * 2
          );
        } else {
          ctx.fillStyle = '#FD297B';
          ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
        }
      } catch (e) {
        ctx.fillStyle = '#FD297B';
        ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
      }
      ctx.restore();

      // Glowing border around avatar
      ctx.strokeStyle = '#FD297B';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
      ctx.stroke();

      // Soundwave bars below avatar
      const waveY = centerY + radius + (isMobileOrPortrait ? 50 : 35);
      for (let i = -6; i <= 6; i++) {
        const barHeight = Math.abs(Math.sin(step * 2 + i * 0.5)) * 32 + 8;
        ctx.fillStyle = i % 2 === 0 ? '#FD297B' : '#A855F7';
        ctx.fillRect(centerX + i * 16 - 3, waveY - barHeight / 2, 7, barHeight);
      }

      // Name & Status Badge
      const badgeW = isMobileOrPortrait ? 320 : 280;
      const badgeH = isMobileOrPortrait ? 50 : 44;
      const badgeX = centerX - badgeW / 2;
      const badgeY = canvas.height - (isMobileOrPortrait ? 180 : 90);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeH / 2);
        ctx.fill();
      } else {
        ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
      }

      // Live green dot
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(badgeX + 26, badgeY + badgeH / 2, 6, 0, Math.PI * 2);
      ctx.fill();

      // Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = isMobileOrPortrait ? 'bold 18px sans-serif' : 'bold 16px sans-serif';
      const nameText = user?.full_name || label;
      ctx.fillText(nameText, badgeX + 44, badgeY + badgeH / 2 + 6);
    };

    render();
    const intervalId = setInterval(render, 1000 / 30);
    simulatedIntervalsRef.current.push(intervalId);

    const stream = canvas.captureStream(30);

    // Add silent Web Audio track so SDP has both audio & video
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const actx = new AudioCtx();
        const dest = actx.createMediaStreamDestination();
        const gain = actx.createGain();
        gain.gain.value = 0;
        const osc = actx.createOscillator();
        osc.connect(gain);
        gain.connect(dest);
        osc.start();
        const track = dest.stream.getAudioTracks()[0];
        if (track) stream.addTrack(track);
      }
    } catch (e) {
      console.warn('AudioContext destination warning:', e);
    }

    return stream;
  };

  // Helper: Create animated Live HD Stream for AI Idol Host
  const createHostLiveStream = (hostUser) => {
    const stream = createSimulatedMediaStream(hostUser, 'IDOL LIVE 1080P HD');
    remoteStreamRef.current = stream;
    setRemoteStream(stream);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
      remoteVideoRef.current.play().catch(() => {});
    }
    return stream;
  };

  const initializeMedia = async (isVideo = true) => {
    try {
      if (localStreamRef.current && localStreamRef.current.active && localStreamRef.current.getTracks().length > 0) {
        setLocalStream(localStreamRef.current);
        return localStreamRef.current;
      }

      const isMobileOrPortrait = typeof window !== 'undefined' && (
        window.innerHeight > window.innerWidth || 
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      );

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Adjust camera constraints dynamically: 9:16 for Mobile/Portrait or 16:9 for Desktop
        const videoConstraints = isVideo ? {
          width: isMobileOrPortrait ? { ideal: 720, min: 480 } : { ideal: 1280, min: 640 },
          height: isMobileOrPortrait ? { ideal: 1280, min: 640 } : { ideal: 720, min: 480 },
          aspectRatio: isMobileOrPortrait ? { ideal: 0.5625 } : { ideal: 1.7777 },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 60 }
        } : false;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        localStreamRef.current = stream;
        setLocalStream(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }
        return stream;
      } else {
        throw new Error('navigator.mediaDevices.getUserMedia is not supported on this origin');
      }
    } catch (err) {
      console.warn('Physical camera/mic not accessible or blocked, generating high-res simulated feed:', err);

      // Attempt to acquire audio only if video failed due to device busy
      let audioStream = null;
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      } catch (e) {
        // audio also busy or denied
      }

      const mockStream = createSimulatedMediaStream(currentUser, 'HD Camera Live');
      if (audioStream && audioStream.getAudioTracks().length > 0) {
        // Replace synthetic audio with real mic
        const realAudioTrack = audioStream.getAudioTracks()[0];
        mockStream.getAudioTracks().forEach(t => mockStream.removeTrack(t));
        mockStream.addTrack(realAudioTrack);
      }

      localStreamRef.current = mockStream;
      setLocalStream(mockStream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mockStream;
        localVideoRef.current.play().catch(() => {});
      }
      return mockStream;
    }
  };

  const createPeerConnection = async (stream) => {
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {}
      peerConnectionRef.current = null;
    }

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
        } else {
          pendingIceCandidatesRef.current.push(event.candidate);
        }
      }
    };

    pc.ontrack = (event) => {
      console.log('🎥 Live Remote Media Track Received:', event.track.kind, event);
      let stream = (event.streams && event.streams[0]) ? event.streams[0] : null;
      if (!stream) {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
        }
        remoteStreamRef.current.addTrack(event.track);
        stream = remoteStreamRef.current;
      } else {
        remoteStreamRef.current = stream;
      }
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch((err) => {
          console.warn('Auto play remote video error:', err);
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('⚡ ICE Connection State:', pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
      console.log('⚡ Peer Connection State:', pc.connectionState);
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
        const activePartner = callPartnerRef.current;
        if (activePartner) {
          api.deductCallMinute({
            receiver_id: activePartner.id,
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

  useEffect(() => {
    if (!socket) return;

    socket.on('call_accepted', async (data) => {
      partnerSocketIdRef.current = data.receiverSocketId;
      flushPendingIceCandidates(data.receiverSocketId);

      if (data.answer && peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          await flushIncomingIceCandidates();
        } catch (e) {
          console.warn('Set remote desc error:', e);
        }
      } else if (!data.answer) {
        // AI Idol Host mode (seed accounts) -> generate high-res live broadcast stream
        const partnerToUse = callPartnerRef.current || callPartner;
        if (partnerToUse) {
          createHostLiveStream(partnerToUse);
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

    socket.on('call_failed', (data) => {
      alert(data.message || 'Không thể thực hiện cuộc gọi.');
      cleanupCall();
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
      callPartnerRef.current = data.partner;
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

    // Check if partner is OFFLINE (if not a host)
    if (!targetPartner.is_online && !targetPartner.is_host) {
      const res = await api.getBusySuggestions(targetPartner.id).catch(() => ({}));
      setBusyCallData({
        message: `${targetPartner.full_name} hiện đang ngoại tuyến!`,
        busyUser: { id: targetPartner.id, full_name: targetPartner.full_name, avatar: targetPartner.avatar },
        suggestions: res.suggestions || []
      });
      return;
    }

    callPartnerRef.current = targetPartner;
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
    callPartnerRef.current = callData.caller;
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
    if (currentUser.gender !== 'female' && (currentUser.coins || 0) < 20) {
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

    // Clear all simulated intervals
    if (simulatedIntervalsRef.current.length > 0) {
      simulatedIntervalsRef.current.forEach(id => clearInterval(id));
      simulatedIntervalsRef.current = [];
    }

    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.ontrack = null;
        peerConnectionRef.current.onicecandidate = null;
        peerConnectionRef.current.close();
      } catch (e) {
        console.warn('PeerConnection close error:', e);
      }
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) {}
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      try {
        remoteStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) {}
      remoteStreamRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    partnerSocketIdRef.current = null;
    callSessionIdRef.current = null;
    pendingIceCandidatesRef.current = [];
    incomingIceCandidatesQueueRef.current = [];
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
