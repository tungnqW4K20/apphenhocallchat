import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { VietQRModal } from './VietQRModal';
import { 
  Coins, 
  Gem, 
  Crown, 
  X, 
  Check, 
  Sparkles, 
  CreditCard, 
  ArrowRight, 
  Building2, 
  ShieldCheck,
  Zap,
  QrCode
} from 'lucide-react';

export const CoinShopModal = ({ isOpen, onClose }) => {
  const { currentUser, updateBalance, fetchCurrentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('coins'); // 'coins' | 'vip' | 'withdraw'
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // VietQR Modal State
  const [isVietQROpen, setIsVietQROpen] = useState(false);
  const [qrDepositData, setQrDepositData] = useState(null);

  // Withdraw Form
  const [withdrawForm, setWithdrawForm] = useState({
    diamonds: 100,
    bank_name: 'Vietcombank',
    account_number: '',
    account_holder: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadPackages();
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [isOpen]);

  const loadPackages = async () => {
    try {
      const res = await api.getCoinPackages();
      if (res.success && res.packages) {
        setPackages(res.packages);
      }
    } catch (err) {
      console.error('Failed to load coin packages:', err);
    }
  };

  if (!isOpen) return null;

  const handleDeposit = async (pkg) => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Create real VietQR deposit request
      const res = await api.createDepositRequest(pkg.id);
      if (res.success) {
        setQrDepositData(res);
        setIsVietQROpen(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi tạo đơn nạp tiền');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyVip = async (level, months = 1) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.buyVip(level, months);
      if (res.success) {
        await fetchCurrentUser();
        setSuccessMsg(res.message || 'Đã nâng cấp VIP thành công! 👑');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi nâng cấp VIP');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawForm.account_number || !withdrawForm.account_holder) {
      setErrorMsg('Vui lòng nhập đầy đủ số tài khoản và tên chủ tài khoản');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.withdraw(withdrawForm);
      if (res.success) {
        updateBalance(undefined, res.new_diamonds);
        setSuccessMsg(res.message);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Lỗi rút tiền');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#151420] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-black flex items-center justify-center font-black text-lg shadow-lg shadow-amber-500/25">
              🪙
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Cửa Hàng Xu & VIP Club
              </h2>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-300">
                <span>Số dư: <strong className="text-amber-300 font-extrabold">{currentUser?.coins || 0} Xu</strong></span>
                <span>•</span>
                <span>Kim Cương: <strong className="text-cyan-300 font-extrabold">{currentUser?.diamonds || 0} 💎</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success / Error alerts */}
        {successMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex bg-white/5 p-1 rounded-2xl my-4 border border-white/10 relative z-10">
          <button
            onClick={() => { setActiveTab('coins'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'coins'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-md shadow-amber-500/25'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Nạp Xu Gọi & Quà</span>
          </button>

          <button
            onClick={() => { setActiveTab('vip'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'vip'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/25'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>Gói Hội Viên VIP</span>
          </button>

          <button
            onClick={() => { setActiveTab('withdraw'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'withdraw'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Gem className="w-4 h-4" />
            <span>Rút Tiền Host</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto pr-1 py-1 custom-scrollbar relative z-10 flex-1">
          
          {/* TAB 1: COIN PACKAGES */}
          {activeTab === 'coins' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="relative p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 transition-all flex flex-col justify-between group"
                >
                  {pkg.badge && (
                    <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-rose-500 to-orange-500 text-white uppercase tracking-wider shadow">
                      {pkg.badge}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🪙</span>
                      <div>
                        <h4 className="font-extrabold text-white text-base">{pkg.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                          <span>{pkg.coins} Xu</span>
                          {pkg.bonus_coins > 0 && (
                            <span className="text-emerald-400 text-[11px] bg-emerald-500/20 px-1.5 py-0.2 rounded-full">
                              +{pkg.bonus_coins} Tặng
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="font-extrabold text-sm text-gray-200">
                      {pkg.price_vnd.toLocaleString('vi-VN')} đ
                    </span>
                    <button
                      onClick={() => handleDeposit(pkg)}
                      disabled={loading}
                      className="px-4 py-1.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-300 text-black shadow hover:scale-105 active:scale-95 transition-all"
                    >
                      Nạp Ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: VIP TIERS */}
          {activeTab === 'vip' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Silver */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-slate-300 text-slate-900 flex items-center justify-center font-bold text-lg mb-2">
                    🥈
                  </div>
                  <h4 className="font-black text-white text-base">VIP Silver</h4>
                  <p className="text-[11px] text-gray-400 mt-1">Trải nghiệm hẹn hò cơ bản không giới hạn</p>
                  <ul className="mt-3 space-y-1.5 text-xs text-gray-300">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Quẹt thẻ vô hạn</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> 1 Superlike mỗi ngày</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Tăng 20% tỉ lệ ghép</li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-xs font-bold text-amber-300 mb-2">300 Xu / Tháng</p>
                  <button
                    onClick={() => handleBuyVip(1)}
                    disabled={loading}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all"
                  >
                    Kích Hoạt Silver
                  </button>
                </div>
              </div>

              {/* Gold */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-500/20 to-transparent border-2 border-amber-400/60 flex flex-col justify-between relative shadow-lg shadow-amber-500/10">
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-black uppercase">
                  PHỔ BIẾN NHẤT
                </span>
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold text-lg mb-2 shadow">
                    🥇
                  </div>
                  <h4 className="font-black text-amber-300 text-base">VIP Gold</h4>
                  <p className="text-[11px] text-gray-300 mt-1">Đầy đủ quyền năng & xem ai thích bạn</p>
                  <ul className="mt-3 space-y-1.5 text-xs text-gray-200 font-medium">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400" /> Xem ai đã Like bạn</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400" /> 5 Superlikes mỗi ngày</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400" /> Rewind không giới hạn</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-400" /> Huy hiệu Vương miện Vàng</li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-amber-400/30">
                  <p className="text-xs font-bold text-amber-300 mb-2">700 Xu / Tháng</p>
                  <button
                    onClick={() => handleBuyVip(2)}
                    disabled={loading}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Kích Hoạt Gold
                  </button>
                </div>
              </div>

              {/* Platinum */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-500/20 to-transparent border border-purple-500/40 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-bold text-lg mb-2 shadow">
                    💎
                  </div>
                  <h4 className="font-black text-purple-300 text-base">VIP Platinum</h4>
                  <p className="text-[11px] text-gray-400 mt-1">Đặc quyền tối thượng & Hộ chiếu hẹn hò</p>
                  <ul className="mt-3 space-y-1.5 text-xs text-gray-300">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-400" /> Mọi quyền lợi của Gold</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-400" /> Đổi vị trí toàn cầu</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-400" /> Tin nhắn trước khi match</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-400" /> 1 Free Boost / tuần</li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-xs font-bold text-purple-300 mb-2">1,500 Xu / Tháng</p>
                  <button
                    onClick={() => handleBuyVip(3)}
                    disabled={loading}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-95 transition-all"
                  >
                    Kích Hoạt Platinum
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: HOST DIAMOND WITHDRAWAL */}
          {activeTab === 'withdraw' && (
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 max-w-lg mx-auto">
              <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 text-2xl mb-2">
                  💎
                </div>
                <h3 className="font-bold text-white text-base">Quy Đổi Kim Cương Ra Tiền Mặt</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tỷ lệ: 1 Kim Cương = <strong className="text-emerald-400">1,000 VND</strong> (Min rút: 100 💎)
                </p>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Số lượng Kim Cương cần rút (Hiện có: {currentUser?.diamonds || 0})
                  </label>
                  <input
                    type="number"
                    min="100"
                    max={currentUser?.diamonds || 0}
                    value={withdrawForm.diamonds}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, diamonds: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                  <p className="text-[11px] text-cyan-300 mt-1 font-semibold">
                    Thực nhận: {(withdrawForm.diamonds * 1000).toLocaleString('vi-VN')} VND
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Ngân hàng</label>
                    <select
                      value={withdrawForm.bank_name}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, bank_name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1e1d2b] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Vietcombank">Vietcombank</option>
                      <option value="Techcombank">Techcombank</option>
                      <option value="MBBank">MBBank</option>
                      <option value="VPBank">VPBank</option>
                      <option value="ACB">ACB</option>
                      <option value="Momo">Ví Momo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Số Tài Khoản</label>
                    <input
                      type="text"
                      required
                      placeholder="1018889999"
                      value={withdrawForm.account_number}
                      onChange={(e) => setWithdrawForm({ ...withdrawForm, account_number: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Tên Chủ Tài Khoản</label>
                  <input
                    type="text"
                    required
                    placeholder="NGUYEN VAN A"
                    value={withdrawForm.account_holder}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, account_holder: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || (currentUser?.diamonds || 0) < 100}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:opacity-95 transition-all disabled:opacity-50"
                >
                  {loading ? 'Đang gửi yêu cầu...' : 'Gửi Yêu Cầu Rút Tiền'}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* VietQR Modal */}
      <VietQRModal
        isOpen={isVietQROpen}
        onClose={() => setIsVietQROpen(false)}
        depositData={qrDepositData}
        onDepositSuccess={(newCoins) => {
          updateBalance(newCoins, undefined);
          setSuccessMsg('Nạp Xu thành công! 🎉');
        }}
      />
    </div>
  );
};
