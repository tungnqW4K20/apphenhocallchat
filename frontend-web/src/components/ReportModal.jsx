import React, { useState } from 'react';
import { api } from '../services/api';
import { ShieldAlert, X, Check } from 'lucide-react';

export const ReportModal = ({ isOpen, onClose, targetUser }) => {
  const [reason, setReason] = useState('Nội dung không phù hợp / Vi phạm thuần phong mỹ tục');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !targetUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.reportUser({
        reported_id: targetUser.id,
        reason,
        details
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Lỗi gửi báo cáo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#181724] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
            <ShieldAlert className="w-5 h-5" />
            <span>Báo Cáo Người Dùng</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">Đã Gửi Báo Cáo!</h4>
            <p className="text-xs text-gray-400">Đội ngũ quản trị viên sẽ kiểm duyệt và xử lý tài khoản vi phạm.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-300 text-xs font-semibold">
                {error}
              </div>
            )}

            <p className="text-xs text-gray-300">
              Bạn đang báo cáo tài khoản: <strong className="text-white">{targetUser.full_name}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Lý do báo cáo</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-[#201f2d] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Nội dung không phù hợp / Vi phạm thuần phong mỹ tục">Nội dung không phù hợp / Vi phạm thuần phong mỹ tục</option>
                <option value="Tài khoản giả mạo hoặc sử dụng ảnh người khác">Tài khoản giả mạo hoặc sử dụng ảnh người khác</option>
                <option value="Hành vi quấy rối, xúc phạm trong cuộc gọi/chat">Hành vi quấy rối, xúc phạm trong cuộc gọi/chat</option>
                <option value="Spam, lừa đảo hoặc quảng cáo thương mại">Spam, lừa đảo hoặc quảng cáo thương mại</option>
                <option value="Khác">Lý do khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Chi tiết bổ sung (tùy chọn)</label>
              <textarea
                rows={3}
                placeholder="Mô tả cụ thể hành vi vi phạm..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/30"
              >
                {loading ? 'Đang gửi...' : 'Gửi Báo Cáo'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
