import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ShieldAlert, Check, X, Ban, User } from 'lucide-react';

export const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.getReports();
      if (res.success && res.reports) {
        setReports(res.reports);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.updateReportStatus(id, status);
      if (res.success) {
        fetchReports();
      }
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật');
    }
  };

  const handleBanReported = async (reportedId) => {
    try {
      const res = await api.toggleBanUser(reportedId);
      if (res.success) {
        alert(res.message);
        fetchReports();
      }
    } catch (err) {
      alert(err.message || 'Lỗi khóa');
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-rose-500" />
          <span>Báo Cáo & Xử Lý Vi Phạm</span>
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">Danh sách các khiếu nại, quấy rối và vi phạm tiêu chuẩn cộng đồng</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-[#161522] rounded-3xl border border-white/10">
          Đang tải danh sách báo cáo...
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center bg-[#161522] rounded-3xl border border-white/10 space-y-2">
          <ShieldAlert className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-white text-base">Cộng đồng an toàn</h3>
          <p className="text-xs text-gray-400">Không có báo cáo vi phạm nào chưa xử lý.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-3xl bg-[#161522] border border-white/10 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {r.reason}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {new Date(r.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">Người báo cáo: </span>
                    <strong className="text-gray-200">{r.reporter_name || `User #${r.reporter_id}`}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">Người bị tố cáo: </span>
                    <strong className="text-rose-400">{r.reported_name || `User #${r.reported_id}`}</strong>
                    {r.is_banned && <span className="ml-1 text-[10px] text-red-500 font-bold">(Đã bị khóa)</span>}
                  </div>
                </div>

                {r.details && (
                  <p className="text-xs text-gray-300 bg-white/5 p-2.5 rounded-xl border border-white/5">
                    "{r.details}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={() => handleBanReported(r.reported_id)}
                  className="px-3 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1 shadow transition-all"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Khóa Người Vi Phạm</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus(r.id, 'resolved')}
                  className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-1 shadow transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã Xử Lý</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
