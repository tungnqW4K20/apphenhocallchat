import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  X, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  CheckCircle2, 
  Video, 
  MessageCircle, 
  Gift, 
  ShieldAlert,
  Heart,
  UserPlus,
  UserCheck
} from 'lucide-react';

export const UserProfileModal = ({ user, onClose, onStartCall, onStartChat, onOpenGift, onOpenReport }) => {
  if (!user) return null;

  const [isFollowing, setIsFollowing] = useState(user.is_following || false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const handleToggleFollow = async () => {
    try {
      setLoadingFollow(true);
      const res = await api.toggleFollow(user.id);
      if (res.success) {
        setIsFollowing(res.isFollowing);
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi theo dõi');
    } finally {
      setLoadingFollow(false);
    }
  };

  const photos = user.photos && user.photos.length > 0 ? user.photos : [user.avatar];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#161522] border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Header Close & Follow */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={handleToggleFollow}
            disabled={loadingFollow}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-all shadow-lg ${
              isFollowing
                ? 'bg-rose-500/80 text-white border border-rose-400'
                : 'bg-black/60 hover:bg-black/80 text-white border border-white/20'
            }`}
          >
            {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
            <span>{isFollowing ? 'Đang Theo Dõi' : 'Theo Dõi'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          
          {/* Main Photo Gallery Slider */}
          <div className="relative aspect-[3/3.5] w-full bg-black">
            <img
              src={photos[0]}
              alt={user.full_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#161522] via-transparent to-transparent" />
            
            <div className="absolute bottom-4 left-5 right-5">
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black text-white">
                  {user.full_name}, <span className="font-semibold text-gray-200">{user.age || 22}</span>
                </h2>
                {user.is_verified && (
                  <CheckCircle2 className="w-6 h-6 text-sky-400 fill-sky-400/20" />
                )}
              </div>
              <p className="text-xs text-gray-300 font-medium flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>{user.city || 'Hà Nội'} • Cách bạn {user.distance_km || 3} km</span>
              </p>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-5 space-y-4">
            
            {/* Bio */}
            {user.bio && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Giới Thiệu Bản Thân</h4>
                <p className="text-sm text-gray-200 leading-relaxed">{user.bio}</p>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {user.job && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-gray-200 font-medium truncate">{user.job}</span>
                </div>
              )}
              {user.company_or_school && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-gray-200 font-medium truncate">{user.company_or_school}</span>
                </div>
              )}
            </div>

            {/* Interests Tags */}
            {user.interests && user.interests.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Sở Thích & Phong Cách</h4>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Album Photos */}
            {photos.length > 1 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Album Ảnh ({photos.length})</h4>
                <div className="grid grid-cols-2 gap-2">
                  {photos.slice(1).map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`${user.full_name} ${idx}`}
                      className="w-full aspect-square object-cover rounded-2xl border border-white/10"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Report user button */}
            <button
              onClick={() => onOpenReport(user)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-rose-400 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Báo Cáo Hoặc Chặn Người Dùng Này</span>
            </button>

          </div>

        </div>

        {/* Action Bottom Bar */}
        <div className="p-4 bg-[#111019] border-t border-white/10 flex items-center gap-2.5">
          <button
            onClick={() => onStartChat(user)}
            className="flex-1 py-3 rounded-2xl font-bold text-xs bg-white/10 hover:bg-white/15 text-white flex items-center justify-center gap-1.5 transition-all"
          >
            <MessageCircle className="w-4 h-4 text-rose-400" />
            <span>Nhắn Tin</span>
          </button>

          <button
            onClick={() => onOpenGift(user)}
            className="p-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all"
            title="Tặng Quà"
          >
            <Gift className="w-5 h-5" />
          </button>

          <button
            onClick={() => onStartCall(user)}
            className="flex-1 py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/25 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Video className="w-4 h-4 text-cyan-200" />
            <span>Gọi Video 1v1</span>
          </button>
        </div>

      </div>
    </div>
  );
};
