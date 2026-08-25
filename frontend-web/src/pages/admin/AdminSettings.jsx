import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Sliders, Save, Check, ShieldCheck, Coins, Gem, Crown } from 'lucide-react';

export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    call_rate_per_min: '20',
    free_daily_matches: '10',
    diamond_to_vnd_rate: '1000',
    vip_silver_price: '300',
    vip_gold_price: '700',
    vip_platinum_price: '1500'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminSettings();
      if (res.success && res.settings) {
        setSettings(prev => ({ ...prev, ...res.settings }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateAdminSettings(settings);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      alert(err.message || 'Lỗi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-purple-400" />
          <span>Cấu Hình Tham Số Hệ Thống</span>
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">Thiết lập giá cước gọi video, tỷ lệ đổi kim cương và giá gói VIP</p>
      </div>

      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>Đã lưu thành công cấu hình hệ thống!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#161522] border border-white/10 shadow-2xl space-y-5">
        
        {/* Call Pricing */}
        <div className="space-y-3 pb-4 border-b border-white/10">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Cước Phí Cuộc Gọi Video 1v1 & Ghép Đôi</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Giá cước gọi video mặc định (Xu / phút)
            </label>
            <input
              type="number"
              value={settings.call_rate_per_min}
              onChange={(e) => setSettings({ ...settings, call_rate_per_min: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Diamond Exchange */}
        <div className="space-y-3 pb-4 border-b border-white/10">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Gem className="w-4 h-4 text-cyan-400" />
            <span>Tỷ Giá Quy Đổi Kim Cương (Host Rút Tiền)</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Giá trị 1 Kim Cương (VND)
            </label>
            <input
              type="number"
              value={settings.diamond_to_vnd_rate}
              onChange={(e) => setSettings({ ...settings, diamond_to_vnd_rate: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Bank Account Settings for VietQR */}
        <div className="space-y-3 pb-4 border-b border-white/10">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Tài Khoản Ngân Hàng Nhận Tiền Nạp VietQR</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Tên Ngân Hàng (Mã)</label>
              <input
                type="text"
                placeholder="MBBank"
                value={settings.bank_name || 'MBBank'}
                onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Số Tài Khoản</label>
              <input
                type="text"
                placeholder="999988886666"
                value={settings.bank_account || '999988886666'}
                onChange={(e) => setSettings({ ...settings, bank_account: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Chủ Tài Khoản (In Hoa)</label>
              <input
                type="text"
                placeholder="AYARFLAME TECH JSC"
                value={settings.bank_holder || 'AYARFLAME TECH JSC'}
                onChange={(e) => setSettings({ ...settings, bank_holder: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:border-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* VIP Pricing */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-300" />
            <span>Bảng Giá Gói Hội Viên VIP (Xu / Tháng)</span>
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Silver VIP</label>
              <input
                type="number"
                value={settings.vip_silver_price}
                onChange={(e) => setSettings({ ...settings, vip_silver_price: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Gold VIP</label>
              <input
                type="number"
                value={settings.vip_gold_price}
                onChange={(e) => setSettings({ ...settings, vip_gold_price: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Platinum VIP</label>
              <input
                type="number"
                value={settings.vip_platinum_price}
                onChange={(e) => setSettings({ ...settings, vip_platinum_price: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Đang lưu cấu hình...' : 'Lưu Thay Đổi Cấu Hình'}</span>
        </button>

      </form>

    </div>
  );
};
