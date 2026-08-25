import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useWebRTC } from '../../context/WebRTCContext';
import { SwipeCard } from '../../components/SwipeCard';
import { MatchCelebrationModal } from '../../components/MatchCelebrationModal';
import { 
  Flame, 
  RotateCcw, 
  SlidersHorizontal, 
  Sparkles, 
  Heart, 
  Video, 
  Users,
  MapPin
} from 'lucide-react';

export const DiscoverPage = ({ onOpenProfile, onOpenChat, onOpenGift, onOpenShop }) => {
  const { currentUser, updateBalance } = useAuth();
  const { startDirectCall } = useWebRTC();

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([]); // for rewind
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState(null);

  // Filter Drawer
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    gender: 'all',
    minAge: 18,
    maxAge: 35
  });

  useEffect(() => {
    fetchCards();
  }, [filters]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await api.getCardDeck(filters);
      if (res.success && res.users) {
        setCards(res.users);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Failed to load card deck:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (targetId, action) => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    // Deduct coins if superlike
    if (action === 'superlike' && (currentUser?.vip_level || 0) === 0) {
      updateBalance(Math.max(0, (currentUser?.coins || 0) - 10), undefined);
    }

    try {
      const res = await api.swipe(targetId, action);
      
      // Push to rewind history
      setHistory(prev => [...prev, { card: currentCard, index: currentIndex }]);

      // Check if match
      if (res.isMatch && res.matchInfo) {
        setMatchData(res.matchInfo);
      }

      // Next card
      setCurrentIndex(prev => prev + 1);
    } catch (err) {
      console.error('Swipe error:', err);
    }
  };

  const handleRewind = () => {
    if (history.length === 0) return;
    if ((currentUser?.vip_level || 0) === 0 && (currentUser?.coins || 0) < 5) {
      alert('Rewind (quay lại) cần gói VIP hoặc 5 Xu!');
      return;
    }
    const last = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setCurrentIndex(last.index);
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col items-center justify-center min-h-[calc(100vh-140px)]">
      
      {/* Top Filter Bar */}
      <div className="w-full max-w-sm sm:max-w-md flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center shadow">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white leading-tight">Khám Phá</h2>
            <p className="text-[11px] text-gray-400">Vuốt phải để Thích, vuốt trái để Bỏ qua</p>
          </div>
        </div>

        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`p-2.5 rounded-2xl border transition-all ${
            isFilterOpen 
              ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/25' 
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
          }`}
          title="Bộ lọc tìm kiếm"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Dropdown Box */}
      {isFilterOpen && (
        <div className="w-full max-w-sm sm:max-w-md mb-4 p-4 rounded-3xl bg-[#181724] border border-white/10 shadow-2xl animate-fade-in space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tiêu Chí Tìm Kiếm</h4>
            <span className="text-[10px] text-rose-400 font-semibold cursor-pointer" onClick={() => setFilters({ gender: 'all', minAge: 18, maxAge: 35 })}>Đặt lại</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1">Giới tính muốn hẹn hò</label>
            <div className="grid grid-cols-3 gap-1.5 bg-white/5 p-1 rounded-xl">
              {['all', 'female', 'male'].map((g) => (
                <button
                  key={g}
                  onClick={() => setFilters({ ...filters, gender: g })}
                  className={`py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                    filters.gender === g ? 'bg-rose-500 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {g === 'all' ? 'Tất Cả' : g === 'female' ? 'Nữ Giới ♀' : 'Nam Giới ♂'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-gray-400 font-semibold mb-1">
              <span>Độ tuổi:</span>
              <span className="text-rose-400 font-bold">{filters.minAge} - {filters.maxAge} tuổi</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="18"
                max="50"
                value={filters.minAge}
                onChange={(e) => setFilters({ ...filters, minAge: Number(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <input
                type="range"
                min="18"
                max="50"
                value={filters.maxAge}
                onChange={(e) => setFilters({ ...filters, maxAge: Number(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Tinder Card Deck Area */}
      {loading ? (
        <div className="w-full max-w-sm sm:max-w-md aspect-[3/4.4] rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center animate-pulse">
          <Flame className="w-12 h-12 text-rose-500/50 animate-bounce mb-3" />
          <p className="text-xs text-gray-400 font-semibold">Đang tìm các hồ sơ phù hợp quanh bạn...</p>
        </div>
      ) : currentCard ? (
        <SwipeCard
          user={currentCard}
          onSwipe={handleSwipe}
          onOpenProfile={onOpenProfile}
          onDirectCall={(u) => startDirectCall(u, 'video')}
          onDirectChat={onOpenChat}
          onOpenGift={onOpenGift}
          onRewind={handleRewind}
          canRewind={history.length > 0}
        />
      ) : (
        /* Empty State */
        <div className="w-full max-w-sm sm:max-w-md aspect-[3/4.2] rounded-3xl bg-[#161522] border border-white/10 p-8 flex flex-col items-center justify-center text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
            <Users className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-white">Bạn Đã Xem Hết Hồ Sơ!</h3>
          <p className="text-xs text-gray-400 mt-2 max-w-xs leading-relaxed">
            Hãy mở rộng khoảng cách, thay đổi bộ lọc độ tuổi hoặc chuyển sang chế độ <strong>Video Radar</strong> để kết nối ngay với người lạ!
          </p>

          <div className="flex flex-col gap-2.5 w-full mt-6">
            <button
              onClick={fetchCards}
              className="w-full py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Tải Lại Danh Sách
            </button>
            <button
              onClick={onOpenShop}
              className="w-full py-3 rounded-2xl font-bold text-xs bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-400/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Nâng Cấp VIP Để Xem Ai Đã Thích Bạn</span>
            </button>
          </div>
        </div>
      )}

      {/* Match Celebration Modal */}
      <MatchCelebrationModal
        matchData={matchData}
        onClose={() => setMatchData(null)}
        onOpenChat={(p) => {
          setMatchData(null);
          onOpenChat(p);
        }}
        onStartCall={(p) => {
          setMatchData(null);
          startDirectCall(p, 'video');
        }}
      />

    </div>
  );
};
