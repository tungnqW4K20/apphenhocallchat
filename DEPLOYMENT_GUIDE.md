# 🚀 Hướng Dẫn Deploy Hệ Thống Lên Môi Trường Internet (Production)

Hệ thống Hẹn Hò & Video Call 1v1 (**Frontend Web ReactJS + Backend Node.js WebRTC**) đã được cấu hình sẵn sàng 100% để triển khai lên môi trường Internet công khai.

---

## 🌟 PHƯƠNG ÁN 1: Deploy Miễn Phí Trên Vercel (Frontend) & Render.com (Backend)
> **Ưu điểm**: Hoàn toàn miễn phí, tự động cấp HTTPS SSL, tự động build & deploy mỗi khi bạn đẩy code lên GitHub.

### Bước 1: Đẩy Code Lên GitHub
1. Khởi tạo Git và đẩy toàn bộ thư mục dự án lên repository của bạn trên GitHub:
```bash
git init
git add .
git commit -m "feat: complete dating video call platform ready for deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

### Bước 2: Deploy Backend lên Render.com (WebRTC + Socket.io)
1. Đăng nhập vào [Render.com](https://render.com) (bằng tài khoản GitHub).
2. Nhấn **New +** $\rightarrow$ chọn **Web Service** $\rightarrow$ chọn Repository GitHub vừa tạo.
3. Điền các thông tin:
   * **Name**: `dating-backend`
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
   * **Instance Type**: `Free`
4. Tại mục **Environment Variables**, thêm:
   * `NODE_ENV`: `production`
   * `PORT`: `5001`
   * `JWT_SECRET`: `ayar_dating_production_secret_key_2026_super_secure`
5. Nhấn **Create Web Service**. Sau 1-2 phút, Render sẽ cung cấp cho bạn một đường link HTTPS (Ví dụ: `https://dating-backend-xxxx.onrender.com`).

### Bước 3: Deploy Frontend lên Vercel
1. Đăng nhập vào [Vercel.com](https://vercel.com) (bằng tài khoản GitHub).
2. Nhấn **Add New...** $\rightarrow$ chọn **Project** $\rightarrow$ Chọn Repository của bạn.
3. Cấu hình dự án:
   * **Framework Preset**: `Vite`
   * **Root Directory**: Nhấn **Edit** $\rightarrow$ chọn thư mục `frontend-web`.
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Mở rộng phần **Environment Variables** và thêm:
   * `VITE_API_URL`: `https://dating-backend-xxxx.onrender.com/api` (Dán link Backend ở Bước 2 vào)
   * `VITE_SOCKET_URL`: `https://dating-backend-xxxx.onrender.com` (Dán link Backend ở Bước 2 vào)
5. Nhấn **Deploy**. Sau 30 giây, Vercel sẽ cung cấp tên miền HTTPS công khai (Ví dụ: `https://dating-callchat-web.vercel.app`) để người dùng toàn thế giới truy cập!

---

## 🐳 PHƯƠNG ÁN 2: Deploy Toàn Bộ Lên VPS Cá Nhân Bằng Docker (1 Lệnh)
> **Ưu điểm**: Tự chủ hạ tầng, tốc độ siêu nhanh, phù hợp khi bạn thuê VPS riêng (Ubuntu / Debian / CentOS).

1. Cài đặt Docker & Docker Compose trên VPS.
2. Clone repository về VPS và chạy lệnh:
```bash
docker compose up -d --build
```
3. Toàn bộ Frontend Nginx (cổng 80) và Backend API/Socket (cổng 5001) sẽ tự động khởi động và liên kết thông suốt!

---

## ⚡ PHƯƠNG ÁN 3: Mở Link HTTPS Công Khai Test Ngay Từ Máy Bạn
Nếu bạn muốn gửi link cho bạn bè hoặc test trên điện thoại 4G ngay bây giờ mà chưa cần đẩy lên cloud:

1. Chạy lệnh mở tunnel công khai qua Cloudflare hoặc LocalTunnel:
```bash
npx -y localtunnel --port 5174
```
2. Công cụ sẽ cấp ngay 1 URL dạng `https://xxxx.loca.lt` để bạn mở trực tiếp trên điện thoại kết nối internet từ bất kỳ đâu!
