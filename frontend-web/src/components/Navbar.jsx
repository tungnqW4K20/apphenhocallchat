import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Flame, 
  Video, 
  Compass, 
  MessageCircle, 
  Users,
  Coins, 
  Gem, 
  Crown, 
  ShieldCheck, 
  User, 
  LogOut, 
  Settings, 
  SlidersHorizontal,
  Plus
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenShop, onOpenAuth, onOpenCheckin }) => {
  const { currentUser, logout, isAdminMode, setIsAdminMode } = useAuth();
  const { unreadCount } = useSocket();

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0f0e17]/90 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('swipe')}
            className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl tinder-gradient flex items-center justify-center shadow-md shadow-rose-500/25 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white animate-pulse-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-xl font-black tracking-tight bg-gradient-to-r from-rose-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  AyarFlame
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Live 1v1
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium -mt-0.5 hidden lg:block">Dating & Random Video Call</p>
            </div>
          </div>

          {/* Navigation Tabs (User Portal - Responsive for Desktop & Tablet) */}
          {!isAdminMode && (
            <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
              <button
                onClick={() => setActiveTab('swipe')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'swipe'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Quẹt Thẻ"
              >
                <Flame className="w-4 h-4 shrink-0" />
                <span className="hidden xl:inline">Quẹt Thẻ</span>
              </button>

              <button
                onClick={() => setActiveTab('random-match')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 relative ${
                  activeTab === 'random-match'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Video Radar"
              >
                <Video className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
                <span className="hidden xl:inline">Video Radar</span>
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
              </button>

              <button
                onClick={() => setActiveTab('explore')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'explore'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Khám Phá"
              >
                <Compass className="w-4 h-4 shrink-0" />
                <span className="hidden xl:inline">Khám Phá</span>
              </button>

              <button
                onClick={() => setActiveTab('friends')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'friends'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Bạn Bè"
              >
                <Users className="w-4 h-4 shrink-0" />
                <span className="hidden xl:inline">Bạn Bè</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 relative ${
                  activeTab === 'chat'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Trò Chuyện"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span className="hidden xl:inline">Trò Chuyện</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </nav>
          )}

          {/* Right Area: Balance & User Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {currentUser ? (
              <>
                {/* Daily Check-in Button */}
                <button
                  onClick={onOpenCheckin}
                  className="flex items-center gap-1 bg-gradient-to-r from-rose-500/20 to-pink-500/15 border border-rose-500/30 hover:border-rose-400 px-2 sm:px-2.5 py-1 rounded-full cursor-pointer transition-all hover:scale-105 select-none shrink-0"
                  title="Điểm danh 7 ngày nhận quà & kho voucher"
                >
                  <span className="text-xs">🎁</span>
                  <span className="text-[11px] font-bold text-rose-300 hidden sm:inline">Điểm Danh</span>
                </button>

                {/* Coin Balance Pill */}
                <div 
                  onClick={onOpenShop}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30 hover:border-amber-400 px-2 sm:px-3 py-1 rounded-full cursor-pointer transition-all hover:scale-105 select-none shrink-0"
                  title="Số dư Xu (Nhấp để nạp thêm)"
                >
                  <span className="text-xs">🪙</span>
                  <span className="font-extrabold text-xs sm:text-sm text-amber-300">
                    {(currentUser.coins || 0).toLocaleString('vi-VN')}
                  </span>
                  <span className="text-[10px] text-amber-200/70 font-medium hidden sm:inline">Xu</span>
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-400/30 flex items-center justify-center text-amber-300">
                    <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </div>
                </div>

                {/* Diamond Balance (For Host/Gifts) */}
                <div 
                  onClick={onOpenShop}
                  className="hidden sm:flex items-center gap-1.5 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 rounded-full cursor-pointer hover:border-cyan-400 transition-all select-none shrink-0"
                  title="Kim Cương nhận được (Rút tiền mặt)"
                >
                  <span className="text-xs">💎</span>
                  <span className="font-bold text-xs text-cyan-300">
                    {(currentUser.diamonds || 0).toLocaleString('vi-VN')}
                  </span>
                </div>

                {/* Admin Mode Switcher if Admin */}
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => setIsAdminMode(!isAdminMode)}
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                      isAdminMode
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-white/10 text-purple-300 hover:bg-white/15'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isAdminMode ? 'App User' : 'Admin'}</span>
                  </button>
                )}

                {/* User Avatar Menu */}
                <div 
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-1.5 p-0.5 sm:p-1 sm:pl-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full cursor-pointer transition-all shrink-0"
                >
                  <span className="text-xs font-semibold text-gray-200 max-w-[140px] truncate hidden md:inline">
                    {currentUser.full_name || currentUser.username}
                  </span>
                  <div className="relative shrink-0 w-8 h-8">
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={currentUser.full_name}
                      className="w-8 h-8 rounded-full object-cover aspect-square ring-2 ring-rose-500 shrink-0"
                    />
                    {currentUser.vip_level > 0 && (
                      <span className="absolute -bottom-1 -right-1 text-[10px] leading-none">👑</span>
                    )}
                  </div>
                </div>

                {/* Logout button (Always visible on mobile & desktop) */}
                <button
                  onClick={logout}
                  className="flex p-1.5 text-gray-400 hover:text-rose-400 hover:bg-white/10 rounded-full transition-all shrink-0"
                  title="Đăng xuất tài khoản"
                >
                  <LogOut className="w-4 h-4 text-gray-300 hover:text-rose-400" />
                </button>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30 hover:scale-105 transition-all shrink-0"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Đăng Nhập</span>
              </button>
            )}
          </div>
        </div>
      </header>

    {/* Standalone Mobile Bottom Navigation Bar (Fixed at the bottom of viewport) */}
    {!isAdminMode && (
      <nav 
        id="mobile-bottom-navbar" 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0f0e17]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-2 flex items-center justify-around shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.5)]"
      >
        <button
          onClick={() => setActiveTab('swipe')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'swipe' 
              ? 'text-rose-500 font-extrabold scale-105' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Flame className={`w-5 h-5 ${activeTab === 'swipe' ? 'fill-rose-500 text-rose-500 animate-pulse' : ''}`} />
          <span className="text-[10px]">Quẹt Thẻ</span>
        </button>

        <button
          onClick={() => setActiveTab('random-match')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all relative ${
            activeTab === 'random-match' 
              ? 'text-purple-400 font-extrabold scale-105' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Video className="w-5 h-5 text-cyan-400" />
          <span className="text-[10px]">Radar Call</span>
          <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        </button>

        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'explore' 
              ? 'text-rose-500 font-extrabold scale-105' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Khám Phá</span>
        </button>

        <button
          onClick={() => setActiveTab('friends')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'friends' 
              ? 'text-rose-500 font-extrabold scale-105' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Bạn Bè</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all relative ${
            activeTab === 'chat' 
              ? 'text-rose-500 font-extrabold scale-105' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px]">Chat</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 right-1 px-1.5 py-0.2 text-[9px] font-extrabold rounded-full bg-rose-500 text-white shadow-sm shadow-rose-500">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            activeTab === 'profile' 
              ? 'text-rose-500 font-extrabold scale-105' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Hồ Sơ</span>
        </button>
      </nav>
    )}
  </>
  );
};
