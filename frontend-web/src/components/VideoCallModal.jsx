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
  Radio
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
  const [isAudioMutedByPolicy, setIsAudioMutedByPolicy] = useState(false);
  const [isRemoteVideoActive, setIsRemoteVideoActive] = useState(false);

  const chatEndRef = useRef(null);

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
    setIsAudioMutedByPolicy(false);
    setIsRemoteVideoActive(false);
  }, [isInCall, callPartner?.id]);

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
            setIsAudioMutedByPolicy(false);
            setIsRemoteVideoActive(true);
          })
          .catch((err) => {
            console.warn('Autoplay unmuted blocked, falling back to muted autoplay:', err);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.muted = true;
              remoteVideoRef.current.play().then(() => {
                setIsAudioMutedByPolicy(true);
                setIsRemoteVideoActive(true);
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

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0c15] backdrop-blur-2xl animate-fade-in overflow-hidden select-none"
    >
      {/* Ambient Blurred Background for Desktop */}
      <div 
        className="absolute inset-0 filter blur-3xl scale-125 opacity-20 pointer-events-none hidden md:block bg-cover bg-center"
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

      {/* Floating Header Bar (Duration, Coins, Report) */}
      <div className="absolute top-0 inset-x-0 z-40 p-4 sm:p-5 flex items-center justify-between pointer-events-auto max-w-6xl mx-auto">
        
        {/* Partner Info (Visible on mobile header) */}
        <div className="flex md:hidden items-center gap-2.5">
          <img
            src={partnerAvatar}
            alt={callPartner.full_name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500 shadow-xl"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-sm text-white drop-shadow-md truncate max-w-[130px]">
                {callPartner.full_name}
              </h4>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500 text-white shadow">
                {callPartner.age || 22}
              </span>
            </div>
            <p className="text-[10px] text-gray-300 font-medium drop-shadow flex items-center gap-1">
              <span>{callPartner.city || 'Việt Nam'}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">9:16 HD Live</span>
            </p>
          </div>
        </div>

        {/* Desktop Brand Tag */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/70 border border-white/15 backdrop-blur-md shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs font-black text-white tracking-wider uppercase">Cuộc Gọi Video 1v1 Song Song</span>
        </div>

        {/* Duration Timer & Coin meter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 border border-white/15 backdrop-blur-md shadow-lg">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="font-mono font-bold text-xs text-white">
              {formatDuration(callDuration)}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold backdrop-blur-md shadow">
            <Coins className="w-3.5 h-3.5" />
            <span>{currentUser?.coins || 0} Xu</span>
          </div>

          <button
            onClick={() => onOpenReport(callPartner)}
            className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-gray-300 hover:text-rose-400 border border-white/10 backdrop-blur-md transition-all shadow"
            title="Báo cáo người dùng"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Main Video Viewport: 
          - Mobile: 1 Main Fullscreen Frame with PIP on bottom right
          - Desktop: 2 Side-by-Side 9:16 Frames (Left: Đối phương, Right: Bạn)
      */}
      <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-center md:gap-6 p-0 md:p-6 overflow-hidden">
        
        {/* FRAME 1: ĐỐI PHƯƠNG (Partner HD Portrait Presentation + WebRTC Live Camera) */}
        <div className="relative w-full h-full md:w-[420px] lg:w-[460px] md:h-[82vh] md:max-h-[800px] md:aspect-[9/16] md:rounded-[36px] md:border-2 md:border-white/20 md:shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden bg-black flex items-center justify-center">
          
          {/* A. Fullscreen High-Resolution Portrait Visual of Partner (Never Black!) */}
          <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
            <img
              src={partnerAvatar}
              alt={callPartner.full_name}
              className={`w-full h-full object-cover filter brightness-95 transform scale-105 transition-transform duration-1000 ${
                beautyFilter ? 'saturate-110 contrast-105' : ''
              }`}
            />
            {/* Ambient Lighting Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 pointer-events-none" />
          </div>

          {/* B. Real WebRTC Remote Video Track (Fades in immediately when peer camera streams) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            onPlaying={() => setIsRemoteVideoActive(true)}
            onCanPlay={() => setIsRemoteVideoActive(true)}
            className={`absolute inset-0 w-full h-full object-cover z-20 transition-opacity duration-300 ${
              isRemoteVideoActive && remoteStream ? 'opacity-100' : 'opacity-0 pointer-events-none'
            } ${beautyFilter ? 'brightness-105 contrast-105 saturate-110' : ''}`}
          />

          {/* Desktop Partner Info Badge (Top Left of Frame 1) */}
          <div className="hidden md:flex absolute top-4 left-4 z-30 items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 shadow-lg">
            <img src={partnerAvatar} alt={callPartner.full_name} className="w-7 h-7 rounded-full object-cover ring-1 ring-rose-500" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white truncate max-w-[120px]">{callPartner.full_name}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500 text-white">{callPartner.age || 22}</span>
              </div>
              <span className="text-[9px] text-gray-300 font-semibold block">{callPartner.city || 'Việt Nam'} • Đối Phương</span>
            </div>
          </div>

          {/* Live Status Badge in Center Bottom of Frame 1 */}
          <div className="absolute bottom-24 md:bottom-6 inset-x-0 z-30 flex flex-col items-center justify-center pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{isRemoteVideoActive && remoteStream ? 'CAMERA ĐANG TRUYỀN HD' : '9:16 HD LIVE CONNECTED'}</span>
            </div>
          </div>

          {/* Soundwave Visualizer on Bottom Left */}
          <div className="absolute bottom-24 md:bottom-5 left-4 z-30 flex items-end gap-1 pointer-events-none">
            <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1 h-5 bg-pink-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1 h-3.5 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
            <span className="w-1 h-6 bg-rose-400 rounded-full animate-bounce [animation-delay:75ms]" />
            <span className="w-1 h-4 bg-pink-500 rounded-full animate-bounce [animation-delay:200ms]" />
          </div>

        </div>

        {/* FRAME 2: BẠN / TÔI (Local Camera Preview)
            - On Mobile: Floating PIP Thumbnail on Bottom Right
            - On Desktop: Full 9:16 Frame on the Right Side
        */}
        <div 
          className={`z-30 overflow-hidden border-2 shadow-2xl bg-zinc-900 transition-all duration-300 aspect-[9/16] 
            /* Mobile Style: Floating PIP */
            absolute bottom-24 right-3 ${isPipSmall ? 'w-20' : 'w-28 sm:w-32'} rounded-2xl border-rose-500/70
            /* Desktop Style: Equal Side-by-Side 9:16 Column */
            md:relative md:bottom-auto md:right-auto md:w-[420px] lg:w-[460px] md:h-[82vh] md:max-h-[800px] md:rounded-[36px] md:border-2 md:border-white/20 md:shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex items-center justify-center
          `}
        >
          {/* Local User Camera Video */}
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${
              beautyFilter ? 'brightness-105 contrast-105 saturate-110' : ''
            }`}
          />

          {/* Fallback Local Camera Avatar */}
          {(!localStream || isVideoDisabled) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#151420] p-3 text-center">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}
                alt="My Avatar"
                className="w-12 h-12 md:w-24 md:h-24 rounded-full object-cover ring-2 ring-rose-500 mb-2 shadow-lg"
              />
              <span className="text-xs md:text-sm font-bold text-white leading-tight">{currentUser?.full_name || 'Bạn'}</span>
              <span className="text-[9px] md:text-xs text-gray-400 mt-0.5">{isVideoDisabled ? 'Đã tắt camera' : 'HD Camera Live'}</span>
            </div>
          )}

          {/* Desktop User Info Badge (Top Left of Frame 2) */}
          <div className="hidden md:flex absolute top-4 left-4 z-30 items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 shadow-lg">
            <img src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'} alt="Me" className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white truncate max-w-[120px]">{currentUser?.full_name || 'Bạn'} (Tôi)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <span className="text-[9px] text-emerald-300 font-semibold block">Camera Của Bạn • HD Live</span>
            </div>
          </div>

          {/* Mobile Minimizer Toggle */}
          <button
            onClick={() => setIsPipSmall(!isPipSmall)}
            className="md:hidden absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
          >
            {isPipSmall ? <Maximize2 className="w-2.5 h-2.5" /> : <Minimize2 className="w-2.5 h-2.5" />}
          </button>

          {/* Mobile Label Tag */}
          <div className="md:hidden absolute bottom-1.5 left-1.5 px-1.5 py-0.2 rounded bg-black/70 backdrop-blur-sm text-[9px] font-black text-white flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Bạn</span>
          </div>

          {/* Live Gradient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none z-25" />

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

        {/* Floating Minute Coin Deduction Toast */}
        {latestCoinTick && (
          <div className="absolute top-16 right-4 z-40 animate-bounce pointer-events-none">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/90 text-black font-black text-[11px] shadow-2xl backdrop-blur-md border border-amber-300">
              <Coins className="w-3.5 h-3.5" />
              <span>-{latestCoinTick.amount} Xu (Phút {latestCoinTick.minute})</span>
            </div>
          </div>
        )}

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
        <div className="absolute bottom-24 left-4 md:left-8 right-28 md:right-auto md:max-w-sm z-30 space-y-1.5 pointer-events-none">
          {inCallMessages.slice(-3).map((msg) => (
            <div
              key={msg.id}
              className="bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/15 text-[11px] text-white shadow-lg animate-fade-in flex items-center gap-1.5 w-max max-w-full"
            >
              <span className="font-bold text-rose-400">{msg.senderName}:</span>
              <span className="text-gray-100 truncate">{msg.content}</span>
            </div>
          ))}
        </div>

        {/* In-Call Live Chat Drawer Overlay */}
        {isChatOpen && (
          <div className="absolute bottom-24 inset-x-3 md:inset-x-auto md:left-8 md:w-96 z-40 bg-[#161424]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-3.5 shadow-2xl animate-fade-in flex flex-col h-72">
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

        {/* In-Call Bottom Controls Bar (Ergonomic Mobile & Desktop Layout) */}
        <div className="absolute bottom-4 inset-x-0 z-40 px-3 flex items-center justify-center gap-3 sm:gap-4 pointer-events-auto">
          
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-3 sm:p-3.5 rounded-full backdrop-blur-xl border transition-all ${
              isMuted 
                ? 'bg-rose-500/30 border-rose-500 text-rose-300' 
                : 'bg-black/70 border-white/20 text-white hover:bg-white/10'
            }`}
            title={isMuted ? 'Bật Mic' : 'Tắt Mic'}
          >
            {isMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {/* Toggle Video */}
          <button
            onClick={toggleVideo}
            className={`p-3 sm:p-3.5 rounded-full backdrop-blur-xl border transition-all ${
              isVideoDisabled 
                ? 'bg-rose-500/30 border-rose-500 text-rose-300' 
                : 'bg-black/70 border-white/20 text-white hover:bg-white/10'
            }`}
            title={isVideoDisabled ? 'Bật Camera' : 'Tắt Camera'}
          >
            {isVideoDisabled ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <VideoIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {/* Beauty Filter Toggle */}
          <button
            onClick={toggleBeautyFilter}
            className={`p-3 sm:p-3.5 rounded-full backdrop-blur-xl border transition-all ${
              beautyFilter 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-pink-400 text-white shadow-lg shadow-pink-500/40 animate-pulse' 
                : 'bg-black/70 border-white/20 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            title="Bộ lọc làm đẹp da HD"
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
          </button>

          {/* In-Call Live Chat Toggle */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-3 sm:p-3.5 rounded-full backdrop-blur-xl border transition-all ${
              isChatOpen
                ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/30' 
                : 'bg-black/70 border-white/20 text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            title="Nhắn tin trong cuộc gọi"
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Send Gift Drawer Trigger */}
          <button
            onClick={() => setIsGiftDrawerOpen(true)}
            className="p-3 sm:p-3.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 border border-yellow-300 text-black shadow-xl shadow-amber-500/30 hover:scale-110 active:scale-95 transition-all"
            title="Tặng quà hiệu ứng động"
          >
            <Gift className="w-5 h-5 sm:w-6 sm:h-6 font-bold" />
          </button>

          {/* Skip Next Partner (If Random Mode) */}
          <button
            onClick={skipRandomPartner}
            className="p-3 sm:p-3.5 rounded-full bg-blue-600/80 hover:bg-blue-600 border border-blue-400/50 text-white shadow-xl shadow-blue-600/30 hover:scale-110 active:scale-95 transition-all flex items-center gap-1.5"
            title="Đổi sang người khác (Next)"
          >
            <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Hang Up End Call */}
          <button
            onClick={endCurrentCall}
            className="p-3 sm:p-3.5 rounded-full bg-red-600 hover:bg-red-700 border border-red-400 text-white shadow-2xl shadow-red-600/40 hover:scale-110 active:scale-95 transition-all"
            title="Kết thúc cuộc gọi"
          >
            <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
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
