import React from 'react';
import { 
  X, 
  PhoneCall, 
  PhoneOff, 
  Video, 
  Flame, 
  MapPin, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const CallBusySuggestionsModal = ({ 
  isOpen, 
  onClose, 
  busyData, 
  onCallUser 
}) => {
  if (!isOpen || !busyData) return null;

  const { message, busyUser, suggestions = [] } = busyData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#161522] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 my-8">
        
        {/* Header with Busy Notice */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={busyUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt=""
                className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/50"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[10px] text-black font-bold">
                ⏳
              </span>
            </div>
            <div>
              <h3 className="text-base font-black text-white">{busyUser?.full_name || 'Đối phương'}</h3>
              <p className="text-xs text-amber-300 font-semibold">{message || 'Hiện đang bận cuộc gọi khác!'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggestions Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              Gợi Ý Các Bạn Đang Online & Rảnh Gần Bạn
            </h4>
          </div>

          {suggestions.length === 0 ? (
            <div className="p-6 bg-white/5 rounded-2xl text-center text-xs text-gray-400">
              Hiện chưa có thêm bạn nữ nào rảnh gần khu vực của bạn. Vui lòng thử lại sau ít phút!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {suggestions.map((u) => (
                <div
                  key={u.id}
                  className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={u.avatar}
                        alt={u.full_name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-rose-500"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#161522]" />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">{u.full_name}</span>
                        {u.is_verified && <CheckCircle2 className="w-3 h-3 text-sky-400" />}
                        {u.vip_level > 0 && <span className="text-[10px]">👑</span>}
                      </div>
                      
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                        <span className="text-pink-300 font-semibold">{u.age} tuổi</span>
                        <span>•</span>
                        <span className="text-gray-300 flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5 text-rose-400" />
                          {u.distance_label || u.city || 'Gần bạn'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Call Button */}
                  <button
                    onClick={() => {
                      onClose();
                      if (onCallUser) onCallUser(u);
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-500/25 flex items-center gap-1.5 group-hover:scale-105 transition-all"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Gọi Ngay</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl font-semibold text-xs transition-all"
          >
            Đóng & Quay Lại Sau
          </button>
        </div>

      </div>
    </div>
  );
};
