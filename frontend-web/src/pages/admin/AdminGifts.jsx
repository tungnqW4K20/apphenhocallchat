import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Gift, Plus, Sparkles, Coins, Gem, X } from 'lucide-react';

export const AdminGifts = () => {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGift, setNewGift] = useState({
    name: '',
    icon: '🎁',
    animation_type: 'floating',
    coin_price: 50,
    diamond_reward: 35,
    category: 'popular'
  });

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      setLoading(true);
      const res = await api.getGifts();
      if (res.success && res.gifts) {
        setGifts(res.gifts);
      }
    } catch (err) {
      console.error('Failed to load gifts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGift = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addAdminGift(newGift);
      if (res.success) {
        alert('Đã thêm quà tặng mới thành công!');
        setIsAddModalOpen(false);
        fetchGifts();
      }
    } catch (err) {
      alert(err.message || 'Lỗi thêm quà');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-400" />
            <span>Quản Lý Kho Quà Tặng & Hiệu Ứng</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Danh mục quà tặng ảo, giá xu và số kim cương trả cho idol/host</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-lg shadow-amber-400/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Quà Mới</span>
        </button>
      </div>

      {/* Gifts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {gifts.map((g) => (
          <div
            key={g.id}
            className="p-4 rounded-3xl bg-[#161522] border border-white/10 shadow-xl flex flex-col items-center text-center justify-between"
          >
            <div>
              <span className="text-5xl mb-2 block">{g.icon}</span>
              <h4 className="font-extrabold text-white text-sm">{g.name}</h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-white/5 text-gray-400 mt-1 inline-block">
                Hiệu ứng: {g.animation_type}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-between text-xs">
              <div className="text-left">
                <span className="text-[10px] text-gray-400 block">Giá mua:</span>
                <span className="font-extrabold text-amber-300">{g.coin_price} 🪙</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block">Host nhận:</span>
                <span className="font-extrabold text-cyan-300">{g.diamond_reward} 💎</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Gift Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#181724] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-extrabold text-base text-white">Thêm Quà Tặng Mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGift} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Tên quà tặng</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Trực Thăng VIP"
                  value={newGift.name}
                  onChange={(e) => setNewGift({ ...newGift, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Biểu tượng (Emoji)</label>
                  <input
                    type="text"
                    required
                    placeholder="🚁"
                    value={newGift.icon}
                    onChange={(e) => setNewGift({ ...newGift, icon: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white text-center text-xl focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Loại hiệu ứng</label>
                  <select
                    value={newGift.animation_type}
                    onChange={(e) => setNewGift({ ...newGift, animation_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#201f2d] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="floating">Bay nổi (Floating)</option>
                    <option value="blast">Nổ pháo hoa (Blast)</option>
                    <option value="full_screen">Toàn màn hình (Full Screen)</option>
                    <option value="fireworks">Pháo hoa đặc biệt</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Giá Xu</label>
                  <input
                    type="number"
                    min="1"
                    value={newGift.coin_price}
                    onChange={(e) => setNewGift({ ...newGift, coin_price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Kim Cương trả Host</label>
                  <input
                    type="number"
                    min="1"
                    value={newGift.diamond_reward}
                    onChange={(e) => setNewGift({ ...newGift, diamond_reward: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow"
                >
                  Lưu Quà Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
