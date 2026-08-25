import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useWebRTC } from '../../context/WebRTCContext';
import { 
  Users, 
  UserCheck, 
  Heart, 
  Star, 
  Search, 
  MessageCircle, 
  Video, 
  Gift, 
  MapPin, 
  Sparkles, 
  ShieldCheck,
  UserPlus,
  UserMinus,
  RefreshCw
} from 'lucide-react';

export const FriendsPage = ({ onOpenProfile, onOpenChat, onOpenGift, onOpenShop }) => {
  const { startDirectCall } = useWebRTC();
  const [subTab, setSubTab] = useState('friends'); // 'friends' | 'following' | 'followers'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [friends, setFriends] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchRelationships = async () => {
    setLoading(true);
    try {
      const [friendsRes, followingRes, followersRes] = await Promise.all([
        api.getFriends(),
        api.getFollowing(),
        api.getFollowers()
      ]);

      if (friendsRes.success) setFriends(friendsRes.friends || []);
      if (followingRes.success) setFollowing(followingRes.following || []);
      if (followersRes.success) setFollowers(followersRes.followers || []);
    } catch (err) {
      console.error('Lỗi tải danh sách bạn bè & theo dõi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelationships();
  }, []);

  const handleToggleFollow = async (user) => {
    try {
      setActionLoadingId(user.id);
      const res = await api.toggleFollow(user.id);
      if (res.success) {
        // Refresh all lists to stay in sync
        await fetchRelationships();
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi thao tác theo dõi');
    } finally {
      setActionLoadingId(null);
    }
  };

  const currentList = subTab === 'friends' ? friends : subTab === 'following' ? following : followers;

  const filteredList = currentList.filter(u => {
    if (!search) return true;
    const nameMatch = u.full_name?.toLowerCase().includes(search.toLowerCase());
    const cityMatch = u.city?.toLowerCase().includes(search.toLowerCase());
    return nameMatch || cityMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header & Metric Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Bạn Bè & Theo Dõi</h1>
              <p className="text-xs text-gray-400">Quản lý các kết nối, người hâm mộ và gọi video trò chuyện 1v1</p>
            </div>
          </div>
        </div>

        {/* Quick Refresh Button */}
        <button
          onClick={fetchRelationships}
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-semibold text-gray-300 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {/* 3 Main Tab Switchers */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 p-1.5 bg-[#14131f] border border-white/10 rounded-2xl mb-6">
        <button
          onClick={() => setSubTab('friends')}
          className={`flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            subTab === 'friends'
              ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Bạn Bè</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${subTab === 'friends' ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'}`}>
            {friends.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('following')}
          className={`flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            subTab === 'following'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Đang Theo Dõi</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${subTab === 'following' ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'}`}>
            {following.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('followers')}
          className={`flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            subTab === 'followers'
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/30'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Người Theo Dõi</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${subTab === 'followers' ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'}`}>
            {followers.length}
          </span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={`Tìm kiếm trong ${subTab === 'friends' ? 'bạn bè' : subTab === 'following' ? 'danh sách đã theo dõi' : 'người theo dõi'} theo tên hoặc thành phố...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#14131f] border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-colors shadow-inner"
        />
      </div>

      {/* User Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-[#14131f] border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl mb-4">
            {subTab === 'friends' ? '👥' : subTab === 'following' ? '❤️' : '⭐'}
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {subTab === 'friends' 
              ? 'Chưa có bạn bè nào'
              : subTab === 'following'
              ? 'Bạn chưa theo dõi ai'
              : 'Chưa có ai theo dõi bạn'}
          </h3>
          <p className="text-xs text-gray-400 max-w-md mb-6">
            {subTab === 'friends'
              ? 'Khi bạn và người khác quẹt Like nhau hoặc theo dõi chéo, họ sẽ xuất hiện tại đây để bạn nhắn tin và gọi video!'
              : subTab === 'following'
              ? 'Hãy khám phá danh sách người dùng xung quanh và nhấn Theo Dõi để cập nhật trạng thái của họ.'
              : 'Hãy hoàn thiện hồ sơ và online thường xuyên để có thêm nhiều người theo dõi nhé!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((user) => (
            <div
              key={user.id}
              className="bg-[#14131f] border border-white/10 hover:border-rose-500/40 rounded-3xl p-4 transition-all duration-200 hover:shadow-xl hover:shadow-rose-500/5 group flex flex-col justify-between"
            >
              <div>
                {/* Top User Info */}
                <div className="flex items-start gap-3.5 mb-3">
                  <div 
                    onClick={() => onOpenProfile(user)}
                    className="relative cursor-pointer shrink-0"
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                      alt={user.full_name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/10 group-hover:ring-rose-500 transition-all"
                    />
                    {user.is_online && (
                      <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-[#14131f]" />
                    )}
                    {user.vip_level > 0 && (
                      <span className="absolute -top-1.5 -left-1.5 text-xs bg-amber-500/90 text-black px-1 rounded-full font-black">
                        👑 VIP{user.vip_level}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 
                        onClick={() => onOpenProfile(user)}
                        className="font-bold text-white text-base truncate cursor-pointer hover:text-rose-400 transition-colors"
                      >
                        {user.full_name}
                      </h3>
                      {user.is_verified && (
                        <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-0.5">
                      {user.age ? `${user.age} tuổi` : ''} {user.job ? `• ${user.job}` : ''}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        {user.city || 'Việt Nam'}
                      </span>
                      {user.distance_km && (
                        <span className="shrink-0">• cách {user.distance_km} km</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Bio snippet */}
                {user.bio && (
                  <p className="text-xs text-gray-400 line-clamp-2 bg-white/5 p-2 rounded-xl mb-3 border border-white/5">
                    "{user.bio}"
                  </p>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="grid grid-cols-2 gap-2">
                  {/* Chat Button */}
                  <button
                    onClick={() => onOpenChat(user)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition-all shadow-md hover:scale-[1.02]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Nhắn Tin</span>
                  </button>

                  {/* Video Call Button */}
                  <button
                    onClick={() => startDirectCall(user, 'video')}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white transition-all shadow-lg shadow-rose-500/25 hover:scale-[1.02]"
                  >
                    <Video className="w-4 h-4" />
                    <span>Gọi 1v1</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Follow / Unfollow Button */}
                  <button
                    onClick={() => handleToggleFollow(user)}
                    disabled={actionLoadingId === user.id}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-semibold text-xs transition-all ${
                      user.is_following
                        ? 'bg-white/10 hover:bg-rose-500/20 text-gray-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                    }`}
                  >
                    {user.is_following ? (
                      <>
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>{subTab === 'following' ? 'Bỏ theo dõi' : 'Đang theo dõi'}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Theo Dõi</span>
                      </>
                    )}
                  </button>

                  {/* Send Gift Button */}
                  <button
                    onClick={() => onOpenGift(user)}
                    className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/30 transition-all"
                    title="Tặng Quà 3D"
                  >
                    <Gift className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
