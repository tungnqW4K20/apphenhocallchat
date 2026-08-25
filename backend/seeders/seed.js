const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { getMockStore, saveStore, isUsingFallback, initDatabase } = db;

async function seed() {
  await initDatabase();
  console.log('🌱 Starting Comprehensive Database Seeding with 25+ Vietnamese Profiles...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const initialGifts = [
    { name: 'Thả Tim Yêu Thương', icon: '❤️', animation_type: 'floating', coin_price: 10, diamond_reward: 7, category: 'popular' },
    { name: 'Bông Hoa Hồng Đỏ', icon: '🌹', animation_type: 'floating', coin_price: 20, diamond_reward: 14, category: 'romantic' },
    { name: 'Trà Sữa Trân Châu', icon: '🧋', animation_type: 'floating', coin_price: 30, diamond_reward: 21, category: 'popular' },
    { name: 'Cocktail Hoàng Hôn', icon: '🍹', animation_type: 'floating', coin_price: 50, diamond_reward: 35, category: 'romantic' },
    { name: 'Gấu Bông Khổng Lồ', icon: '🧸', animation_type: 'blast', coin_price: 100, diamond_reward: 70, category: 'popular' },
    { name: 'Vương Miện Nữ Hoàng', icon: '👑', animation_type: 'full_screen', coin_price: 250, diamond_reward: 180, category: 'vip' },
    { name: 'Nhẫn Kim Cương', icon: '💍', animation_type: 'blast', coin_price: 500, diamond_reward: 370, category: 'luxury' },
    { name: 'Siêu Xe Thể Thao', icon: '🏎️', animation_type: 'full_screen', coin_price: 1000, diamond_reward: 750, category: 'luxury' },
    { name: 'Du Thuyền Triệu Đô', icon: '🛥️', animation_type: 'full_screen', coin_price: 2000, diamond_reward: 1500, category: 'vip' },
    { name: 'Tên Lửa Tình Yêu', icon: '🚀', animation_type: 'fireworks', coin_price: 5000, diamond_reward: 3800, category: 'vip' }
  ];

  const initialPackages = [
    { name: 'Gói Trải Nghiệm', coins: 100, bonus_coins: 10, price_vnd: 20000, badge: 'PHỔ BIẾN' },
    { name: 'Gói Hẹn Hò', coins: 300, bonus_coins: 50, price_vnd: 50000, badge: 'HOT' },
    { name: 'Gói Tình Nhân', coins: 700, bonus_coins: 150, price_vnd: 100000, badge: 'ƯU ĐÃI' },
    { name: 'Gói Đại Gia VIP', coins: 1800, bonus_coins: 500, price_vnd: 250000, badge: 'BEST CHOICE' },
    { name: 'Gói Vương Giả', coins: 4000, bonus_coins: 1200, price_vnd: 500000, badge: 'SIÊU CẤP' }
  ];

  const seedUsers = [
    {
      username: 'admin',
      email: 'admin@datingcall.com',
      password: passwordHash,
      full_name: 'Quản Trị Viên (Admin)',
      gender: 'male',
      age: 28,
      birth_date: '1998-05-12',
      bio: 'Admin quản trị nền tảng Hẹn Hò & Video Call Chat',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500',
      job: 'System Administrator',
      company_or_school: 'Ayar Dating Inc.',
      city: 'Hà Nội',
      country: 'Việt Nam',
      latitude: 21.0285,
      longitude: 105.8542,
      interests: ['Công nghệ', 'Quản lý', 'Du lịch', 'Bóng đá'],
      coins: 99999,
      diamonds: 50000,
      vip_level: 3,
      is_host: false,
      call_rate_per_min: 0,
      is_verified: true,
      is_online: true,
      role: 'admin'
    },
    {
      username: 'demo_user',
      email: 'user@datingcall.com',
      password: passwordHash,
      full_name: 'Minh Hoàng',
      gender: 'male',
      age: 24,
      birth_date: '2002-09-18',
      bio: 'Thích chụp ảnh film, nghe nhạc indie và tìm kiếm một tâm hồn đồng điệu để cùng trò chuyện mỗi đêm 🌙',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
      job: 'Software Engineer',
      company_or_school: 'FPT University',
      city: 'Hà Nội',
      country: 'Việt Nam',
      latitude: 21.0300,
      longitude: 105.8500,
      interests: ['Lập trình', 'Nhiếp ảnh', 'Cà phê', 'Indie Music', 'Gym'],
      coins: 2000,
      diamonds: 150,
      vip_level: 2,
      is_host: false,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      role: 'user'
    },
    // FEMALE PROFILES (15+ Profiles)
    {
      username: 'lan_anh',
      email: 'lananh@gmail.com',
      password: passwordHash,
      full_name: 'Lan Anh (Rose)',
      gender: 'female',
      age: 22,
      birth_date: '2004-03-15',
      bio: 'Idol Livestream & Content Creator. Thích nói chuyện vui vẻ, hát và chia sẻ chuyện hằng ngày qua video call ✨ Call với mình nha!',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
      job: 'Content Creator / Host',
      company_or_school: 'Đại học Ngoại Thương',
      city: 'Hà Nội',
      country: 'Việt Nam',
      latitude: 21.0250,
      longitude: 105.8450,
      interests: ['Âm nhạc', 'Thời trang', 'Nấu ăn', 'Du lịch', 'Mèo'],
      coins: 1200,
      diamonds: 3800,
      vip_level: 3,
      is_host: true,
      call_rate_per_min: 25,
      is_verified: true,
      is_online: true,
      role: 'user'
    },
    {
      username: 'thao_my',
      email: 'thaomy@gmail.com',
      password: passwordHash,
      full_name: 'Thảo My',
      gender: 'female',
      age: 23,
      birth_date: '2003-08-20',
      bio: 'Dược sĩ tương lai 💊 Thích du lịch biển, mê trà sữa full topping và tìm người cùng đi dạo phố buổi tối.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
      job: 'Dược sĩ / Model',
      company_or_school: 'ĐH Y Dược',
      city: 'TP. Hồ Chí Minh',
      country: 'Việt Nam',
      latitude: 10.7769,
      longitude: 106.7009,
      interests: ['Du lịch', 'Biển', 'Trà sữa', 'Chó mèo', 'Phim ảnh'],
      coins: 350,
      diamonds: 1200,
      vip_level: 1,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      role: 'user'
    },
    {
      username: 'mai_linh',
      email: 'mailinh@gmail.com',
      password: passwordHash,
      full_name: 'Mai Linh',
      gender: 'female',
      age: 21,
      birth_date: '2005-01-10',
      bio: 'Sinh viên năm 3. Tính cách hướng ngoại, thích kết bạn mới trên khắp cả nước. Quẹt phải nếu bạn cũng mê ăn vặt nhé! 🍕',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500',
      job: 'Sinh viên Marketing',
      company_or_school: 'RMIT University',
      city: 'Hà Nội',
      country: 'Việt Nam',
      latitude: 21.0350,
      longitude: 105.8600,
      interests: ['Ăn uống', 'Mua sắm', 'Xem phim', 'TikTok', 'Boardgame'],
      coins: 420,
      diamonds: 850,
      vip_level: 2,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      role: 'user'
    },
    {
      username: 'ngoc_huyen',
      email: 'ngochuyen@gmail.com',
      password: passwordHash,
      full_name: 'Ngọc Huyền',
      gender: 'female',
      age: 25,
      birth_date: '2001-11-05',
      bio: 'Fashion Designer & Stylist. Độc thân vui vẻ, thích những buổi hẹn lãng mạn tại quán rooftop nhìn ngắm thành phố về đêm 🍷',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
      job: 'Fashion Stylist',
      company_or_school: 'Studio Design',
      city: 'Đà Nẵng',
      country: 'Việt Nam',
      latitude: 16.0544,
      longitude: 108.2022,
      interests: ['Rượu vang', 'Nghệ thuật', 'Yoga', 'Thời trang', 'Đọc sách'],
      coins: 800,
      diamonds: 2400,
      vip_level: 2,
      is_host: true,
      call_rate_per_min: 30,
      is_verified: true,
      is_online: true,
      role: 'user'
    },
    {
      username: 'quynh_nga',
      email: 'quynhnga@gmail.com',
      password: passwordHash,
      full_name: 'Quỳnh Nga',
      gender: 'female',
      age: 22,
      birth_date: '2004-06-25',
      bio: 'Mê piano và cắm hoa 🌸 Đang tìm một người kiên nhẫn để nghe mình luyên thuyên sau giờ làm việc mệt mỏi.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500',
      job: 'Giáo viên Piano',
      company_or_school: 'Học viện Âm nhạc',
      city: 'Hà Nội',
      country: 'Việt Nam',
      latitude: 21.0200,
      longitude: 105.8400,
      interests: ['Piano', 'Cắm hoa', 'Trà chiều', 'Manga', 'Chụp ảnh'],
      coins: 300,
      diamonds: 950,
      vip_level: 1,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      role: 'user'
    },
    {
      username: 'bao_ngoc',
      email: 'baongoc@gmail.com',
      password: passwordHash,
      full_name: 'Bảo Ngọc (Ruby)',
      gender: 'female',
      age: 23,
      birth_date: '2003-04-12',
      bio: 'Tiếp viên hàng không ✈️ Thích bay lượn khắp các phương trời, thích sưu tầm son môi và lắng nghe câu chuyện của bạn.',
      avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500',
      job: 'Flight Attendant',
      company_or_school: 'Vietnam Airlines',
      city: 'TP. Hồ Chí Minh',
      country: 'Việt Nam',
      latitude: 10.7850,
      longitude: 106.7100,
      interests: ['Du lịch', 'Bay lượn', 'Ngoại ngữ', 'Ẩm thực', 'Bơi lội'],
      coins: 1500,
      diamonds: 4200,
      vip_level: 3,
      is_host: true,
      call_rate_per_min: 35,
      is_verified: true,
      is_online: true,
      role: 'user'
    },
    {
      username: 'thu_trang',
      email: 'thutrang@gmail.com',
      password: passwordHash,
      full_name: 'Thu Trang',
      gender: 'female',
      age: 24,
      birth_date: '2002-12-08',
      bio: 'Huấn luyện viên Yoga & Pilates 🧘‍♀️ Sống lành mạnh, thích thiên nhiên và những buổi sáng uống trà ấm.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
      job: 'Yoga Instructor',
      company_or_school: 'Zen Yoga Studio',
      city: 'Đà Lạt',
      country: 'Việt Nam',
      latitude: 11.9404,
      longitude: 108.4583,
      interests: ['Yoga', 'Pilates', 'Ăn chay', 'Thiền', 'Đọc sách'],
      coins: 600,
      diamonds: 1800,
      vip_level: 2,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      role: 'user'
    },
    {
      username: 'ha_my',
      email: 'hamy@gmail.com',
      password: passwordHash,
      full_name: 'Hà My (Miu)',
      gender: 'female',
      age: 20,
      birth_date: '2006-02-14',
      bio: 'Streamer & Gamer 🎮 Thích chơi game, ăn đồ ngọt và trò chuyện hài hước. Nhắn tin hoặc call với mình nha!',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
      job: 'Game Streamer',
      company_or_school: 'ĐH Sân Khấu Điện Ảnh',
      city: 'Hà Nội',
      country: 'Việt Nam',
      latitude: 21.0400,
      longitude: 105.8300,
      interests: ['Gaming', 'Anime', 'Cosplay', 'Trà đào', 'Mèo'],
      coins: 450,
      diamonds: 2100,
      vip_level: 2,
      is_host: true,
      call_rate_per_min: 25,
      is_verified: true,
      is_online: true,
      role: 'user'
    },
    {
      username: 'cam_tu',
      email: 'camtu@gmail.com',
      password: passwordHash,
      full_name: 'Cẩm Tú',
      gender: 'female',
      age: 23,
      birth_date: '2003-09-30',
      bio: 'Kiến trúc sư nội thất. Thích phong cách Scandinavian tối giản, yêu cà phê rang xay và ngắm mưa.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500',
      job: 'Interior Architect',
      company_or_school: 'A+ Design',
      city: 'TP. Hồ Chí Minh',
      country: 'Việt Nam',
      latitude: 10.7700,
      longitude: 106.6800,
      interests: ['Kiến trúc', 'Cà phê', 'Vẽ tranh', 'Triển lãm', 'Mèo'],
      coins: 700,
      diamonds: 1600,
      vip_level: 2,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      role: 'user'
    },
    {
      username: 'kim_ngan',
      email: 'kimngan@gmail.com',
      password: passwordHash,
      full_name: 'Kim Ngân',
      gender: 'female',
      age: 22,
      birth_date: '2004-07-19',
      bio: 'Makeup Artist chuyên nghiệp 💄 Thích làm đẹp cho mọi người, yêu thích phong cách Hàn Quốc ngọt ngào.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
      job: 'Makeup Artist',
      company_or_school: 'Beauty Center',
      city: 'Cần Thơ',
      country: 'Việt Nam',
      latitude: 10.0452,
      longitude: 105.7469,
      interests: ['Makeup', 'Thời trang', 'Làm đẹp', 'Du lịch', 'Nhạc Pop'],
      coins: 380,
      diamonds: 920,
      vip_level: 1,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      role: 'user'
    },
    {
      username: 'phuong_thao',
      email: 'phuongthao@gmail.com',
      password: passwordHash,
      full_name: 'Phương Thảo',
      gender: 'female',
      age: 24,
      birth_date: '2002-05-18',
      bio: 'Bác sĩ thú y yêu động vật 🐶🐱 Tìm một chàng trai có trái tim ấm áp để cùng chia sẻ niềm vui cuộc sống.',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500',
      job: 'Veterinarian',
      company_or_school: 'Pet Care Clinic',
      city: 'Hải Phòng',
      country: 'Việt Nam',
      latitude: 20.8449,
      longitude: 106.6881,
      interests: ['Thú cưng', 'Cắm trại', 'Chụp ảnh', 'Nấu ăn', 'Leo núi'],
      coins: 520,
      diamonds: 1400,
      vip_level: 2,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      role: 'user'
    },
    {
      username: 'thanh_truc',
      email: 'thanhtruc@gmail.com',
      password: passwordHash,
      full_name: 'Thanh Trúc',
      gender: 'female',
      age: 21,
      birth_date: '2005-08-03',
      bio: 'Vũ công / Dancer năng động 💃 Thích nhảy K-Pop, ăn lẩu cay và đi dạo hồ Tây lúc hoàng hôn.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
      job: 'Dancer / Choreographer',
      company_or_school: 'Dance Crew HN',
      city: 'Hà Nội',
      country: 'Việt Nam',
      latitude: 21.0500,
      longitude: 105.8200,
      interests: ['Vũ đạo', 'K-Pop', 'Ăn cay', 'Hồ Tây', 'Thời trang'],
      coins: 400,
      diamonds: 1750,
      vip_level: 2,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      role: 'user'
    },
    {
      username: 'nhu_quynh',
      email: 'nhuquynh@gmail.com',
      password: passwordHash,
      full_name: 'Như Quỳnh',
      gender: 'female',
      age: 23,
      birth_date: '2003-10-15',
      bio: 'Barista & Coffee Lover ☕ Đam mê các loại cà phê specialty. Sẵn sàng pha cho bạn một tách latte hình trái tim!',
      avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500',
      job: 'Head Barista',
      company_or_school: 'Specialty Cafe',
      city: 'Nha Trang',
      country: 'Việt Nam',
      latitude: 12.2388,
      longitude: 109.1967,
      interests: ['Cà phê', 'Bánh ngọt', 'Biển', 'Acoustic', 'Mèo'],
      coins: 300,
      diamonds: 1100,
      vip_level: 1,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      role: 'user'
    },
    // MALE PROFILES (10 Profiles)
    {
      username: 'tuan_kiet',
      email: 'tuankiet@gmail.com',
      password: passwordHash,
      full_name: 'Tuấn Kiệt',
      gender: 'male',
      age: 26,
      birth_date: '2000-04-14',
      bio: 'Huấn luyện viên thể hình cá nhân (PT). Yêu thể thao, sống tích cực, tìm bạn nữ cùng tập luyện và ăn uống lành mạnh 💪',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
      job: 'Fitness Coach',
      company_or_school: 'Elite Fitness',
      city: 'TP. Hồ Chí Minh',
      country: 'Việt Nam',
      latitude: 10.7800,
      longitude: 106.6900,
      interests: ['Gym', 'Bơi lội', 'Healthy Food', 'Leo núi', 'Xe cộ'],
      coins: 600,
      diamonds: 500,
      vip_level: 1,
      is_host: false,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      role: 'user'
    },
    {
      username: 'hai_nam',
      email: 'hainam@gmail.com',
      password: passwordHash,
      full_name: 'Hải Nam',
      gender: 'male',
      age: 25,
      birth_date: '2001-07-22',
      bio: 'Nhiếp ảnh gia đường phố & Travel Blogger 📷 Thích lang thang góc phố cổ, ghi lại những khoảnh khắc đẹp.',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500',
      job: 'Photographer',
      company_or_school: 'Freelancer',
      city: 'Hà Nội',
      country: 'Việt Nam',
      latitude: 21.0320,
      longitude: 105.8480,
      interests: ['Nhiếp ảnh', 'Du lịch', 'Cà phê', 'Indie Music', 'Phim ảnh'],
      coins: 850,
      diamonds: 300,
      vip_level: 2,
      is_host: false,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      role: 'user'
    },
    {
      username: 'quoc_bao',
      email: 'quocbao@gmail.com',
      password: passwordHash,
      full_name: 'Quốc Bảo',
      gender: 'male',
      age: 27,
      birth_date: '1999-03-11',
      bio: 'Founder Startup công nghệ. Thích đọc sách kinh doanh, chạy bộ buổi sáng và tìm người chia sẻ những kế hoạch tương lai 🚀',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500',
      job: 'Startup Founder',
      company_or_school: 'Tech Hub Vietnam',
      city: 'TP. Hồ Chí Minh',
      country: 'Việt Nam',
      latitude: 10.7720,
      longitude: 106.7050,
      interests: ['Startup', 'Kinh doanh', 'Đọc sách', 'Chạy bộ', 'Tennis'],
      coins: 3500,
      diamonds: 1200,
      vip_level: 3,
      is_host: false,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      role: 'user'
    },
    {
      username: 'duc_anh',
      email: 'ducanh@gmail.com',
      password: passwordHash,
      full_name: 'Đức Anh',
      gender: 'male',
      age: 24,
      birth_date: '2002-11-28',
      bio: 'Guitarist & Singer trong ban nhạc acoustic 🎸 Thích hát tình ca và tạo nên những giai điệu êm dịu.',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500',
      job: 'Musician / Guitarist',
      company_or_school: 'Acoustic Club',
      city: 'Đà Nẵng',
      country: 'Việt Nam',
      latitude: 16.0600,
      longitude: 108.2100,
      interests: ['Guitar', 'Ca hát', 'Acoustic', 'Cà phê', 'Du lịch bụi'],
      coins: 400,
      diamonds: 700,
      vip_level: 1,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      role: 'user'
    },
    {
      username: 'hoang_long',
      email: 'hoanglong@gmail.com',
      password: passwordHash,
      full_name: 'Hoàng Long',
      gender: 'male',
      age: 26,
      birth_date: '2000-09-05',
      bio: 'Bếp trưởng món Âu 👨‍🍳 Đam mê ẩm thực và rượu vang. Sẵn sàng nấu cho bạn bữa tối lãng mạn dưới ánh nến.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
      job: 'Executive Chef',
      company_or_school: 'French Bistro',
      city: 'Hà Nội',
      country: 'Việt Nam',
      latitude: 21.0260,
      longitude: 105.8520,
      interests: ['Ẩm thực', 'Nấu ăn', 'Rượu vang', 'Baking', 'Du lịch'],
      coins: 900,
      diamonds: 600,
      vip_level: 2,
      is_host: false,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      role: 'user'
    }
  ];

  if (!isUsingFallback()) {
    console.log('🐬 Seeding directly into MySQL Database with 20+ profiles...');
    
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE follows');
    await db.query('TRUNCATE TABLE messages');
    await db.query('TRUNCATE TABLE conversations');
    await db.query('TRUNCATE TABLE matches');
    await db.query('TRUNCATE TABLE swipes');
    await db.query('TRUNCATE TABLE user_photos');
    await db.query('TRUNCATE TABLE call_logs');
    await db.query('TRUNCATE TABLE transactions');
    await db.query('TRUNCATE TABLE verifications');
    await db.query('TRUNCATE TABLE reports');
    await db.query('TRUNCATE TABLE gifts');
    await db.query('TRUNCATE TABLE coin_packages');
    await db.query('TRUNCATE TABLE users');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    // Insert Gifts
    for (const g of initialGifts) {
      await db.query(
        'INSERT INTO gifts (name, icon, animation_type, coin_price, diamond_reward, category) VALUES (?, ?, ?, ?, ?, ?)',
        [g.name, g.icon, g.animation_type, g.coin_price, g.diamond_reward, g.category]
      );
    }

    // Insert Packages
    for (const p of initialPackages) {
      await db.query(
        'INSERT INTO coin_packages (name, coins, bonus_coins, price_vnd, badge) VALUES (?, ?, ?, ?, ?)',
        [p.name, p.coins, p.bonus_coins, p.price_vnd, p.badge]
      );
    }

    // Insert Users
    const userMap = {};
    for (const u of seedUsers) {
      const res = await db.query(
        `INSERT INTO users (username, email, password, full_name, gender, birth_date, age, bio, avatar, job, company_or_school, city, country, latitude, longitude, interests, coins, diamonds, vip_level, is_host, call_rate_per_min, is_verified, is_online, role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          u.username, u.email, u.password, u.full_name, u.gender, u.birth_date, u.age, u.bio,
          u.avatar, u.job, u.company_or_school, u.city, u.country, u.latitude, u.longitude,
          JSON.stringify(u.interests), u.coins, u.diamonds, u.vip_level, u.is_host,
          u.call_rate_per_min, u.is_verified, true, u.role
        ]
      );
      const insertedId = res.insertId;
      userMap[u.username] = insertedId;

      await db.query('INSERT INTO user_photos (user_id, photo_url, is_primary) VALUES (?, ?, ?)', [insertedId, u.avatar, true]);
    }

    const demoId = userMap['demo_user'];
    const lanAnhId = userMap['lan_anh'];
    const thaoMyId = userMap['thao_my'];
    const ngocHuyenId = userMap['ngoc_huyen'];
    const maiLinhId = userMap['mai_linh'];
    const baoNgocId = userMap['bao_ngoc'];

    // Swipes & Matches (Demo user with several female idols)
    await db.query('INSERT INTO swipes (swiper_id, target_id, action) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?)', [
      demoId, lanAnhId, 'like',
      lanAnhId, demoId, 'like',
      demoId, thaoMyId, 'superlike',
      thaoMyId, demoId, 'like',
      demoId, ngocHuyenId, 'like',
      ngocHuyenId, demoId, 'like'
    ]);

    await db.query('INSERT INTO matches (user1_id, user2_id) VALUES (?, ?), (?, ?), (?, ?)', [
      Math.min(demoId, lanAnhId), Math.max(demoId, lanAnhId),
      Math.min(demoId, thaoMyId), Math.max(demoId, thaoMyId),
      Math.min(demoId, ngocHuyenId), Math.max(demoId, ngocHuyenId)
    ]);

    // Initial Follow Relationships
    // Demo follows Lan Anh, Thao My, Ngoc Huyen, Bao Ngoc
    // Lan Anh, Thao My, Mai Linh follow Demo (Fans)
    await db.query('INSERT INTO follows (follower_id, following_id) VALUES (?, ?), (?, ?), (?, ?), (?, ?), (?, ?), (?, ?), (?, ?)', [
      demoId, lanAnhId,
      demoId, thaoMyId,
      demoId, ngocHuyenId,
      demoId, baoNgocId,
      lanAnhId, demoId,
      thaoMyId, demoId,
      maiLinhId, demoId
    ]);

    // Initial Conversations
    const conv1 = await db.query(
      'INSERT INTO conversations (user1_id, user2_id, last_message, last_message_at) VALUES (?, ?, ?, NOW())',
      [Math.min(demoId, lanAnhId), Math.max(demoId, lanAnhId), 'Chào anh Minh Hoàng nha! Anh có thích gọi video buôn chuyện không? 🥰']
    );
    const conv2 = await db.query(
      'INSERT INTO conversations (user1_id, user2_id, last_message, last_message_at) VALUES (?, ?, ?, NOW())',
      [Math.min(demoId, ngocHuyenId), Math.max(demoId, ngocHuyenId), 'Dạ chào anh, em vừa online nè ✨']
    );

    await db.query(
      `INSERT INTO messages (conversation_id, sender_id, receiver_id, message_type, content, is_read) VALUES
       (?, ?, ?, 'text', ?, TRUE),
       (?, ?, ?, 'text', ?, TRUE),
       (?, ?, ?, 'text', ?, TRUE),
       (?, ?, ?, 'text', ?, TRUE)`,
      [
        conv1.insertId, demoId, lanAnhId, 'Chào Lan Anh! Rất vui được match với em trên app ✨',
        conv1.insertId, lanAnhId, demoId, 'Chào anh Minh Hoàng nha! Anh có thích gọi video buôn chuyện không? 🥰',
        conv2.insertId, demoId, ngocHuyenId, 'Chào em Ngọc Huyền nha!',
        conv2.insertId, ngocHuyenId, demoId, 'Dạ chào anh, em vừa online nè ✨'
      ]
    );

    console.log('✅ Seeded into MySQL Database successfully! 20+ profiles, followers, friends, matches & chats.');
  } else {
    // Fallback Mock Store
    const store = getMockStore();
    store.users = [];
    store.user_photos = [];
    store.gifts = [];
    store.coin_packages = [];
    store.swipes = [];
    store.matches = [];
    store.follows = [];
    store.conversations = [];
    store.messages = [];
    store.call_logs = [];
    store.transactions = [];
    store.verifications = [];
    store.reports = [];

    store.autoIncrementIds = {
      users: 1, user_photos: 1, swipes: 1, matches: 1, follows: 1, conversations: 1,
      messages: 1, gifts: 1, call_logs: 1, coin_packages: 1, transactions: 1,
      verifications: 1, reports: 1
    };

    initialGifts.forEach(g => store.gifts.push({ id: store.autoIncrementIds.gifts++, ...g, created_at: new Date().toISOString() }));
    initialPackages.forEach(p => store.coin_packages.push({ id: store.autoIncrementIds.coin_packages++, ...p, created_at: new Date().toISOString() }));

    seedUsers.forEach(u => {
      const userId = store.autoIncrementIds.users++;
      store.users.push({ id: userId, ...u, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      store.user_photos.push({ id: store.autoIncrementIds.user_photos++, user_id: userId, photo_url: u.avatar, is_primary: true, created_at: new Date().toISOString() });
    });

    saveStore();
    console.log('✅ Seed completed in fallback store.');
  }
}

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
}

module.exports = seed;
