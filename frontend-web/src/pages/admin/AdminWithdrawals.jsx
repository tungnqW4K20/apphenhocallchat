import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Gem, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  RefreshCw,
  DollarSign
} from 'lucide-react';

export const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminWithdrawals();
      if (res.success && res.withdrawals) {
        setWithdrawals(res.withdrawals);
      }
    } catch (err) {
      console.error('Failed to load admin withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    const note = prompt(`Nhập ghi chú ${status === 'completed' ? 'chi trả' : 'từ chối'}:`, status === 'completed' ? 'Đã chuyển khoản ngân hàng' : 'Thông tin ngân hàng không hợp lệ');
    if (note === null) return;

    try {
      setActionLoading(true);
      const res = await api.reviewWithdrawal(id, status, note);
      if (res.success) {
        alert(res.message || 'Cập nhật yêu cầu rút tiền thành công!');
        fetchWithdrawals();
      }
    } catch (err) {
      alert(err.message || 'Lỗi xử lý yêu cầu rút tiền');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = withdrawals.filter(w => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (w.full_name || '').toLowerCase().includes(term) ||
      (w.payment_method || '').toLowerCase().includes(term) ||
      (w.email || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Quản Lý Rút Tiền Kim Cương (Idol Cashout)</h2>
          <p className="text-xs text-gray-400">Duyệt chi trả tiền mặt qua số tài khoản ngân hàng của Idol/Host</p>
        </div>

        <button
          onClick={fetchWithdrawals}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-semibold text-gray-300 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm Mới</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm theo tên Idol, email, số tài khoản..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
        />
      </div>

      {/* Table */}
      <div className="bg-[#161522] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-rose-500 mb-3" />
            <p className="text-sm">Đang tải danh sách rút tiền...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Gem className="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <p className="text-sm font-semibold">Chưa có yêu cầu rút tiền nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Idol / Host</th>
                  <th className="px-4 py-3.5">Kim Cương Rút</th>
                  <th className="px-4 py-3.5">Số Tiền (VNĐ)</th>
                  <th className="px-4 py-3.5">Thông Tin Ngân Hàng Nhận</th>
                  <th className="px-4 py-3.5">Thời Gian</th>
                  <th className="px-4 py-3.5">Trạng Thái</th>
                  <th className="px-4 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((w) => (
                  <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
                    
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={w.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={w.full_name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20"
                        />
                        <div>
                          <p className="font-bold text-white text-xs">{w.full_name}</p>
                          <p className="text-[10px] text-gray-400">{w.email || `User #${w.user_id}`}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Gem className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-extrabold text-cyan-300">
                          {(w.amount || 0).toLocaleString('vi-VN')} 💎
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-black text-sm text-emerald-400">
                        {(w.money_amount || (w.amount * 1000) || 0).toLocaleString('vi-VN')} đ
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-gray-300 font-mono text-[11px] bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10 inline-block">
                        {w.payment_method || 'Vietcombank'}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-gray-400 text-[11px]">
                      {new Date(w.created_at).toLocaleString('vi-VN')}
                    </td>

                    <td className="px-4 py-4">
                      {w.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Đã Chi Trả
                        </span>
                      )}
                      {w.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                          <Clock className="w-3 h-3" />
                          Chờ Chi Trả
                        </span>
                      )}
                      {w.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <XCircle className="w-3 h-3" />
                          Đã Từ Chối
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right">
                      {w.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleReview(w.id, 'completed')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-600/20"
                          >
                            Duyệt Chi
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleReview(w.id, 'rejected')}
                            className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl font-bold transition-all"
                          >
                            Từ Chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-500 italic">
                          {w.description || 'Đã hoàn tất'}
                        </span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
