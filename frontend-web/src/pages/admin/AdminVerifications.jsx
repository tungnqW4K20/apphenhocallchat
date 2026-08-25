import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ShieldCheck, Check, X, Clock, ExternalLink } from 'lucide-react';

export const AdminVerifications = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await api.getVerifications();
      if (res.success && res.verifications) {
        setVerifications(res.verifications);
      }
    } catch (err) {
      console.error('Failed to load verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    const adminNote = status === 'approved' ? 'Ảnh chân dung hợp lệ' : 'Ảnh không rõ mặt hoặc không trùng khớp';
    try {
      const res = await api.reviewVerification(id, status, adminNote);
      if (res.success) {
        fetchList();
      }
    } catch (err) {
      alert(err.message || 'Lỗi xét duyệt');
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-sky-400" />
          <span>Xét Duyệt Xác Thực Tích Xanh (KYC)</span>
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">Kiểm tra ảnh selfie đối chiếu với ảnh đại diện của người dùng</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-[#161522] rounded-3xl border border-white/10">
          Đang tải danh sách yêu cầu xác thực...
        </div>
      ) : verifications.length === 0 ? (
        <div className="p-12 text-center bg-[#161522] rounded-3xl border border-white/10 space-y-2">
          <ShieldCheck className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="font-bold text-white text-base">Không có yêu cầu xác thực nào đang chờ</h3>
          <p className="text-xs text-gray-400">Tất cả yêu cầu đã được xử lý xong!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {verifications.map((v) => (
            <div
              key={v.id}
              className="p-5 rounded-3xl bg-[#161522] border border-white/10 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                  <img
                    src={v.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-rose-500"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{v.full_name}</h4>
                    <span className="text-xs text-gray-400">@{v.username}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-300">Ảnh selfie xác thực:</span>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-white/10">
                    <img
                      src={v.selfie_photo}
                      alt="Selfie"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>Trạng thái:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                    v.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : v.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {v.status === 'approved' ? 'Đã Duyệt' : v.status === 'rejected' ? 'Từ Chối' : 'Chờ Duyệt'}
                  </span>
                </div>
              </div>

              {v.status === 'pending' && (
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
                  <button
                    onClick={() => handleReview(v.id, 'rejected')}
                    className="flex-1 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                  >
                    <X className="w-4 h-4" />
                    <span>Từ Chối</span>
                  </button>

                  <button
                    onClick={() => handleReview(v.id, 'approved')}
                    className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Duyệt Cấp Tích Xanh</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
