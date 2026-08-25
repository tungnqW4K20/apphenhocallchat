import React, { useState } from 'react';
import { useWebRTC } from '../../context/WebRTCContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Video, 
  Globe, 
  Sparkles, 
  Coins, 
  Zap, 
  X, 
  ShieldCheck, 
  SlidersHorizontal,
  Flame
} from 'lucide-react';

export const RandomMatchPage = ({ onOpenShop }) => {
  const { currentUser } = useAuth();
  const { isSearchingQueue, queueMessage, startRandomMatchQueue, leaveRandomMatchQueue } = useWebRTC();

  const [genderFilter, setGenderFilter] = useState('all'); // 'all', 'female', 'male'
  const [regionFilter, setRegionFilter] = useState('vietnam');

  const handleStartMatch = () => {
    if (!currentUser) return;
    if (currentUser.gender !== 'female' && (currentUser.coins || 0) < 20) {
      alert('Bạn cần tối thiểu 20 Xu để bắt đầu ghép đôi video ngẫu nhiên. Vui lòng nạp thêm Xu!');
      onOpenShop();
      return;
    }
    startRandomMatchQueue(genderFilter, regionFilter);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-140px)]">
      
      {/* Container Box */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#181628] to-[#0d0c15] border border-purple-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-purple-600/20 via-pink-600/10 to-transparent blur-2xl pointer-events-none" />

        {/* Title */}
        <div className="relative z-10 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2 shadow">
            <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
            <span>Ayar Video Radar Live 1v1</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ghép Đôi Video Ngẫu Nhiên
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Trò chuyện trực tiếp 1-on-1 với người lạ trên khắp cả nước bằng công nghệ WebRTC HD sắc nét
          </p>
        </div>

        {/* Radar Animated Area */}
        <div className="relative my-10 flex items-center justify-center">
          
          {/* Radar Circles */}
          <div className={`absolute w-64 h-64 rounded-full border border-purple-500/20 ${isSearchingQueue ? 'animate-radar' : ''}`} />
          <div className={`absolute w-48 h-48 rounded-full border border-pink-500/30 ${isSearchingQueue ? 'animate-radar delay-300' : ''}`} />
          <div className={`absolute w-36 h-36 rounded-full border border-cyan-500/40 ${isSearchingQueue ? 'animate-radar delay-700' : ''}`} />

          {/* Central Pulsing Avatar */}
          <div className="relative z-20 w-24 h-24 rounded-full ring-4 ring-purple-500 shadow-2xl overflow-hidden bg-black p-1">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}
              alt={currentUser?.full_name}
              className="w-full h-full object-cover rounded-full"
            />
            {isSearchingQueue && (
              <div className="absolute inset-0 bg-purple-600/30 backdrop-blur-[2px] flex items-center justify-center rounded-full">
                <Video className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>

        </div>

        {/* Queue Status Message */}
        {isSearchingQueue ? (
          <div className="space-y-4 relative z-10 animate-fade-in">
            <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30">
              <p className="text-sm font-bold text-purple-300 flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                {queueMessage || 'Đang quét sóng radar tìm bạn nói chuyện...'}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Sẽ tự động kết nối máy ảnh và micro khi tìm thấy đối phương</p>
            </div>

            <button
              onClick={leaveRandomMatchQueue}
              className="px-6 py-2.5 rounded-full font-bold text-xs bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white transition-all flex items-center justify-center gap-1.5 mx-auto"
            >
              <X className="w-4 h-4" />
              <span>Hủy Tìm Kiếm</span>
            </button>
          </div>
        ) : (
          /* Preferences & Start Button */
          <div className="space-y-5 relative z-10">
            
            {/* Gender Selector */}
            <div className="text-left bg-white/5 p-3.5 rounded-2xl border border-white/5">
              <label className="block text-xs font-bold text-gray-300 mb-2">Bạn muốn kết nối với ai?</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'female', label: 'Nữ Giới ♀', icon: '🌸' },
                  { id: 'male', label: 'Nam Giới ♂', icon: '⚡' },
                  { id: 'all', label: 'Bất Kỳ', icon: '🌍' }
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGenderFilter(g.id)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      genderFilter === g.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-pink-500/25 border border-pink-400/50'
                        : 'bg-white/5 hover:bg-white/10 text-gray-400'
                    }`}
                  >
                    <span>{g.icon}</span>
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Region Selector */}
            <div className="text-left bg-white/5 p-3.5 rounded-2xl border border-white/5">
              <label className="block text-xs font-bold text-gray-300 mb-2">Khu vực tìm kiếm</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'vietnam', label: 'Việt Nam 🇻🇳' },
                  { id: 'global', label: 'Toàn Cầu 🌐' }
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRegionFilter(r.id)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all ${
                      regionFilter === r.id
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-white/5 hover:bg-white/10 text-gray-400'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Balance Info */}
            <div className="flex items-center justify-between px-2 text-xs text-gray-400 font-medium">
              <span className="flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Cước: <strong>20 Xu / phút</strong>
              </span>
              <span className="flex items-center gap-1">
                Số dư: <strong className="text-amber-300">{currentUser?.coins || 0} Xu</strong>
              </span>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartMatch}
              className="w-full py-4 rounded-2xl font-black text-base bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white shadow-xl shadow-pink-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Video className="w-5 h-5 text-cyan-300 animate-pulse" />
              <span>Bắt Đầu Quét Sóng Video Radar</span>
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
