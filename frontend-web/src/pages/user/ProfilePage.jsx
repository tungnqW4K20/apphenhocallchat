import React, { useState, useRef } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  Camera, 
  ShieldCheck, 
  Video, 
  Coins, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Save,
  Plus
} from 'lucide-react';

export const ProfilePage = ({ onOpenShop }) => {
  const { currentUser, updateProfileState, fetchCurrentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: currentUser?.full_name || '',
    bio: currentUser?.bio || '',
    job: currentUser?.job || '',
    company_or_school: currentUser?.company_or_school || '',
    city: currentUser?.city || 'Hà Nội',
    age: currentUser?.age || 22,
    gender: currentUser?.gender || 'female',
    is_host: currentUser?.is_host || false,
    call_rate_per_min: currentUser?.call_rate_per_min || 20,
    interestsText: (currentUser?.interests || ['Du lịch', 'Cà phê', 'Âm nhạc']).join(', ')
  });

  const [photos, setPhotos] = useState(currentUser?.photos || [currentUser?.avatar]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [kycSelfie, setKycSelfie] = useState('');
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);

  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setMsg({ text: '', type: '' });

    try {
      const interestsArray = formData.interestsText
        .split(',')
        .map(i => i.trim())
        .filter(Boolean);

      const res = await api.updateProfile({
        full_name: formData.full_name,
        bio: formData.bio,
        job: formData.job,
        company_or_school: formData.company_or_school,
        city: formData.city,
        age: Number(formData.age),
        gender: formData.gender,
        is_host: formData.is_host,
        call_rate_per_min: Number(formData.call_rate_per_min),
        interests: interestsArray
      });

      if (res.success) {
        updateProfileState(res.user);
        setMsg({ text: 'Cập nhật thông tin hồ sơ thành công!', type: 'success' });
        setTimeout(() => setMsg({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      setMsg({ text: err.message || 'Lỗi cập nhật', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Upload to free cloud storage
      const freeUpload = await uploadImageFree(file);
      const photoUrl = freeUpload.success ? freeUpload.url : null;

      // 2. Also register photo into user's profile
      const data = new FormData();
      data.append('photo', file);
      data.append('is_primary', photos.length === 0 ? 'true' : 'false');
      if (photoUrl) data.append('photo_url', photoUrl);

      const res = await api.uploadPhoto(data);
      if (res.success) {
        setPhotos(res.photos);
        await fetchCurrentUser();
      } else if (photoUrl) {
        setPhotos(prev => [...prev, photoUrl]);
      }
    } catch (err) {
      alert(err.message || 'Lỗi tải ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleRequestKyc = async () => {
    if (!kycSelfie) {
      alert('Vui lòng dán link ảnh selfie chân dung để xác thực!');
      return;
    }
    try {
      await api.requestVerification({ selfie_photo: kycSelfie });
      alert('Đã gửi hồ sơ xác thực tích xanh! Admin sẽ duyệt trong 24h.');
      setIsKycModalOpen(false);
    } catch (err) {
      alert(err.message || 'Lỗi gửi xác thực');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/25">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{currentUser?.full_name}</h1>
              {currentUser?.is_verified && (
                <CheckCircle2 className="w-5 h-5 text-sky-400 fill-sky-400/20" />
              )}
            </div>
            <p className="text-xs text-gray-400 font-medium">Quản lý album ảnh, thông tin cá nhân và cài đặt kiếm tiền</p>
          </div>
        </div>

        <button
          onClick={onOpenShop}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 font-bold text-xs transition-all"
        >
          <Coins className="w-4 h-4" />
          <span>{currentUser?.coins || 0} Xu</span>
        </button>
      </div>

      {msg.text && (
        <div className={`mb-6 p-3.5 rounded-2xl text-xs font-bold ${
          msg.type === 'success' ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
        }`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: PHOTO ALBUM */}
        <div className="md:col-span-1 space-y-4">
          <div className="p-4 rounded-3xl bg-[#161522] border border-white/10">
            <h3 className="font-extrabold text-sm text-white mb-3 flex items-center justify-between">
              <span>Album Ảnh ({photos.length})</span>
              <span className="text-[11px] text-gray-400 font-normal">Tối đa 6 ảnh</span>
            </h3>

            {/* Photos Grid */}
            <div className="grid grid-cols-2 gap-2">
              {photos.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-white/10">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-rose-400">
                      Avatar
                    </span>
                  )}
                </div>
              ))}

              {/* Upload Button */}
              {photos.length < 6 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-2xl border-2 border-dashed border-white/20 hover:border-rose-500 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex flex-col items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-[10px] font-bold">{uploading ? 'Đang tải...' : 'Thêm Ảnh'}</span>
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadPhoto}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* KYC Verification Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-b from-sky-500/10 to-transparent border border-sky-500/30">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <h4 className="font-bold text-white text-sm">Xác Thực Tích Xanh</h4>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed mb-3">
              {currentUser?.is_verified
                ? 'Tài khoản của bạn đã được xác minh danh tính chính chủ ✨'
                : 'Nhận tích xanh chính chủ để tăng 300% tỉ lệ ghép đôi và tạo sự tin tưởng.'}
            </p>
            {!currentUser?.is_verified && (
              <button
                onClick={() => setIsKycModalOpen(true)}
                className="w-full py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white shadow transition-all"
              >
                Gửi Hồ Sơ Xác Thực
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: EDIT PROFILE FORM */}
        <div className="md:col-span-2 space-y-5">
          
          <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-[#161522] border border-white/10 space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-white/10 pb-3">
              Thông Tin Hồ Sơ Hẹn Hò
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Họ và Tên</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Tuổi</label>
                <input
                  type="number"
                  name="age"
                  min="18"
                  max="70"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Thành phố</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Giới thiệu bản thân (Bio)</label>
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Chia sẻ đôi nét về bạn..."
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Nghề nghiệp</label>
                <input
                  type="text"
                  name="job"
                  value={formData.job}
                  onChange={handleInputChange}
                  placeholder="VD: UI Designer"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Trường học / Công ty</label>
                <input
                  type="text"
                  name="company_or_school"
                  value={formData.company_or_school}
                  onChange={handleInputChange}
                  placeholder="VD: ĐH Quốc Gia"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Sở thích & Tag (cách nhau bởi dấu phẩy)
              </label>
              <input
                type="text"
                name="interestsText"
                value={formData.interestsText}
                onChange={handleInputChange}
                placeholder="Du lịch, Cà phê, Nấu ăn, Thú cưng..."
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Host Livestream / Video Call Monetization Mode */}
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-purple-300 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-cyan-300" />
                    <span>Chế Độ Idol / Host Nhận Cuộc Gọi Kiếm Tiền</span>
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Cho phép người khác gọi video trực tiếp và nhận Kim Cương theo phút
                  </p>
                </div>
                <input
                  type="checkbox"
                  name="is_host"
                  checked={formData.is_host}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-purple-500 cursor-pointer"
                />
              </div>

              {formData.is_host && (
                <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between">
                  <span className="text-xs text-gray-300 font-semibold">Giá cước mỗi phút:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      name="call_rate_per_min"
                      min="10"
                      max="100"
                      value={formData.call_rate_per_min}
                      onChange={handleInputChange}
                      className="w-16 px-2 py-1 bg-white/10 border border-white/10 rounded-lg text-xs text-white text-center font-bold"
                    />
                    <span className="text-xs text-amber-300 font-bold">Xu/phút</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Đang lưu...' : 'Lưu Thay Đổi Hồ Sơ'}</span>
            </button>
          </form>

        </div>

      </div>

      {/* KYC Modal */}
      {isKycModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#181724] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="font-extrabold text-base text-white mb-2">Yêu Cầu Tích Xanh Xác Minh</h3>
            <p className="text-xs text-gray-400 mb-4">Dán đường dẫn ảnh selfie khuôn mặt của bạn để Admin duyệt cấp tích xanh:</p>
            <input
              type="text"
              placeholder="https://images.unsplash.com/photo-..."
              value={kycSelfie}
              onChange={(e) => setKycSelfie(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white mb-4 focus:outline-none focus:border-sky-400"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setIsKycModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={handleRequestKyc}
                className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs"
              >
                Gửi Duyệt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
