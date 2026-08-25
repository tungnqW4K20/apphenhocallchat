import React, { useState } from 'react';
import { 
  Heart, 
  X, 
  Star, 
  RotateCcw, 
  Video, 
  MessageCircle, 
  CheckCircle2, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  Gift,
  ShieldCheck
} from 'lucide-react';

export const SwipeCard = ({ 
  user, 
  onSwipe, 
  onOpenProfile, 
  onDirectCall, 
  onDirectChat,
  onOpenGift,
  onRewind,
  canRewind = false 
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [stamp, setStamp] = useState(null); // 'like', 'pass', 'superlike'

  if (!user) return null;

  const photos = user.photos && user.photos.length > 0 ? user.photos : [user.avatar];

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const triggerAction = (action) => {
    setStamp(action);
    setTimeout(() => {
      onSwipe(user.id, action);
      setStamp(null);
      setPhotoIndex(0);
    }, 400);
  };

  return (
    <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-[3/4.2] sm:aspect-[3/4.4] rounded-3xl overflow-hidden shadow-2xl bg-[#16161e] border border-white/10 select-none group">
      
      {/* Photo Background */}
      <img
        src={photos[photoIndex]}
        alt={user.full_name}
        className="w-full h-full object-cover transition-all duration-300 pointer-events-none"
      />

      {/* Top Photo Carousel Progress Bars */}
      {photos.length > 1 && (
        <div className="absolute top-3 inset-x-3 z-20 flex gap-1.5">
          {photos.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                idx === photoIndex ? 'bg-white shadow' : 'bg-white/30 backdrop-blur-sm'
              }`}
            />
          ))}
        </div>
      )}

      {/* Tap Left / Right to navigate photos */}
      <div className="absolute inset-0 z-10 flex">
        <div 
          onClick={handlePrevPhoto} 
          className="w-1/2 h-2/3 cursor-pointer flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity"
        >
          <span className="p-1 rounded-full bg-black/40 text-white backdrop-blur-sm">
            <ChevronLeft className="w-5 h-5" />
          </span>
        </div>
        <div 
          onClick={handleNextPhoto} 
          className="w-1/2 h-2/3 cursor-pointer flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"
        >
          <span className="p-1 rounded-full bg-black/40 text-white backdrop-blur-sm">
            <ChevronRight className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Stamps for Like/Nope/Superlike */}
      {stamp === 'like' && (
        <div className="absolute top-12 left-6 z-30 transform -rotate-12 border-4 border-emerald-400 text-emerald-400 bg-emerald-950/40 backdrop-blur-md font-black text-3xl px-4 py-1.5 rounded-2xl tracking-widest uppercase shadow-2xl animate-fade-in">
          LIKE
        </div>
      )}
      {stamp === 'pass' && (
        <div className="absolute top-12 right-6 z-30 transform rotate-12 border-4 border-rose-500 text-rose-500 bg-rose-950/40 backdrop-blur-md font-black text-3xl px-4 py-1.5 rounded-2xl tracking-widest uppercase shadow-2xl animate-fade-in">
          NOPE
        </div>
      )}
      {stamp === 'superlike' && (
        <div className="absolute top-1/3 inset-x-0 mx-auto w-max z-30 border-4 border-sky-400 text-sky-400 bg-sky-950/50 backdrop-blur-md font-black text-3xl px-6 py-2 rounded-2xl tracking-widest uppercase shadow-2xl animate-bounce-subtle">
          SUPER LIKE 🌟
        </div>
      )}

      {/* Host / Live Status Badge */}
      <div className="absolute top-6 right-4 z-20 flex flex-col items-end gap-1.5 pointer-events-none">
        {user.is_online ? (
          user.is_in_call ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-black shadow-lg backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-black animate-ping" />
              Đang Bận Gọi
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-lg backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              Đang Rảnh (Online)
            </span>
          )
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-800/80 text-gray-300 shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            Ngoại tuyến
          </span>
        )}
        {user.is_host && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg backdrop-blur-md">
            <Video className="w-3 h-3 text-cyan-300" />
            Host Call {user.call_rate_per_min || 20}🪙/p
          </span>
        )}
      </div>

      {/* Dark Vignette Gradient Over Photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

      {/* User Info Bottom Area */}
      <div className="absolute bottom-20 inset-x-0 p-5 z-20 pointer-events-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
              {user.full_name}, <span className="font-semibold text-gray-200">{user.age || 22}</span>
            </h3>
            {user.is_verified && (
              <CheckCircle2 className="w-5 h-5 text-sky-400 fill-sky-400/20 drop-shadow" />
            )}
          </div>
          <button
            onClick={() => onOpenProfile(user)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all hover:scale-110"
            title="Xem toàn bộ hồ sơ"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Location & Distance */}
        <div className="flex items-center gap-3 text-xs text-gray-300 font-medium mt-1">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            {user.city || 'Hà Nội'} • {user.distance_km || 3} km
          </span>
          {user.job && (
            <span className="flex items-center gap-1 truncate max-w-[140px]">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              {user.job}
            </span>
          )}
        </div>

        {/* Short Bio */}
        {user.bio && (
          <p className="text-xs text-gray-200/90 mt-2 line-clamp-2 leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Interest Tags */}
        {user.interests && user.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {user.interests.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 text-white backdrop-blur-md border border-white/10"
              >
                {tag}
              </span>
            ))}
            {user.interests.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-gray-300">
                +{user.interests.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tinder Action Buttons Bar */}
      <div className="absolute bottom-3 inset-x-0 z-30 px-6 flex items-center justify-between">
        
        {/* Rewind Button */}
        <button
          onClick={onRewind}
          disabled={!canRewind}
          className="w-11 h-11 rounded-full bg-[#1e1d2b]/90 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
          title="Quay lại thẻ trước"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Pass / Dislike (NOPE) */}
        <button
          onClick={() => triggerAction('pass')}
          className="w-14 h-14 rounded-full bg-[#1e1d2b]/90 border border-rose-500/50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center shadow-xl shadow-rose-500/20 hover:scale-110 active:scale-95 transition-all"
          title="Bỏ qua (Nope)"
        >
          <X className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Super Like */}
        <button
          onClick={() => triggerAction('superlike')}
          className="w-12 h-12 rounded-full bg-[#1e1d2b]/90 border border-sky-400/50 text-sky-400 hover:bg-sky-400 hover:text-white flex items-center justify-center shadow-lg shadow-sky-400/20 hover:scale-110 active:scale-95 transition-all"
          title="Super Like (Gửi siêu tim)"
        >
          <Star className="w-6 h-6 fill-sky-400 group-hover:fill-white" />
        </button>

        {/* Like (Heart) */}
        <button
          onClick={() => triggerAction('like')}
          className="w-14 h-14 rounded-full bg-[#1e1d2b]/90 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center shadow-xl shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all"
          title="Thích (Like)"
        >
          <Heart className="w-7 h-7 fill-emerald-400 hover:fill-white stroke-[2.5]" />
        </button>

        {/* Instant Video Call / Gift */}
        <button
          onClick={() => onDirectCall(user)}
          className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 hover:scale-110 active:scale-95 transition-all"
          title="Gọi Video Trực Tiếp 1v1"
        >
          <Video className="w-5 h-5 text-cyan-200" />
        </button>
      </div>

    </div>
  );
};
