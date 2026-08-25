import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Gift, 
  Check, 
  Coins, 
  Ticket, 
  Crown, 
  Clock, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DailyCheckinModal = ({ isOpen, onClose }) => {
  const { updateBalance } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('checkin'); // 'checkin' | 'vouchers'

  useEffect(() => {
    if (isOpen) {
      loadCheckinStatus();
      setSuccessMsg('');
    }
  }, [isOpen]);

  const loadCheckinStatus = async () => {
    try {
      setLoading(true);
      const res = await api.getCheckinStatus();
      if (res.success) {
        setStatus(res);
      }
    } catch (err) {
      console.error('Failed to load checkin status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleClaim = async () => {
    setClaiming(true);
    setSuccessMsg('');
    try {
      const res = await api.claimDailyCheckin();
      if (res.success) {
        if (res.new_coins !== undefined) {
          updateBalance(res.new_coins, undefined);
        }
        setSuccessMsg(res.message);
        loadCheckinStatus();
      }
    } catch (err) {
      alert(err.message || 'Lỗi điểm danh');
    } finally {
      setClaiming(false);
    }
  };

  const streak = status?.streak_days || 0;
  const canCheckIn = status?.can_check_in;
  const rewards = status?.rewards_config || [];
  const vouchers = status?.vouchers || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#161522] border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Điểm Danh 7 Ngày & Kho Voucher</h3>
              <p className="text-xs text-gray-400">Nhận Vé Gọi Free 2 Phút, Vé Chat & Xu Thưởng Hàng Ngày</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'checkin'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🎁 Điểm Danh Hàng Ngày
          </button>
          <button
            onClick={() => setActiveTab('vouchers')}
            className={`flex-1 py-2 rounded-xl transition-all relative ${
              activeTab === 'vouchers'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🎟️ Kho Voucher ({vouchers.length})
            {vouchers.length > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-cyan-400" />
            )}
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Đang tải thông tin điểm danh...</div>
        ) : activeTab === 'checkin' ? (
          <div className="space-y-4">
            
            {/* Success Message Banner */}
            {successMsg && (
              <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Streak Status */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-rose-900/30 border border-rose-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Chuỗi Điểm Danh</span>
                <h4 className="text-xl font-black text-white">
                  Đã Điểm Danh <span className="text-rose-400">{streak}</span> / 7 Ngày
                </h4>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl shadow-inner">
                🔥
              </div>
            </div>

            {/* 7-Day Rewards Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {rewards.map((r) => {
                const isClaimed = streak >= r.day;
                const isNext = canCheckIn && streak + 1 === r.day;

                return (
                  <div
                    key={r.day}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center justify-between text-center transition-all ${
                      isClaimed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : isNext
                        ? 'bg-gradient-to-b from-rose-500/30 to-pink-600/10 border-rose-500 ring-2 ring-rose-500/50 scale-105 shadow-lg shadow-rose-500/20'
                        : 'bg-white/5 border-white/10 text-gray-400'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-gray-400">Ngày {r.day}</span>
                    <span className="text-2xl my-1.5">{r.icon}</span>
                    <p className="text-[10px] font-extrabold line-clamp-1 text-white">{r.title}</p>
                    
                    {isClaimed ? (
                      <span className="mt-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    ) : isNext ? (
                      <span className="mt-1 text-[9px] font-black text-rose-400 animate-pulse">
                        Hôm nay
                      </span>
                    ) : (
                      <span className="mt-1 text-[9px] text-gray-600">Khóa</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Claim Action Button */}
            <div className="pt-2">
              {canCheckIn ? (
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white rounded-2xl font-black text-sm shadow-xl shadow-rose-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>{claiming ? 'Đang Mở Quà...' : `Điểm Danh Nhận Quà Ngày ${streak + 1}`}</span>
                </button>
              ) : (
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Bạn đã điểm danh hôm nay rồi. Hãy quay lại vào ngày mai nhé! ✨</span>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Vouchers List */
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">Voucher Đang Có Hiệu Lực</h4>
            {vouchers.length === 0 ? (
              <div className="p-8 text-center text-gray-500 space-y-2">
                <Ticket className="w-10 h-10 mx-auto text-gray-600" />
                <p className="text-xs">Bạn chưa có voucher nào. Hãy điểm danh hàng ngày để nhận Vé Gọi Free và Vé Chat!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {vouchers.map(v => (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-transparent border border-rose-500/30 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-xl shadow">
                        {v.voucher_type === 'free_call_2min' ? '🎟️' : '💬'}
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">{v.title}</h5>
                        <p className="text-[11px] text-gray-300 mt-0.5">{v.description}</p>
                        {v.expires_at && (
                          <span className="text-[10px] text-amber-400 font-medium">
                            Hạn dùng: {new Date(v.expires_at).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-black text-xs shadow-md shadow-rose-500/30">
                      x{v.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
