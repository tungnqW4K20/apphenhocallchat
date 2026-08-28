import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, X, Lock, Mail, User, Sparkles, ShieldCheck } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    loginKey: '',
    password: '',
    username: '',
    email: '',
    full_name: '',
    gender: 'male',
    age: 22,
    city: 'Hà Nội'
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        await register({
          username: (formData.username || '').trim(),
          email: (formData.email || '').trim().toLowerCase(),
          password: formData.password,
          full_name: (formData.full_name || '').trim(),
          gender: formData.gender || 'male',
          age: Number(formData.age) || 22,
          city: formData.city || 'Hà Nội'
        });
      } else {
        await login((formData.loginKey || '').trim(), formData.password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Thao tác thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#16161e] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Decorative Background Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl tinder-gradient mb-3 shadow-lg shadow-rose-500/30">
            <Flame className="w-8 h-8 text-white fill-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            {isRegister ? 'Tạo Tài Khoản Mới' : 'Chào Mừng Trở Lại'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {isRegister ? 'Nhận ngay 200 Xu trải nghiệm kết nối & video call' : 'Đăng nhập để tiếp tục hẹn hò và gọi video ngẫu nhiên'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Tabs Switcher */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-5 border border-white/10">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              !isRegister ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              isRegister ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Họ và Tên (Tên hiển thị) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    required
                    placeholder="VD: Châu Tinh Trì"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Giới tính của bạn <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'male' })}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                      formData.gender === 'male'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 border-cyan-400 text-white shadow-lg'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>👦 Nam (Male)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'female' })}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                      formData.gender === 'female'
                        ? 'bg-gradient-to-r from-rose-600 to-pink-600 border-pink-400 text-white shadow-lg'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>👧 Nữ (Female)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Tên đăng nhập <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    placeholder="user123"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Mật khẩu <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Tài khoản hoặc Email</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="loginKey"
                    required
                    placeholder="Nhập username hoặc email của bạn"
                    value={formData.loginKey}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 via-pink-600 to-orange-500 text-white shadow-lg shadow-rose-500/30 hover:opacity-95 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : isRegister ? 'Đăng Ký & Nhận 200 Xu' : 'Đăng Nhập'}
          </button>
        </form>

      </div>
    </div>
  );
};
