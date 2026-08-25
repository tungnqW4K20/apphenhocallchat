import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Coins, 
  ArrowUpRight, 
  Building2, 
  ShieldCheck, 
  RefreshCw,
  Eye,
  Filter
} from 'lucide-react';

export const AdminDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed' | 'rejected'
  const [search, setSearch] = useState('');
  
  // Action state
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchDeposits();
  }, [statusFilter]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminDeposits(statusFilter);
      if (res.success && res.deposits) {
        setDeposits(res.deposits);
      }
    } catch (err) {
      console.error('Failed to load admin deposits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (deposit) => {
    if (!confirm(`Xác nhận DUYỆT đơn ${deposit.transaction_code} (${deposit.money_amount?.toLocaleString('vi-VN')} đ) và CỘNG +${deposit.total_coins} Xu cho ${deposit.user_name}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.approveDeposit(deposit.id, 'Admin đã duyệt chuyển khoản VietQR thành công');
      if (res.success) {
        alert(res.message || 'Đã duyệt nạp tiền thành công!');
        fetchDeposits();
      }
    } catch (err) {
      alert(err.message || 'Lỗi duyệt nạp tiền');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (deposit) => {
    setSelectedDeposit(deposit);
    setRejectReason('Chưa nhận được tiền hoặc sai nội dung chuyển khoản');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!selectedDeposit) return;

    try {
      setActionLoading(true);
      const res = await api.rejectDeposit(selectedDeposit.id, rejectReason);
      if (res.success) {
        alert('Đã từ chối đơn nạp tiền');
        setShowRejectModal(false);
        fetchDeposits();
      }
    } catch (err) {
      alert(err.message || 'Lỗi từ chối nạp tiền');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDeposits = deposits.filter(d => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (d.transaction_code || '').toLowerCase().includes(term) ||
      (d.user_name || '').toLowerCase().includes(term) ||
      (d.user_email || '').toLowerCase().includes(term)
    );
  });

  const pendingCount = deposits.filter(d => d.status === 'pending').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white">Quản Lý & Duyệt Nạp Tiền VietQR</h2>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-black animate-pulse">
                {pendingCount} đơn chờ duyệt
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">Kiểm tra thông tin chuyển khoản ngân hàng, đối soát mã đơn và duyệt cộng xu tức thì</p>
        </div>

        <button
          onClick={fetchDeposits}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-semibold text-gray-300 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm Mới</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-2xl overflow-x-auto custom-scrollbar text-xs">
          {[
            { id: 'all', label: 'Tất Cả' },
            { id: 'pending', label: '⏳ Chờ Duyệt (Pending)' },
            { id: 'completed', label: '✅ Đã Duyệt (Completed)' },
            { id: 'rejected', label: '❌ Từ Chối (Rejected)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Deposits Table */}
      <div className="bg-[#161522] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-rose-500 mb-3" />
            <p className="text-sm">Đang tải danh sách đơn nạp tiền...</p>
          </div>
        ) : filteredDeposits.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CreditCard className="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <p className="text-sm font-semibold">Không tìm thấy đơn nạp tiền nào</p>
            <p className="text-xs text-gray-500 mt-1">Các đơn nạp tiền chuyển khoản ngân hàng sẽ hiển thị tại đây</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Mã Giao Dịch</th>
                  <th className="px-4 py-3.5">Người Nạp</th>
                  <th className="px-4 py-3.5">Số Tiền (VNĐ)</th>
                  <th className="px-4 py-3.5">Số Xu Nhận</th>
                  <th className="px-4 py-3.5">Ngân Hàng Nhận</th>
                  <th className="px-4 py-3.5">Thời Gian</th>
                  <th className="px-4 py-3.5">Trạng Thái</th>
                  <th className="px-4 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDeposits.map((d) => (
                  <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                    
                    {/* Transaction Code */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2 py-1 rounded-lg">
                          {d.transaction_code}
                        </span>
                      </div>
                    </td>

                    {/* User */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={d.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={d.user_name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20"
                        />
                        <div>
                          <p className="font-bold text-white text-xs">{d.user_name}</p>
                          <p className="text-[10px] text-gray-400">{d.user_email || `User #${d.user_id}`}</p>
                        </div>
                      </div>
                    </td>

                    {/* Money */}
                    <td className="px-4 py-4">
                      <span className="font-black text-sm text-emerald-400">
                        {(d.money_amount || 0).toLocaleString('vi-VN')} đ
                      </span>
                    </td>

                    {/* Coins */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-extrabold text-amber-300">
                          +{(d.total_coins || 0).toLocaleString('vi-VN')} Xu
                        </span>
                        {d.bonus_coins > 0 && (
                          <span className="text-[10px] text-amber-400/70">(+{d.bonus_coins} bonus)</span>
                        )}
                      </div>
                    </td>

                    {/* Bank */}
                    <td className="px-4 py-4">
                      <div className="text-gray-300">
                        <p className="font-semibold">{d.bank_name || 'MBBank'}</p>
                        <p className="text-[10px] text-gray-500">{d.bank_account || '999988886666'}</p>
                      </div>
                    </td>

                    {/* Time */}
                    <td className="px-4 py-4 text-gray-400 text-[11px]">
                      {new Date(d.created_at).toLocaleString('vi-VN')}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      {d.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Đã Duyệt
                        </span>
                      )}
                      {d.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                          <Clock className="w-3 h-3" />
                          Chờ Duyệt
                        </span>
                      )}
                      {d.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <XCircle className="w-3 h-3" />
                          Từ Chối
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      {d.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleApprove(d)}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 hover:scale-105 transition-all"
                            title="Xác nhận đã nhận tiền và cộng xu ngay lập tức"
                          >
                            Duyệt Nạp
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleOpenReject(d)}
                            className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl font-bold transition-all"
                            title="Từ chối đơn nạp"
                          >
                            Từ Chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-500 italic">
                          {d.admin_note || 'Đã xử lý'}
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

      {/* Reject Modal */}
      {showRejectModal && selectedDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#161522] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-white">Từ Chối Đơn Nạp Tiền</h3>
            <p className="text-xs text-gray-400">
              Đơn hàng: <span className="font-mono text-cyan-300 font-bold">{selectedDeposit.transaction_code}</span> ({selectedDeposit.money_amount?.toLocaleString('vi-VN')} đ)
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Lý do từ chối:</label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ví dụ: Chưa nhận được tiền, sai nội dung chuyển khoản..."
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all"
                >
                  {actionLoading ? 'Đang xử lý...' : 'Xác Nhận Từ Chối'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
