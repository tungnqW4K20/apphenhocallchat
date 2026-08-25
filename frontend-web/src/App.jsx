import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { WebRTCProvider, useWebRTC } from './context/WebRTCContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { CoinShopModal } from './components/CoinShopModal';
import { VideoCallModal } from './components/VideoCallModal';
import { IncomingCallNotification } from './components/IncomingCallNotification';
import { UserProfileModal } from './components/UserProfileModal';
import { GiftDrawer } from './components/GiftDrawer';
import { ReportModal } from './components/ReportModal';
import { DailyCheckinModal } from './components/DailyCheckinModal';
import { CallBusySuggestionsModal } from './components/CallBusySuggestionsModal';

// User Pages
import { DiscoverPage } from './pages/user/DiscoverPage';
import { RandomMatchPage } from './pages/user/RandomMatchPage';
import { ExplorePage } from './pages/user/ExplorePage';
import { FriendsPage } from './pages/user/FriendsPage';
import { ChatPage } from './pages/user/ChatPage';
import { ProfilePage } from './pages/user/ProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminDeposits } from './pages/admin/AdminDeposits';
import { AdminWithdrawals } from './pages/admin/AdminWithdrawals';
import { AdminVerifications } from './pages/admin/AdminVerifications';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminGifts } from './pages/admin/AdminGifts';
import { AdminSettings } from './pages/admin/AdminSettings';

function AppContent() {
  const { currentUser, loading, isAdminMode, setIsAdminMode } = useAuth();
  const { busyCallData, setBusyCallData, startDirectCall } = useWebRTC();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('swipe'); // 'swipe' | 'random-match' | 'explore' | 'friends' | 'chat' | 'profile'
  const [adminTab, setAdminTab] = useState('admin-dashboard');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const [selectedGiftUser, setSelectedGiftUser] = useState(null);
  const [selectedReportUser, setSelectedReportUser] = useState(null);
  const [chatInitialPartner, setChatInitialPartner] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0a10] flex flex-col items-center justify-center text-white">
        <div className="w-14 h-14 rounded-2xl tinder-gradient flex items-center justify-center animate-bounce shadow-2xl shadow-rose-500/50 mb-4">
          <span className="text-2xl">🔥</span>
        </div>
        <h2 className="text-xl font-black tracking-tight bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
          AyarFlame Live
        </h2>
        <p className="text-xs text-gray-500 mt-1">Đang khởi tạo kết nối...</p>
      </div>
    );
  }

  const handleOpenChatWith = (partner) => {
    setChatInitialPartner(partner);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-[#0b0a10] text-gray-100 flex flex-col selection:bg-rose-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCheckin={() => setIsCheckinOpen(true)}
      />

      {/* Main Content Area */}
      <main className={`flex-1 ${activeTab === 'chat' ? 'pb-14 md:pb-6' : 'pb-24 md:pb-6'}`}>
        
        {/* ADMIN MODE */}
        {isAdminMode && currentUser?.role === 'admin' ? (
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
            
            {/* Admin Subnav */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-white/10 custom-scrollbar text-xs">
              {[
                { id: 'admin-dashboard', label: '📊 Tổng Quan Thống Kê' },
                { id: 'admin-deposits', label: '💳 Duyệt Nạp VietQR' },
                { id: 'admin-withdrawals', label: '💎 Duyệt Rút Tiền Idol' },
                { id: 'admin-users', label: '👥 Quản Lý Người Dùng' },
                { id: 'admin-verifications', label: '🛡️ Duyệt Tích Xanh (KYC)' },
                { id: 'admin-reports', label: '🚨 Báo Cáo Vi Phạm' },
                { id: 'admin-gifts', label: '🎁 Kho Quà Tặng 3D' },
                { id: 'admin-settings', label: '⚙️ Cấu Hình Hệ Thống' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`px-4 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all ${
                    adminTab === tab.id
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Admin Tab View */}
            {adminTab === 'admin-dashboard' && <AdminDashboard onNavigate={(t) => setAdminTab(t)} />}
            {adminTab === 'admin-deposits' && <AdminDeposits />}
            {adminTab === 'admin-withdrawals' && <AdminWithdrawals />}
            {adminTab === 'admin-users' && <AdminUsers />}
            {adminTab === 'admin-verifications' && <AdminVerifications />}
            {adminTab === 'admin-reports' && <AdminReports />}
            {adminTab === 'admin-gifts' && <AdminGifts />}
            {adminTab === 'admin-settings' && <AdminSettings />}

          </div>
        ) : (
          /* USER MODE */
          <>
            {activeTab === 'swipe' && (
              <DiscoverPage
                onOpenProfile={(u) => setSelectedProfileUser(u)}
                onOpenChat={handleOpenChatWith}
                onOpenGift={(u) => setSelectedGiftUser(u)}
                onOpenShop={() => setIsShopOpen(true)}
              />
            )}

            {activeTab === 'random-match' && (
              <RandomMatchPage onOpenShop={() => setIsShopOpen(true)} />
            )}

            {activeTab === 'explore' && (
              <ExplorePage
                onOpenProfile={(u) => setSelectedProfileUser(u)}
                onOpenChat={handleOpenChatWith}
                onOpenGift={(u) => setSelectedGiftUser(u)}
              />
            )}

            {activeTab === 'friends' && (
              <FriendsPage
                onOpenProfile={(u) => setSelectedProfileUser(u)}
                onOpenChat={handleOpenChatWith}
                onOpenGift={(u) => setSelectedGiftUser(u)}
                onOpenShop={() => setIsShopOpen(true)}
              />
            )}

            {activeTab === 'chat' && (
              <ChatPage
                initialPartner={chatInitialPartner}
                onOpenProfile={(u) => setSelectedProfileUser(u)}
                onOpenGift={(u) => setSelectedGiftUser(u)}
              />
            )}

            {activeTab === 'profile' && (
              <ProfilePage onOpenShop={() => setIsShopOpen(true)} />
            )}
          </>
        )}

      </main>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthOpen || !currentUser}
        onClose={() => setIsAuthOpen(false)}
      />

      <CoinShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
      />

      <DailyCheckinModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
      />

      <CallBusySuggestionsModal
        isOpen={!!busyCallData}
        onClose={() => setBusyCallData(null)}
        busyData={busyCallData}
        onCallUser={(u) => {
          setBusyCallData(null);
          startDirectCall(u, 'video');
        }}
      />

      <UserProfileModal
        user={selectedProfileUser}
        onClose={() => setSelectedProfileUser(null)}
        onStartCall={(u) => {
          setSelectedProfileUser(null);
          startDirectCall(u, 'video');
        }}
        onStartChat={(u) => {
          setSelectedProfileUser(null);
          handleOpenChatWith(u);
        }}
        onOpenGift={(u) => {
          setSelectedProfileUser(null);
          setSelectedGiftUser(u);
        }}
        onOpenReport={(u) => {
          setSelectedProfileUser(null);
          setSelectedReportUser(u);
        }}
      />

      <GiftDrawer
        isOpen={!!selectedGiftUser}
        onClose={() => setSelectedGiftUser(null)}
        receiver={selectedGiftUser}
      />

      <ReportModal
        isOpen={!!selectedReportUser}
        onClose={() => setSelectedReportUser(null)}
        targetUser={selectedReportUser}
      />

      <VideoCallModal
        onOpenReport={(u) => setSelectedReportUser(u)}
      />

      <IncomingCallNotification />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <WebRTCProvider>
          <AppContent />
        </WebRTCProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
