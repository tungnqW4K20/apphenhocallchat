import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Gift, X, Coins, Sparkles, Send } from 'lucide-react';

export const GiftDrawer = ({ isOpen, onClose, receiver, onSendGift }) => {
  const { currentUser, updateBalance } = useAuth();
  const [gifts, setGifts] = useState([]);
  const [selectedGift, setSelectedGift] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchGifts();
    }
  }, [isOpen]);

  const fetchGifts = async () => {
    try {
      const res = await api.getGifts();
      if (res.success && res.gifts) {
        setGifts(res.gifts);
        if (res.gifts.length > 0 && !selectedGift) {
          setSelectedGift(res.gifts[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load gifts:', err);
    }
  };

  if (!isOpen || !receiver) return null;

  const handleSend = async () => {
    if (!selectedGift) return;

    if ((currentUser?.coins || 0) < selectedGift.coin_price) {
      setError(`Bạn không đủ Xu để tặng ${selectedGift.name}. Hãy nạp thêm Xu!`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (onSendGift) {
        onSendGift(selectedGift.id);
      } else {
        const res = await api.sendGift(receiver.id, selectedGift.id);
        if (res.success) {
          updateBalance(res.remaining_coins, undefined);
        }
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Lỗi gửi quà');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#181724] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        
        {/* Glow */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-amber-500/15 to-transparent blur-xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold">
              🎁
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Tặng Quà Cho {receiver.full_name}
              </h3>
              <p className="text-[11px] text-gray-400">Tặng quà tăng độ thân mật & bắn hiệu ứng 3D trực tiếp</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Gifts Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 my-4 overflow-y-auto py-1 pr-1 custom-scrollbar">
          {gifts.map((g) => {
            const isSelected = selectedGift?.id === g.id;
            return (
              <div
                key={g.id}
                onClick={() => { setSelectedGift(g); setError(''); }}
                className={`flex flex-col items-center p-2.5 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-500/30 to-amber-500/10 border-2 border-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                    : 'bg-white/5 hover:bg-white/10 border border-white/5'
                }`}
              >
                <span className="text-3xl sm:text-4xl mb-1 transform hover:scale-125 transition-transform duration-200">
                  {g.icon}
                </span>
                <span className="text-[11px] font-bold text-gray-200 text-center truncate w-full">
                  {g.name}
                </span>
                <div className="flex items-center gap-0.5 mt-1 text-[11px] font-extrabold text-amber-300">
                  <span>{g.coin_price}</span>
                  <span className="text-[9px]">🪙</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Bar: Coin Balance & Send Button */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Số dư:</span>
            <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full text-amber-300 font-bold text-xs">
              <Coins className="w-3.5 h-3.5" />
              <span>{(currentUser?.coins || 0).toLocaleString('vi-VN')} Xu</span>
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={loading || !selectedGift}
            className="flex-1 max-w-[180px] py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/25 hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Đang gửi...' : 'Gửi Tặng Ngay'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
