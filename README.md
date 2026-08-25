# Ứng Dụng Hẹn Hò & Video Call 1v1 Chat (Tinder + AyarChat)
> Hệ thống ứng dụng hoàn chỉnh kết hợp quẹt thẻ ghép đôi phong cách **Tinder** và phòng gọi video 1-on-1 ngẫu nhiên có quà tặng & trừ xu phong cách **AyarChat**.

---

## 🌟 Tính Năng Nổi Bật

### 1. User Web App (Responsive Desktop & Mobile Browser - ReactJS + TailwindCSS)
- **Tinder Card Deck**: Quẹt thẻ mượt mà (Like, Nope, Super Like, Rewind, Boost), chuyển ảnh carousel, xem chi tiết hồ sơ & sở thích.
- **Match Celebration**: Hiệu ứng pháo hoa, ghép đôi tức thì khi 2 bên cùng thích nhau, nút gọi video hoặc nhắn tin ngay.
- **AyarChat Video Radar Live 1v1**: Quét sóng radar tìm người lạ ngẫu nhiên theo giới tính/khu vực và kết nối WebRTC HD tức thì.
- **Video Call 1v1 Trực Tiếp**: Kết nối WebRTC thời gian thực, bật/tắt camera/mic, bộ lọc làm đẹp da HD, đồng hồ đếm cước xu theo phút, tự động trừ xu và cộng kim cương cho Host.
- **Hệ Thống Quà Tặng Động 3D**: Bắn hiệu ứng quà tặng (Tim, Hoa hồng, Trà sữa, Siêu xe, Du thuyền, Tên lửa) trực tiếp trong cuộc gọi hoặc khung chat.
- **Trò Chuyện Real-time**: Nhắn tin tức thì qua Socket.io, chia sẻ hình ảnh, thu hồi tin nhắn, xóa cuộc trò chuyện.
- **Khám Phá Lân Cận (Nearby GPS)**: Định vị GPS độ chính xác cao kèm làm mờ bảo mật vị trí, lọc khoảng cách, online, host livestream.
- **Cửa Hàng Xu & VIP Club**: Nạp xu chuyển khoản QR Banking / MoMo, mua gói VIP (Silver, Gold, Platinum), rút tiền mặt từ Kim Cương.

### 2. Admin Management Portal (ReactJS Vite + TailwindCSS)
- **Dashboard Thống Kê**: Doanh thu nạp xu, tổng cuộc gọi video, số cặp match hôm nay, số quà đã bắn.
- **Quản Lý Người Dùng**: Danh sách thành viên, khóa/mở khóa tài khoản vi phạm, điều chỉnh số dư xu và kim cương, xem lịch sử giao dịch.
- **Xét Duyệt Tích Xanh (KYC)**: Xem ảnh selfie chân dung CCCD và phê duyệt tích xanh chính chủ.
- **Kiểm Duyệt & Báo Cáo Vi Phạm**: Xử lý các khiếu nại, quấy rối và khóa tài khoản vi phạm.
- **Quản Lý Kho Quà Tặng**: Thêm/sửa quà tặng mới, icon emoji, giá xu và số kim cương trả cho Host.
- **Cấu Hình Tham Số Hệ Thống**: Giá cước gọi video/phút, tỷ giá quy đổi kim cương ra tiền mặt VND, giá gói hội viên VIP.

---

## 🚀 Hướng Dẫn Khởi Động & Chạy Ứng Dụng

### 1. Khởi động Backend (Node.js Express + Socket.io + MySQL)
```bash
cd backend
npm install
npm run seed     # Nạp dữ liệu mẫu 8 profile, 10 quà tặng, gói xu
npm start        # Chạy server tại http://localhost:5001
```

> **Ghi chú Cơ sở dữ liệu:** Backend tích hợp bộ điều hợp **Dual-Engine Smart Storage**:
> - Nếu có MySQL: Kết nối trực tiếp và tự động đồng bộ schema từ `config/schema.sql`.
> - Nếu chưa cài MySQL: Hệ thống tự động kích hoạt JSON High-Performance Store (`data/store.json`) chạy trơn tru 100% ngay lập tức mà không bao giờ gặp lỗi!

### 2. Khởi động Frontend Web (User + Admin Portal)
```bash
cd frontend-web
npm install
npm run dev      # Truy cập http://localhost:5174 (hoặc cổng Vite cấp)
```

---

## 🔑 Tài Khoản Thử Nghiệm Nhanh

| Tài khoản | Username | Password | Vai trò & Đặc điểm |
|---|---|---|---|
| **Admin Quản Trị** | `admin` | `password123` | Quản trị viên toàn quyền hệ thống |
| **Demo User Nam** | `demo_user` | `password123` | Đã match với Lan Anh & Thảo My, có sẵn 500 Xu |
| **Demo Host Nữ** | `lan_anh` | `password123` | Idol Host livestream, nhận call 25 xu/phút |
| **Demo Host Nữ 2** | `thao_my` | `password123` | Host tại TP. Hồ Chí Minh, nhận call 20 xu/phút |

---

## 🏗️ Cấu Trúc Mã Nguồn

```
e:/apphenhocallchat/
├── backend/
│   ├── config/ (db.js, schema.sql)
│   ├── controllers/ (auth, user, swipe, chat, call, gift, wallet, admin)
│   ├── middlewares/ (authMiddleware, uploadMiddleware)
│   ├── models/ (dataService.js)
│   ├── routes/ (auth, users, swipes, chat, calls, gifts, wallet, admin)
│   ├── services/ (locationService, checkinService, auditService, queueService)
│   ├── seeders/ (seed.js)
│   ├── sockets/ (socketHandler.js - WebRTC Signaling & Live Coin Engine)
│   └── server.js
└── frontend-web/
    ├── src/
    │   ├── components/ (Navbar, SwipeCard, VideoCallModal, GiftDrawer, CoinShopModal, MatchCelebrationModal, UserProfileModal, ReportModal, IncomingCallNotification, AuthModal)
    │   ├── context/ (AuthContext, SocketContext, WebRTCContext)
    │   ├── pages/
    │   │   ├── user/ (DiscoverPage, RandomMatchPage, ExplorePage, ChatPage, ProfilePage)
    │   │   └── admin/ (AdminDashboard, AdminUsers, AdminVerifications, AdminReports, AdminGifts, AdminSettings)
    │   ├── services/ (api.js)
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```
