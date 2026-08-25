import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Users, 
  Search, 
  Ban, 
  CheckCircle2, 
  Coins, 
  Gem, 
  Video, 
  ShieldAlert, 
  Edit3, 
  X, 
  Save,
  Eye,
  Key,
  ShieldCheck,
  Crown,
  Ticket,
  MessageCircle,
  PhoneCall,
  CreditCard,
  AlertTriangle
} from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Balance Adjust Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustData, setAdjustData] = useState({ delta_coins: 100, delta_diamonds: 0, reason: 'Thưởng sự kiện' });
  const [modalLoading, setModalLoading] = useState(false);

  // User Details Modal
  const [detailUser, setDetailUser] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState('overview'); // 'overview' | 'deposits' | 'calls' | 'chats' | 'vouchers' | 'reports'

  // Role Edit in Details Modal
  const [roleForm, setRoleForm] = useState({ role: 'user', is_host: false, vip_level: 0 });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (searchTerm = '') => {
    try {
      setLoading(true);
      const res = await api.getAdminUsers(searchTerm);
      if (res.success && res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleToggleBan = async (user) => {
    if (!confirm(`Bạn có chắc muốn ${user.is_banned ? 'mở khóa' : 'khóa'} tài khoản ${user.full_name}?`)) return;
    try {
      const res = await api.toggleBanUser(user.id);
      if (res.success) {
        fetchUsers(search);
      }
    } catch (err) {
      alert(err.message || 'Lỗi khóa tài khoản');
    }
  };

  const handleOpenDetails = async (user) => {
    setDetailUser(user);
    setDetailTab('overview');
    setRoleForm({ role: user.role || 'user', is_host: user.is_host || false, vip_level: user.vip_level || 0 });
    setNewPassword('');
    try {
      setDetailLoading(true);
      const res = await api.getAdminUserDetails(user.id);
      if (res.success) {
        setDetailData(res);
      }
    } catch (err) {
      alert('Không thể tải chi tiết người dùng: ' + err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!detailUser) return;
    try {
      setModalLoading(true);
      const res = await api.updateUserRole(detailUser.id, roleForm);
      if (res.success) {
        alert('Đã cập nhật phân quyền và VIP thành công!');
        fetchUsers(search);
      }
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật');
    } finally {
      setModalLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Mật khẩu tối thiểu 6 ký tự');
      return;
    }
    try {
      setModalLoading(true);
      const res = await api.resetUserPassword(detailUser.id, newPassword);
      if (res.success) {
        alert('Đã đổi mật khẩu tài khoản thành công!');
        setNewPassword('');
      }
    } catch (err) {
      alert(err.message || 'Lỗi đổi mật khẩu');
    } finally {
      setModalLoading(false);
    }
  };

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setModalLoading(true);
    try {
      const res = await api.adjustBalance(selectedUser.id, adjustData);
      if (res.success) {
        alert('Cập nhật số dư thành công!');
        setSelectedUser(null);
        fetchUsers(search);
      }
    } catch (err) {
      alert(err.message || 'Lỗi điều chỉnh số dư');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Quản Lý Toàn Diện Người Dùng</h2>
          <p className="text-xs text-gray-400">Xem hồ sơ chi tiết, lịch sử nạp rút, lịch sử gọi, tin nhắn, phân quyền và điều chỉnh ví</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
          />
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-[#161522] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-white/5 uppercase font-bold text-[10px] text-gray-400 border-b border-white/10">
              <tr>
                <th className="p-4">Người Dùng</th>
                <th className="p-4">Giới Tính / Tuổi</th>
                <th className="p-4">Số Dư Xu</th>
                <th className="p-4">Kim Cương</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4">Vai Trò / VIP</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">Đang tải danh sách người dùng...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">Không tìm thấy người dùng nào</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    
                    {/* User Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                            <span>{u.full_name}</span>
                            {u.is_verified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                            {u.vip_level > 0 && <span className="text-xs">👑 VIP {u.vip_level}</span>}
                          </div>
                          <span className="text-gray-400 text-[11px]">@{u.username} • {u.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Gender & Age */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.gender === 'female' ? 'bg-pink-500/20 text-pink-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {u.gender === 'female' ? '♀ Nữ' : '♂ Nam'}
                        </span>
                        <span className="text-gray-400">{u.age} tuổi</span>
                      </div>
                    </td>

                    {/* Coins */}
                    <td className="p-4 font-extrabold text-amber-300">
                      <div className="flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>{(u.coins || 0).toLocaleString('vi-VN')}</span>
                      </div>
                    </td>

                    {/* Diamonds */}
                    <td className="p-4 font-bold text-cyan-300">
                      <div className="flex items-center gap-1">
                        <Gem className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{(u.diamonds || 0).toLocaleString('vi-VN')}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {u.is_banned ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <Ban className="w-3 h-3" /> Đã Khóa
                        </span>
                      ) : u.is_online ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">Offline</span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-purple-600 text-white'
                            : u.is_host
                            ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white'
                            : 'bg-white/10 text-gray-300'
                        }`}>
                          {u.role === 'admin' ? 'Admin' : u.is_host ? 'Idol / Host' : 'User'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* View Full Profile */}
                        <button
                          onClick={() => handleOpenDetails(u)}
                          className="p-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 rounded-xl transition-all"
                          title="Xem hồ sơ chi tiết & lịch sử"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Adjust balance */}
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setAdjustData({ delta_coins: 100, delta_diamonds: 0, reason: 'Thưởng sự kiện' });
                          }}
                          className="p-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl transition-all"
                          title="Cộng/Trừ Xu & Kim Cương"
                        >
                          <Coins className="w-3.5 h-3.5" />
                        </button>

                        {/* Ban/Unban */}
                        <button
                          onClick={() => handleToggleBan(u)}
                          className={`p-1.5 rounded-xl border transition-all ${
                            u.is_banned
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
                          }`}
                          title={u.is_banned ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPREHENSIVE USER DETAILS MODAL */}
      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-[#161522] border border-white/10 rounded-3xl p-6 max-w-4xl w-full shadow-2xl space-y-5 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={detailUser.avatar}
                  alt={detailUser.full_name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{detailUser.full_name}</h3>
                    {detailUser.is_verified && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                    <span className="text-xs text-gray-400 font-mono">ID: #{detailUser.id}</span>
                  </div>
                  <p className="text-xs text-gray-400">@{detailUser.username} • {detailUser.email} • {detailUser.city || 'Việt Nam'}</p>
                </div>
              </div>

              <button
                onClick={() => setDetailUser(null)}
                className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subnav Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 custom-scrollbar text-xs font-bold">
              {[
                { id: 'overview', label: '👤 Hồ Sơ & Quyền Hạn' },
                { id: 'deposits', label: '💳 Nạp Tiền & Giao Dịch' },
                { id: 'calls', label: '📞 Lịch Sử Cuộc Gọi' },
                { id: 'chats', label: '💬 Hội Thoại Tin Nhắn' },
                { id: 'vouchers', label: '🎟️ Kho Voucher' },
                { id: 'reports', label: '🚨 Báo Cáo Vi Phạm' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDetailTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                    detailTab === tab.id
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30'
                      : 'text-gray-400 hover:text-white bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            {detailLoading ? (
              <div className="p-8 text-center text-gray-400">Đang tải dữ liệu hồ sơ...</div>
            ) : detailData && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                
                {/* 1. OVERVIEW & ROLE EDIT */}
                {detailTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    {/* Stats Box */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                      <h4 className="font-bold text-white text-sm">Thống Kê Hoạt Động</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2.5 rounded-xl bg-black/20">
                          <p className="text-gray-400">Số Dư Xu</p>
                          <p className="font-black text-amber-300 text-sm">{detailData.user.coins?.toLocaleString('vi-VN')} Xu</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/20">
                          <p className="text-gray-400">Kim Cương</p>
                          <p className="font-black text-cyan-300 text-sm">{detailData.user.diamonds?.toLocaleString('vi-VN')} 💎</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/20">
                          <p className="text-gray-400">Tổng Tiền Đã Nạp</p>
                          <p className="font-black text-emerald-400 text-sm">{detailData.stats?.total_deposited_money?.toLocaleString('vi-VN')} đ</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/20">
                          <p className="text-gray-400">Tổng Cuộc Gọi</p>
                          <p className="font-black text-purple-300 text-sm">{detailData.stats?.total_calls_made + detailData.stats?.total_calls_received} cuộc</p>
                        </div>
                      </div>
                    </div>

                    {/* Role & VIP Switcher */}
                    <form onSubmit={handleSaveRole} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                      <h4 className="font-bold text-white text-sm">Phân Quyền & Cấp VIP</h4>
                      
                      <div>
                        <label className="block text-gray-400 mb-1">Vai Trò:</label>
                        <select
                          value={roleForm.role}
                          onChange={(e) => setRoleForm({ ...roleForm, role: e.target.value })}
                          className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white focus:border-rose-500"
                        >
                          <option value="user">User Thường</option>
                          <option value="host">Host / Idol Nhận Call</option>
                          <option value="admin">Quản Trị Viên (Admin)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-gray-300 font-semibold">Tư cách Idol Nhận Cuộc Gọi:</label>
                        <input
                          type="checkbox"
                          checked={roleForm.is_host}
                          onChange={(e) => setRoleForm({ ...roleForm, is_host: e.target.checked })}
                          className="w-4 h-4 rounded text-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-400 mb-1">Cấp VIP (0 - 3):</label>
                        <select
                          value={roleForm.vip_level}
                          onChange={(e) => setRoleForm({ ...roleForm, vip_level: Number(e.target.value) })}
                          className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-white focus:border-rose-500"
                        >
                          <option value={0}>Không VIP (Level 0)</option>
                          <option value={1}>VIP Silver (Level 1)</option>
                          <option value={2}>VIP Gold (Level 2)</option>
                          <option value={3}>VIP Platinum (Level 3)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={modalLoading}
                        className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-md shadow-rose-600/30"
                      >
                        Lưu Thay Đổi
                      </button>
                    </form>

                    {/* Reset Password Form */}
                    <form onSubmit={handleResetPassword} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 md:col-span-2">
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                        <Key className="w-4 h-4 text-amber-400" />
                        Đặt Lại Mật Khẩu Cho Tài Khoản
                      </h4>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="flex-1 p-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-rose-500"
                        />
                        <button
                          type="submit"
                          disabled={modalLoading}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold whitespace-nowrap"
                        >
                          Đặt Lại Mật Khẩu
                        </button>
                      </div>
                    </form>

                  </div>
                )}

                {/* 2. DEPOSITS & TRANSACTIONS */}
                {detailTab === 'deposits' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-white text-sm">Lịch Sử Nạp Tiền VietQR ({detailData.deposits?.length || 0})</h4>
                    {detailData.deposits?.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Chưa có giao dịch nạp tiền</p>
                    ) : (
                      <div className="space-y-2">
                        {detailData.deposits?.map(d => (
                          <div key={d.id} className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between text-xs">
                            <div>
                              <span className="font-mono text-cyan-300 font-bold">{d.transaction_code}</span>
                              <p className="text-gray-400 text-[11px]">{new Date(d.created_at).toLocaleString('vi-VN')}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-emerald-400">+{d.money_amount?.toLocaleString('vi-VN')} đ</p>
                              <span className="text-amber-300">+{d.total_coins} Xu ({d.status})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. CALL LOGS */}
                {detailTab === 'calls' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-white text-sm">Lịch Sử Cuộc Gọi Video ({detailData.call_logs?.length || 0})</h4>
                    {detailData.call_logs?.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Chưa có lịch sử cuộc gọi</p>
                    ) : (
                      <div className="space-y-2">
                        {detailData.call_logs?.map(c => (
                          <div key={c.id} className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <PhoneCall className="w-4 h-4 text-purple-400" />
                              <div>
                                <p className="font-bold text-white">{c.is_caller ? 'Gọi cho:' : 'Nhận từ:'} {c.partner_name}</p>
                                <p className="text-gray-400 text-[10px]">{new Date(c.created_at).toLocaleString('vi-VN')} • {c.duration_seconds}s</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-amber-300 font-bold">-{c.coins_spent} Xu</span>
                              {c.diamonds_earned > 0 && <span className="text-cyan-300 font-bold ml-2">+{c.diamonds_earned} 💎</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. CHAT CONVERSATIONS */}
                {detailTab === 'chats' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-white text-sm">Các Cuộc Trò Chuyện ({detailData.conversations?.length || 0})</h4>
                    {detailData.conversations?.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Chưa có cuộc trò chuyện nào</p>
                    ) : (
                      <div className="space-y-2">
                        {detailData.conversations?.map(conv => (
                          <div key={conv.id} className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <img src={conv.partner_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} className="w-7 h-7 rounded-full object-cover" />
                              <div>
                                <p className="font-bold text-white">{conv.partner_name}</p>
                                <p className="text-gray-400 text-[10px] truncate max-w-xs">{conv.last_message || 'Chưa có tin nhắn'}</p>
                              </div>
                            </div>
                            <span className="text-gray-500 text-[10px]">{new Date(conv.updated_at).toLocaleDateString('vi-VN')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. VOUCHERS */}
                {detailTab === 'vouchers' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-white text-sm">Kho Voucher Đang Sở Hữu ({detailData.vouchers?.length || 0})</h4>
                    {detailData.vouchers?.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Người dùng chưa sở hữu voucher nào</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {detailData.vouchers?.map(v => (
                          <div key={v.id} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-rose-300">{v.title}</p>
                              <p className="text-gray-400 text-[10px]">{v.description}</p>
                            </div>
                            <span className="px-2.5 py-1 bg-rose-500 text-white font-black rounded-lg text-xs">
                              x{v.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. REPORTS */}
                {detailTab === 'reports' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-white text-sm">Báo Cáo Vi Phạm ({detailData.reports_against?.length || 0})</h4>
                    {detailData.reports_against?.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Tài khoản trong sạch, không có báo cáo vi phạm nào</p>
                    ) : (
                      <div className="space-y-2">
                        {detailData.reports_against?.map(r => (
                          <div key={r.id} className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-rose-300">Lý do: {r.reason}</p>
                              <p className="text-gray-400 text-[10px]">{r.description || 'Không có mô tả thêm'}</p>
                            </div>
                            <span className="text-gray-400 text-[10px]">{new Date(r.created_at).toLocaleString('vi-VN')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}

      {/* BALANCE ADJUST MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#161522] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Điều Chỉnh Số Dư</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Tài khoản: <span className="text-white font-bold">{selectedUser.full_name}</span> (@{selectedUser.username})
            </p>

            <form onSubmit={handleAdjustBalance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Thay đổi Xu (+/-):
                </label>
                <input
                  type="number"
                  value={adjustData.delta_coins}
                  onChange={(e) => setAdjustData({ ...adjustData, delta_coins: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Thay đổi Kim Cương (+/-):
                </label>
                <input
                  type="number"
                  value={adjustData.delta_diamonds}
                  onChange={(e) => setAdjustData({ ...adjustData, delta_diamonds: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Lý do điều chỉnh (Kiểm toán):
                </label>
                <input
                  type="text"
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                  placeholder="Ví dụ: Thưởng sự kiện, Đền bù lỗi..."
                  className="w-full p-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/30 transition-all"
                >
                  {modalLoading ? 'Đang lưu...' : 'Xác Nhận Cập Nhật'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
