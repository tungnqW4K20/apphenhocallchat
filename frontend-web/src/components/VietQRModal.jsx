import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Coins,
  QrCode,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export const VietQRModal = ({ isOpen, onClose, depositData, onDepositSuccess }) => {
  const [copiedField, setCopiedField] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen || !depositData) return null;

  const { deposit, qr_url, payment_instructions } = depositData;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleConfirmTransfer = async () => {
    setConfirming(true);
    try {
      await api.confirmDepositSent(deposit.id);
      setConfirmed(true);
    } catch (err) {
      alert('Lỗi ghi nhận: ' + err.message);
    } finally {
      setConfirming(false);
    }
  };

  const handleSimulateQuickPay = async () => {
    setConfirming(true);
    try {
      const res = await api.depositCoins(deposit.package_id, 'Mô phỏng Test VietQR');
      if (res.success) {
        if (onDepositSuccess) onDepositSuccess(res.new_coins);
        alert(`Mô phỏng thành công! Đã cộng +${deposit.total_coins} Xu vào ví.`);
        onClose();
      }
    } catch (err) {
      alert('Lỗi mô phỏng: ' + err.message);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#161522] border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Thanh Toán Chuyển Khoản VietQR</h3>
              <p className="text-xs text-gray-400">Quét mã QR bằng mọi App Ngân Hàng hoặc Momo</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmed ? (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">Đã Ghi Nhận Chuyển Khoản!</h4>
            <p className="text-xs text-gray-300">
              Mã giao dịch <span className="font-mono text-cyan-300 font-bold">{deposit.transaction_code}</span> đang được quản trị viên kiểm tra đối soát. Xu sẽ được tự động cộng vào tài khoản của bạn ngay sau khi nhận được tiền!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
            >
              Đã Hiểu & Đóng
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* QR Image Box */}
            <div className="p-4 bg-white rounded-2xl flex flex-col items-center justify-center shadow-inner">
              <img
                src={qr_url}
                alt="VietQR Payment"
                className="w-56 h-auto rounded-xl object-contain shadow"
              />
              <p className="text-[11px] text-gray-600 font-bold mt-2">Mở App Ngân Hàng để Quét Mã Tự Động</p>
            </div>

            {/* Transfer Instructions & Copy details */}
            <div className="space-y-2 text-xs">
              
              {/* Bank & Account */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-gray-400 text-[10px]">Ngân Hàng:</span>
                  <p className="font-bold text-white">{payment_instructions.bank_name}</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 text-[10px]">Số Tài Khoản:</span>
                  <div className="flex items-center gap-1.5 justify-end">
                    <p className="font-mono font-extrabold text-cyan-300">{payment_instructions.account_number}</p>
                    <button
                      onClick={() => handleCopy(payment_instructions.account_number, 'stk')}
                      className="p-1 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300"
                      title="Copy STK"
                    >
                      {copiedField === 'stk' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Holder */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <span className="text-gray-400">Chủ Tài Khoản:</span>
                <span className="font-bold text-white uppercase">{payment_instructions.account_holder}</span>
              </div>

              {/* Amount */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <span className="text-gray-400">Số Tiền Chuyển:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-emerald-400 text-sm">{payment_instructions.amount?.toLocaleString('vi-VN')} VNĐ</span>
                  <button
                    onClick={() => handleCopy(payment_instructions.amount, 'amount')}
                    className="p-1 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300"
                    title="Copy số tiền"
                  >
                    {copiedField === 'amount' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Transfer Content (Crucial) */}
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-rose-300 font-bold text-[11px]">Nội Dung Chuyển Khoản:</span>
                  <p className="font-mono font-black text-white text-sm tracking-wider mt-0.5">{payment_instructions.transfer_content}</p>
                </div>
                <button
                  onClick={() => handleCopy(payment_instructions.transfer_content, 'content')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow transition-all"
                >
                  {copiedField === 'content' ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Đã Copy</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Mã</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Note */}
            <p className="text-[10px] text-gray-400 italic text-center">
              ⚠️ Lưu ý: Vui lòng nhập đúng chính xác nội dung chuyển khoản để hệ thống đối soát và cộng Xu tức thì.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={handleConfirmTransfer}
                disabled={confirming}
                className="w-full sm:flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tôi Đã Chuyển Khoản Xong</span>
              </button>

              <button
                onClick={handleSimulateQuickPay}
                disabled={confirming}
                className="w-full sm:w-auto px-4 py-3 bg-white/10 hover:bg-white/15 text-cyan-300 border border-cyan-500/30 rounded-2xl font-bold text-xs transition-all whitespace-nowrap"
                title="Mô phỏng thanh toán thành công để test ngay lập tức"
              >
                ⚡ Test Nạp Ngay (Demo)
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
