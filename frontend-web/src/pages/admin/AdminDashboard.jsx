import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Users, 
  DollarSign, 
  Video, 
  Flame, 
  Gift, 
  TrendingUp, 
  ShieldCheck, 
  ArrowUpRight,
  Clock,
  Sparkles
} from 'lucide-react';

export const AdminDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    total_users: 0,
    online_users: 0,
    total_matches: 0,
    total_calls: 0,
    total_revenue: 0,
    total_gifts_sent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminStats();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Tổng Người Dùng',
      value: stats.total_users,
      subtitle: `${stats.online_users} đang online`,
      icon: <Users className="w-6 h-6 text-rose-400" />,
      bg: 'from-rose-500/20 to-pink-500/5',
      border: 'border-rose-500/30'
    },
    {
      title: 'Doanh Thu Nạp Xu',
      value: `${(stats.total_revenue || 0).toLocaleString('vi-VN')} đ`,
      subtitle: 'Nạp qua Momo / Banking',
      icon: <DollarSign className="w-6 h-6 text-emerald-400" />,
      bg: 'from-emerald-500/20 to-teal-500/5',
      border: 'border-emerald-500/30'
    },
    {
      title: 'Cuộc Gọi Video 1v1',
      value: stats.total_calls,
      subtitle: 'Cuộc gọi hoàn thành',
      icon: <Video className="w-6 h-6 text-purple-400" />,
      bg: 'from-purple-500/20 to-indigo-500/5',
      border: 'border-purple-500/30'
    },
    {
      title: 'Cặp Đôi Ghép Thành Công',
      value: stats.total_matches,
      subtitle: 'Tỉ lệ match tự nhiên',
      icon: <Flame className="w-6 h-6 text-amber-400" />,
      bg: 'from-amber-500/20 to-yellow-500/5',
      border: 'border-amber-500/30'
    },
    {
      title: 'Quà Tặng Đã Bắn',
      value: stats.total_gifts_sent,
      subtitle: 'Hiệu ứng quà tặng 3D',
      icon: <Gift className="w-6 h-6 text-cyan-400" />,
      bg: 'from-cyan-500/20 to-blue-500/5',
      border: 'border-cyan-500/30'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-[#161522] border border-purple-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500 text-white uppercase tracking-wider">
              Control Panel
            </span>
            <span className="text-xs text-gray-400">Hệ Thống Đang Hoạt Động Ổn Định 🟢</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Tổng Quan Nền Tảng Hẹn Hò & Video Call</h1>
          <p className="text-xs text-gray-300 mt-1">Quản trị người dùng, doanh thu nạp xu, duyệt tích xanh KYC và cấu hình toàn hệ thống</p>
        </div>

        <button
          onClick={loadStats}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all self-start md:self-auto"
        >
          Làm Mới Số Liệu 🔄
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((c, i) => (
          <div
            key={i}
            className={`p-5 rounded-3xl bg-gradient-to-b ${c.bg} bg-[#161522] border ${c.border} shadow-lg flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-300">{c.title}</span>
              <div className="p-2 rounded-2xl bg-white/5">{c.icon}</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">{c.value}</div>
              <div className="text-[11px] text-gray-400 mt-1 font-medium">{c.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div
          onClick={() => onNavigate('admin-users')}
          className="p-5 rounded-3xl bg-[#161522] border border-white/10 hover:border-rose-500/50 cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-rose-400" />
          </div>
          <h3 className="font-extrabold text-white text-base">Quản Lý Người Dùng</h3>
          <p className="text-xs text-gray-400 mt-1">Xem danh sách, cộng/trừ xu, khóa hoặc mở khóa tài khoản</p>
        </div>

        <div
          onClick={() => onNavigate('admin-verifications')}
          className="p-5 rounded-3xl bg-[#161522] border border-white/10 hover:border-sky-500/50 cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-sky-400" />
          </div>
          <h3 className="font-extrabold text-white text-base">Duyệt Tích Xanh (KYC)</h3>
          <p className="text-xs text-gray-400 mt-1">Xem ảnh chân dung selfie và cấp tích xanh chính chủ</p>
        </div>

        <div
          onClick={() => onNavigate('admin-gifts')}
          className="p-5 rounded-3xl bg-[#161522] border border-white/10 hover:border-amber-500/50 cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Gift className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-amber-400" />
          </div>
          <h3 className="font-extrabold text-white text-base">Kho Quà Tặng 3D</h3>
          <p className="text-xs text-gray-400 mt-1">Thêm quà mới, điều chỉnh giá xu và hiệu ứng bắn quà</p>
        </div>

        <div
          onClick={() => onNavigate('admin-settings')}
          className="p-5 rounded-3xl bg-[#161522] border border-white/10 hover:border-purple-500/50 cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
          </div>
          <h3 className="font-extrabold text-white text-base">Cấu Hình Giá Cước</h3>
          <p className="text-xs text-gray-400 mt-1">Thiết lập giá cước gọi/phút, tỷ lệ đổi kim cương, gói VIP</p>
        </div>

      </div>

    </div>
  );
};
