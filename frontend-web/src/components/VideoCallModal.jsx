import React, { useState, useEffect, useRef } from 'react';
import { useWebRTC } from '../context/WebRTCContext';
import { useAuth } from '../context/AuthContext';
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  PhoneOff, 
  Sparkles, 
  Gift, 
  SkipForward, 
  Coins, 
  ShieldAlert, 
  Maximize2, 
  Minimize2,
  MessageCircle,
  Send,
  X,
  Volume2,
  VolumeX,
  Smartphone,
  Tv
} from 'lucide-react';
import { GiftDrawer } from './GiftDrawer';

export const VideoCallModal = ({ onOpenReport }) => {
  const { 
    isInCall, 
    callPartner, 
    callType, 
    callDuration, 
    isMuted, 
    isVideoDisabled, 
    beautyFilter,
    giftAnimations,
    inCallMessages,
    latestCoinTick,
    localStream,
    remoteStream,
    localVideoRef, 
    remoteVideoRef, 
    endCurrentCall, 
    skipRandomPartner,
    toggleMute, 
    toggleVideo, 
    toggleBeautyFilter,
    sendCallGift,
    sendInCallMessage
  } = useWebRTC();

  const { currentUser } = useAuth();
  const [isGiftDrawerOpen, setIsGiftDrawerOpen] = useState(false);
  const [isPipSmall, setIsPipSmall] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isBlurredByPrivacy, setIsBlurredByPrivacy] = useState(false);
  const [watermarkPos, setWatermarkPos] = useState({ top: '30%', left: '40%' });
  const [isRemoteVideoPlaying, setIsRemoteVideoPlaying] = useState(false);
  const [isAudioMutedByPolicy, setIsAudioMutedByPolicy] = useState(false);
  const [showConnectingNotice, setShowConnectingNotice] = useState(true);
  
  // Desktop view mode: 'phone' (9:16 Frame) or 'fill' (Expanded)
  const [viewMode, setViewMode] = useState('phone');

  const chatEndRef = useRef(null);

  // Anti-Screen Recording Dynamic Watermark Randomizer
  useEffect(() => {
    const timer = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 60 + 20) + '%';
      const randomLeft = Math.floor(Math.random() * 50 + 10) + '%';
      setWatermarkPos({ top: randomTop, left: randomLeft });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Anti-Screenshot & Screen Capture Protection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === 'PrintScreen' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'S')) ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        alert('🛡️ BẢO MẬT CUỘC GỌI: Nghiêm cấm chụp ảnh / quay màn hình hoặc can thiệp mã nguồn.');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurredByPrivacy(true);
      } else {
        setIsBlurredByPrivacy(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    setShowConnectingNotice(true);
    const timer = setTimeout(() => {
      setShowConnectingNotice(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [isInCall, callPartner]);

  useEffect(() => {
    setIsRemoteVideoPlaying(false);
    setIsAudioMutedByPolicy(false);
  }, [isInCall, callPartner]);

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [inCallMessages, isChatOpen]);

  // Robust Stream Attaching & Autoplay Recovery
  useEffect(() => {
    if (remoteStream && remoteVideoRef?.current) {
      if (remoteVideoRef.current.srcObject !== remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      const playPromise = remoteVideoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsRemoteVideoPlaying(true);
            setIsAudioMutedByPolicy(false);
          })
          .catch((err) => {
            console.warn('Remote video audio unmuted autoplay blocked by browser policy:', err);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.muted = true;
              remoteVideoRef.current.play().then(() => {
                setIsRemoteVideoPlaying(true);
                setIsAudioMutedByPolicy(true);
              }).catch(() => {});
            }
          });
      }
    }
  }, [remoteStream, isInCall]);

  useEffect(() => {
    if (localStream && localVideoRef?.current) {
      if (localVideoRef.current.srcObject !== localStream) {
        localVideoRef.current.srcObject = localStream;
      }
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, isInCall]);

  const handleUnmuteAudio = () => {
    if (remoteVideoRef?.current) {
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.play().then(() => {
        setIsAudioMutedByPolicy(false);
      }).catch(e => console.warn('Unmute error:', e));
    }
  };

  if (!isInCall || !callPartner) return null;

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleSendChat = (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    sendInCallMessage(chatInput);
    setChatInput('');
  };

  const quickReactions = ['❤️', '😍', '🔥', '👏', '💋', '✨', '🌹'];
  const partnerAvatar = callPartner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800';
  const hasActiveRemoteVideo = isRemoteVideoPlaying || !!remoteStream;

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-fade-in overflow-hidden select-none"
    >
      {/* Ambient Blurred Video Background for Desktop */}
      <div 
        className="absolute inset-0 filter blur-3xl scale-125 opacity-30 pointer-events-none hidden md:block bg-cover bg-center"
        style={{ backgroundImage: `url(${partnerAvatar})` }}
      />

      {/* Privacy Protection Screen Blur when window lost focus */}
      {isBlurredByPrivacy && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-6 space-y-3">
          <span className="text-4xl">🛡️</span>
          <h3 className="text-lg font-black text-white">Chế Độ Bảo Mật Quyền Riêng Tư</h3>
          <p className="text-xs text-gray-400">Cuộc gọi đang được làm mờ bảo vệ dữ liệu cá nhân khi bạn chuyển cửa sổ.</p>
        </div>
      )}

      {/* Main Viewport: Fullscreen on Mobile, 9:16 Phone Frame (or Expanded) on Desktop */}
      <div className={`relative w-full h-full md:transition-all md:duration-300 flex items-center justify-center bg-black overflow-hidden shadow-2xl ${
        viewMode === 'phone' 
          ? 'md:max-w-[440px] md:h-[92vh] md:max-h-[860px] md:rounded-[40px] md:border-4 md:border-white/15 md:ring-1 md:ring-white/10' 
          : 'md:max-w-full md:h-full md:rounded-none'
      }`}>
        
        {/* Dynamic Moving Watermark Overlay */}
        <div 
          style={{ top: watermarkPos.top, left: watermarkPos.left }}
          className="absolute z-40 pointer-events-none transition-all duration-1000 select-none opacity-25 hover:opacity-10 text-[10px] font-mono font-black text-white/80 bg-black/40 px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-sm"
        >
          <span>ID:{currentUser?.id} • {currentUser?.full_name?.split(' ')[0]} • AYARFLAME SECURE</span>
        </div>

        {/* WebRTC Video Track (9:16 Vertical Video Stream of Partner) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          onLoadedMetadata={() => setIsRemoteVideoPlaying(true)}
          onCanPlay={() => setIsRemoteVideoPlaying(true)}
          onPlaying={() => setIsRemoteVideoPlaying(true)}
          className={`absolute inset-0 w-full h-full object-cover z-20 transition-opacity duration-500 ${
            hasActiveRemoteVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } ${beautyFilter ? 'brightness-105 contrast-105 saturate-110' : ''}`}
        />

        {/* Fallback Partner Portrait & Blurred Background (Shown before stream loads) */}
        <div className={`absolute inset-0 flex items-center justify-center overflow-hidden z-10 transition-opacity duration-500 ${hasActiveRemoteVideo ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div 
            className="absolute inset-0 scale-125 filter blur-3xl opacity-60 bg-cover bg-center"
            style={{ backgroundImage: `url(${partnerAvatar})` }}
          />

          <img
            src={partnerAvatar}
            alt={callPartner.full_name}
            className="w-full h-full object-cover transition-all duration-500"
          />

          {/* Connecting Camera Notice */}
          {showConnectingNotice && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10 transition-opacity duration-500 animate-fade-in">
              <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
              <p className="text-sm font-bold text-white shadow">Đang đồng bộ luồng Camera 9:16 HD với {callPartner.full_name}...</p>
            </div>
          )}
        </div>

        {/* Browser Audio Policy Unmute Button */}
        {isAudioMutedByPolicy && (
          <button
            onClick={handleUnmuteAudio}
            className="absolute top-20 left-4 right-4 sm:left-auto sm:right-6 z-40 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl animate-bounce flex items-center justify-center gap-2 border border-white/20"
          >
            <VolumeX className="w-4 h-4 text-white" />
            <span>Bấm để bật âm thanh đối phương</span>
          </button>
        )}

        {/* Live Camera Broadcast Vignette & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/70 pointer-events-none z-25" />

        {/* Top Header Bar */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 sm:p-5 flex items-center justify-between">
          
          {/* Partner Info */}
          <div className="flex items-center gap-2.5">
            <img
              src={partnerAvatar}
              alt={callPartner.full_name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-rose-500 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-sm text-white drop-shadow-md truncate max-w-[120px] sm:max-w-[160px]">
                  {callPartner.full_name}
                </h4>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500 text-white shadow">
                  {callPartner.age || 22}
                </span>
              </div>
              <p className="text-[11px] text-gray-300 font-medium drop-shadow flex items-center gap-1">
                <span>{callPartner.city || 'Việt Nam'}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">9:16 HD Live</span>
              </p>
            </div>
          </div>

          {/* Call Timer & Controls */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="font-mono font-bold text-xs text-white">
                {formatDuration(callDuration)}
              </span>
            </div>

            {/* Desktop Frame Mode Switch (9:16 Phone Frame vs Fullscreen) */}
            <button
              onClick={() => setViewMode(viewMode === 'phone' ? 'fill' : 'phone')}
              className="hidden md:flex p-2 rounded-full bg-black/60 hover:bg-black/80 text-gray-300 hover:text-white border border-white/10 backdrop-blur-md transition-all shadow"
              title={viewMode === 'phone' ? 'Chuyển sang Toàn màn hình' : 'Chuyển sang Khung Điện Thoại 9:16'}
            >
              {viewMode === 'phone' ? <Tv className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => onOpenReport(callPartner)}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-gray-300 hover:text-rose-400 border border-white/10 backdrop-blur-md transition-all shadow"
              title="Báo cáo người dùng"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Live Minute Coin Deduction Toast */}
        {latestCoinTick && (
          <div className="absolute top-16 right-4 z-40 animate-bounce pointer-events-none">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/90 text-black font-black text-[11px] shadow-2xl backdrop-blur-md border border-amber-300">
              <Coins className="w-3.5 h-3.5" />
              <span>-{latestCoinTick.amount} Xu (Phút {latestCoinTick.minute})</span>
            </div>
          </div>
        )}

        {/* Soundwave Visualizer on Bottom Left */}
        <div className="absolute bottom-24 left-4 z-30 flex items-end gap-1 pointer-events-none">
          <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1 h-5 bg-pink-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1 h-3.5 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
          <span className="w-1 h-6 bg-rose-400 rounded-full animate-bounce [animation-delay:75ms]" />
          <span className="w-1 h-4 bg-pink-500 rounded-full animate-bounce [animation-delay:200ms]" />
        </div>

        {/* Floating Gift Animations Overlay */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {giftAnimations.map((item) => (
            <div
              key={item.id}
              className="absolute top-1/3 inset-x-0 mx-auto w-max flex flex-col items-center animate-gift-pop"
            >
              <div className="text-6xl sm:text-7xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter">
                {item.gift.icon}
              </div>
              <div className="mt-2 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-pink-500/40 text-center">
                <p className="text-[11px] font-black text-pink-300">
                  {item.senderName} đã tặng {item.gift.name}!
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Floating In-Call Chat Messages (Bottom Left) */}
        <div className="absolute bottom-24 left-16 right-28 z-30 space-y-1.5 pointer-events-none">
          {inCallMessages.slice(-3).map((msg) => (
            <div
              key={msg.id}
              className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 text-[11px] text-white shadow-lg animate-fade-in flex items-center gap-1.5 w-max max-w-full"
            >
              <span className="font-bold text-rose-400">{msg.senderName}:</span>
              <span className="text-gray-100 truncate">{msg.content}</span>
            </div>
          ))}
        </div>

        {/* PIP Local Video (My Camera Feed - 9:16 Portrait Ratio) */}
        <div 
          className={`absolute bottom-24 right-3 z-30 rounded-2xl overflow-hidden border-2 border-rose-500/70 shadow-2xl bg-zinc-900 transition-all duration-300 aspect-[9/16] ${
            isPipSmall ? 'w-20 sm:w-24' : 'w-28 sm:w-32'
          }`}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${
              beautyFilter ? 'brightness-105 contrast-105 saturate-110' : ''
            }`}
          />
          {(!localStream || isVideoDisabled) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#151420] p-1.5 text-center">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}
                alt="My Avatar"
                className="w-10 h-10 rounded-full object-cover ring-1 ring-rose-500 mb-1 shadow"
              />
              <span className="text-[10px] font-bold text-white leading-tight truncate w-full">{currentUser?.full_name?.split(' ')[0] || 'Bạn'}</span>
              <span className="text-[8px] text-gray-400">{isVideoDisabled ? 'Tắt cam' : 'HD Cam'}</span>
            </div>
          )}
          <button
            onClick={() => setIsPipSmall(!isPipSmall)}
            className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
          >
            {isPipSmall ? <Maximize2 className="w-2.5 h-2.5" /> : <Minimize2 className="w-2.5 h-2.5" />}
          </button>
          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.2 rounded bg-black/70 backdrop-blur-sm text-[9px] font-black text-white flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Bạn</span>
          </div>
        </div>

        {/* In-Call Live Chat Drawer Overlay */}
        {isChatOpen && (
          <div className="absolute bottom-24 inset-x-3 z-40 bg-[#161424]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-3.5 shadow-2xl animate-fade-in flex flex-col h-72">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-rose-400" />
                <h5 className="text-xs font-bold text-white">Nhắn Tin Trong Cuộc Gọi</h5>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-full bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Reactions Bar */}
            <div className="flex items-center gap-1 pb-2 overflow-x-auto custom-scrollbar">
              {quickReactions.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => sendInCallMessage(emoji)}
                  className="px-2 py-1 bg-white/5 hover:bg-white/15 rounded-xl text-sm transition-transform active:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Messages Scroll */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 py-1">
              {inCallMessages.length === 0 ? (
                <p className="text-center text-xs text-gray-500 py-6">Chưa có tin nhắn trong cuộc gọi này</p>
              ) : (
                inCallMessages.map((m) => {
                  const isMine = m.senderId === currentUser?.id;
                  return (
                    <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`px-3 py-1.5 rounded-2xl text-xs max-w-[85%] ${
                        isMine ? 'bg-rose-500 text-white rounded-br-none' : 'bg-white/10 text-gray-100 rounded-bl-none'
                      }`}>
                        <span className="font-bold text-[10px] block opacity-80">{m.senderName}</span>
                        <span>{m.content}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* In-Call Input */}
            <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2 border-t border-white/10 mt-1">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="p-2 bg-rose-500 hover:bg-rose-600 rounded-xl text-white shadow"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* In-Call Bottom Controls Bar (Ergonomic Mobile Touch Layout) */}
        <div className="absolute bottom-4 inset-x-0 z-30 px-3 flex items-center justify-center gap-2.5 sm:gap-3">
          
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full backdrop-blur-xl border transition-all ${
              isMuted 
                ? 'bg-rose-500/30 border-rose-500 text-rose-300' 
                : 'bg-black/60 border-white/15 text-white hover:bg-white/10'
            }`}
            title={isMuted ? 'Bật Mic' : 'Tắt Mic'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Video */}
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full backdrop-blur-xl border transition-all ${
              isVideoDisabled 
                ? 'bg-rose-500/30 border-rose-500 text-rose-300' 
                : 'bg-black/60 border-white/15 text-white hover:bg-white/10'
            }`}
            title={isVideoDisabled ? 'Bật Camera' : 'Tắt Camera'}
          >
            {isVideoDisabled ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
          </button>

          {/* Beauty Filter Toggle */}
          <button
            onClick={toggleBeautyFilter}
            className={`p-3 rounded-full backdrop-blur-xl border transition-all ${
              beautyFilter 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-pink-400 text-white shadow-lg shadow-pink-500/40 animate-pulse' 
                : 'bg-black/60 border-white/15 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            title="Bộ lọc làm đẹp da HD"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
          </button>

          {/* In-Call Live Chat Toggle */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-3 rounded-full backdrop-blur-xl border transition-all ${
              isChatOpen
                ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30'
                : 'bg-black/60 border-white/15 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            title="Nhắn tin trong cuộc gọi"
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          {/* Send Gift Drawer Trigger */}
          <button
            onClick={() => setIsGiftDrawerOpen(true)}
            className="p-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 border border-yellow-300 text-black shadow-xl shadow-amber-500/30 hover:scale-110 active:scale-95 transition-all"
            title="Tặng quà hiệu ứng động"
          >
            <Gift className="w-5 h-5 font-bold" />
          </button>

          {/* Skip Next Partner (If Random Mode) */}
          <button
            onClick={skipRandomPartner}
            className="p-3 rounded-full bg-blue-600/80 hover:bg-blue-600 border border-blue-400/50 text-white shadow-xl shadow-blue-600/30 hover:scale-110 active:scale-95 transition-all flex items-center gap-1.5"
            title="Đổi sang người khác (Next)"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Hang Up End Call */}
          <button
            onClick={endCurrentCall}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 border border-red-400 text-white shadow-2xl shadow-red-600/40 hover:scale-110 active:scale-95 transition-all"
            title="Kết thúc cuộc gọi"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* In-call Gift Drawer */}
      <GiftDrawer
        isOpen={isGiftDrawerOpen}
        onClose={() => setIsGiftDrawerOpen(false)}
        receiver={callPartner}
        onSendGift={(giftId) => {
          sendCallGift(giftId);
        }}
      />

    </div>
  );
};
