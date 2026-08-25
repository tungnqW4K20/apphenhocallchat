import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useWebRTC } from '../../context/WebRTCContext';
import { 
  Compass, 
  MapPin, 
  Video, 
  MessageCircle, 
  CheckCircle2, 
  Filter, 
  Sparkles, 
  Users,
  Search,
  Sliders,
  Radio,
  Heart
} from 'lucide-react';

export const ExplorePage = ({ onOpenProfile, onOpenChat, onOpenGift }) => {
  const { currentUser } = useAuth();
  const { startDirectCall } = useWebRTC();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [hostOnly, setHostOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50); // in km
  const [showRadarFilter, setShowRadarFilter] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [onlineOnly, hostOnly, maxDistance]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getNearbyUsers({
        onlineOnly: onlineOnly ? 'true' : 'false',
        isHostOnly: hostOnly ? 'true' : 'false',
        maxDistance: maxDistance
      });
      if (res.success && res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Failed to load explore users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return u.full_name.toLowerCase().includes(s) || (u.city && u.city.toLowerCase().includes(s)) || (u.bio && u.bio.toLowerCase().includes(s));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">Tìm Bạn Bè Quanh Đây</h1>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Tìm kiếm bạn bè theo vị trí bán kính, trò chuyện và gọi video 1v1 trực tiếp</p>
        </div>

        {/* Search input & Radar trigger */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, thành phố, sở thích..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <button
            onClick={() => setShowRadarFilter(!showRadarFilter)}
            className={`p-2.5 rounded-2xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
              showRadarFilter ? 'bg-rose-500 text-white border-rose-400 shadow' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
            title="Bán kính tìm kiếm"
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">Bán kính ({maxDistance}km)</span>
          </button>
        </div>
      </div>

      {/* Radar Distance Slider Panel */}
      {showRadarFilter && (
        <div className="bg-[#151421] border border-white/10 rounded-3xl p-5 mb-6 animate-fade-in shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Bán Kính Quét Vị Trí Xung Quanh</h4>
                <p className="text-xs text-gray-400">Chỉ hiển thị những người cách bạn trong vòng <span className="text-rose-400 font-bold">{maxDistance} km</span></p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-72">
              <input
                type="range"
                min="1"
                max="100"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-white bg-white/10 px-3 py-1 rounded-xl shrink-0">
                {maxDistance} km
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 custom-scrollbar text-xs">
        <div className="px-4 py-2 rounded-xl font-extrabold whitespace-nowrap bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25 flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 fill-white" />
          <span>{currentUser?.gender === 'female' ? 'Khám Phá Bạn Nam ♂ (Hẹn hò khác giới)' : 'Khám Phá Bạn Nữ ♀ (Hẹn hò khác giới)'}</span>
        </div>

        <button
          onClick={() => setOnlineOnly(!onlineOnly)}
          className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            onlineOnly ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25' : 'bg-white/5 text-gray-300 hover:bg-white/10'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Đang Trực Tuyến</span>
        </button>

        <button
          onClick={() => setHostOnly(!hostOnly)}
          className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            hostOnly ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25' : 'bg-white/5 text-gray-300 hover:bg-white/10'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-cyan-300" />
          <span>Idol / Host Call</span>
        </button>
      </div>

      {/* Grid of Users */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-3xl bg-white/5 border border-white/5" />
          ))}
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => onOpenProfile(u)}
              className="group relative aspect-[3/4.2] rounded-3xl overflow-hidden bg-[#16161e] border border-white/10 shadow-xl cursor-pointer hover:-translate-y-1.5 transition-all duration-300"
            >
              {/* Photo */}
              <img
                src={u.avatar}
                alt={u.full_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Status Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                {u.is_online ? (
                  u.is_in_call ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-black flex items-center gap-1 shadow">
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                      Đang bận gọi
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1 shadow">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      Rảnh
                    </span>
                  )
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800/80 text-gray-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                    Offline
                  </span>
                )}

                {u.is_host && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-600/90 text-white border border-purple-400/30 flex items-center gap-1 shadow backdrop-blur-md">
                    <Video className="w-3 h-3 text-cyan-300" />
                    {u.call_rate_per_min || 20}🪙/p
                  </span>
                )}
              </div>

              {/* Bottom Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

              {/* User Summary Info */}
              <div className="absolute bottom-3 inset-x-3 text-left">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-white text-base truncate">
                    {u.full_name}, {u.age || 22}
                  </h3>
                  {u.is_verified && (
                    <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20 shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-gray-300 font-medium flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="truncate">{u.city || 'Hà Nội'} • Cách bạn {u.distance_km || 2} km</span>
                </p>

                {/* Quick Action Buttons on Card */}
                <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onOpenChat(u)}
                    className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-1 shadow transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Nhắn Tin</span>
                  </button>

                  <button
                    onClick={async () => {
                      try {
                        const res = await api.toggleFollow(u.id);
                        if (res.success) {
                          setUsers(prev => prev.map(item => item.id === u.id ? { ...item, is_following: res.isFollowing } : item));
                        }
                      } catch (err) {
                        alert(err.message);
                      }
                    }}
                    className={`p-2 rounded-xl transition-all ${
                      u.is_following 
                        ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50' 
                        : 'bg-white/10 hover:bg-white/20 text-gray-300'
                    }`}
                    title={u.is_following ? "Đang theo dõi (Nhấn để hủy)" : "Theo dõi người này"}
                  >
                    <Heart className={`w-3.5 h-3.5 ${u.is_following ? 'fill-rose-400 text-rose-400' : ''}`} />
                  </button>

                  <button
                    onClick={() => startDirectCall(u, 'video')}
                    className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow hover:scale-105 active:scale-95 transition-all"
                    title="Gọi Video 1v1"
                  >
                    <Video className="w-3.5 h-3.5 text-cyan-200" />
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white/5 rounded-3xl border border-white/5">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="font-bold text-white text-base">Không tìm thấy người dùng trong bán kính {maxDistance}km</h3>
          <p className="text-xs text-gray-400 mt-1">Hãy thử tăng bán kính quét vị trí hoặc bỏ bớt các bộ lọc</p>
        </div>
      )}

    </div>
  );
};
