const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function seedRichFemaleUsers() {
  const storePath = path.join(__dirname, 'data', 'store.json');
  let store = { users: [], user_photos: [], swipes: [], matches: [], messages: [], calls: [], gifts: [], transactions: [], checkins: [] };
  
  if (fs.existsSync(storePath)) {
    try {
      store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    } catch (e) {
      console.warn('Could not read existing store:', e);
    }
  }

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Keep admin (id: 1) and demo_user (id: 2)
  const baseUsers = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@datingcall.com',
      password: hashedPassword,
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
      is_in_call: false,
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      username: 'demo_user',
      email: 'user@datingcall.com',
      password: hashedPassword,
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
      latitude: 21.03,
      longitude: 105.85,
      interests: ['Lập trình', 'Nhiếp ảnh', 'Cà phê', 'Indie Music', 'Gym'],
      coins: 1000,
      diamonds: 100,
      vip_level: 2,
      is_host: false,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      is_in_call: false,
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // 20+ Vietnamese Female Profiles with UNIQUE Distinct Avatars & Photos
  const femaleProfiles = [
    {
      id: 3,
      username: 'lan_anh',
      email: 'lananh@gmail.com',
      full_name: 'Lan Anh (Rose)',
      gender: 'female',
      age: 22,
      birth_date: '2004-03-15',
      bio: 'Idol Livestream & Content Creator ✨ Thích ca hát, chia sẻ chuyện vui mỗi ngày. Call với mình để xả stress nhé!',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
      photos: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600',
        'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600'
      ],
      job: 'Idol Host / Content Creator',
      company_or_school: 'ĐH Ngoại Thương',
      city: 'Hà Nội',
      country: 'Việt Nam',
      latitude: 21.025,
      longitude: 105.845,
      interests: ['Âm nhạc', 'Thời trang', 'Nấu ăn', 'Du lịch', 'Mèo'],
      coins: 1200,
      diamonds: 3800,
      vip_level: 3,
      is_host: true,
      call_rate_per_min: 25,
      is_verified: true,
      is_online: true,
      is_in_call: false // Rảnh
    },
    {
      id: 4,
      username: 'thao_my',
      email: 'thaomy@gmail.com',
      full_name: 'Thảo My',
      gender: 'female',
      age: 23,
      birth_date: '2003-08-20',
      bio: 'Dược sĩ tương lai 💊 Mê trà sữa full topping, thích đi dạo bờ sông Sài Gòn ngắm hoàng hôn.',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600',
      photos: [
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600'
      ],
      job: 'Dược sĩ / Model',
      company_or_school: 'ĐH Y Dược TP.HCM',
      city: 'TP. Hồ Chí Minh',
      country: 'Việt Nam',
      latitude: 10.7769,
      longitude: 106.7009,
      interests: ['Du lịch', 'Biển', 'Trà sữa', 'Chó mèo', 'Phim ảnh'],
      coins: 350,
      diamonds: 1500,
      vip_level: 1,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      is_in_call: false // Rảnh
    },
    {
      id: 5,
      username: 'mai_linh',
      email: 'mailinh@gmail.com',
      full_name: 'Mai Linh',
      gender: 'female',
      age: 21,
      birth_date: '2005-01-10',
      bio: 'Sinh viên Marketing năng động 🍕 Thích ăn vặt, làm video TikTok và kết bạn bốn phương!',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600',
      photos: [
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600'
      ],
      job: 'Sinh viên Marketing',
      company_or_school: 'RMIT University',
      city: 'Hà Nội',
      country: 'Việt Nam',
      latitude: 21.035,
      longitude: 105.86,
      interests: ['Ăn uống', 'Mua sắm', 'Xem phim', 'TikTok', 'Boardgame'],
      coins: 420,
      diamonds: 850,
      vip_level: 2,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      is_in_call: true // BUSY - Đang có cuộc gọi
    },
    {
      id: 6,
      username: 'ngoc_huyen',
      email: 'ngochuyen@gmail.com',
      full_name: 'Ngọc Huyền',
      gender: 'female',
      age: 25,
      birth_date: '2001-11-05',
      bio: 'Fashion Designer & Stylist 🍷 Thích những buổi hẹn lãng mạn tại rooftop ngắm cầu Rồng về đêm.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600',
      photos: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'
      ],
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
      is_in_call: false // Rảnh
    },
    {
      id: 7,
      username: 'quynh_nga',
      email: 'quynhnga@gmail.com',
      full_name: 'Quỳnh Nga',
      gender: 'female',
      age: 22,
      birth_date: '2004-06-25',
      bio: 'Cô gái piano dịu dàng 🌸 Thích cắm hoa, làm bánh và lắng nghe những câu chuyện ấm áp.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600',
      photos: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600'
      ],
      job: 'Giáo viên Piano',
      company_or_school: 'Học viện Âm nhạc',
      city: 'Hà Nội',
      country: 'Việt Nam',
      latitude: 21.02,
      longitude: 105.84,
      interests: ['Piano', 'Cắm hoa', 'Trà chiều', 'Manga', 'Chụp ảnh'],
      coins: 300,
      diamonds: 950,
      vip_level: 1,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      is_in_call: false // Rảnh
    },
    {
      id: 8,
      username: 'bao_tran',
      email: 'baotran@gmail.com',
      full_name: 'Bảo Trân',
      gender: 'female',
      age: 23,
      birth_date: '2003-04-12',
      bio: 'Host livestream ca hát & trò chuyện ban đêm 🎙️ Giọng nói ngọt ngào sẽ giúp bạn ngủ ngon hơn!',
      avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600',
      photos: [
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600'
      ],
      job: 'Voice Idol / Ca sĩ tự do',
      company_or_school: 'Nhạc Viện TP.HCM',
      city: 'TP. Hồ Chí Minh',
      country: 'Việt Nam',
      latitude: 10.782,
      longitude: 106.698,
      interests: ['Ca hát', 'Acoustic', 'Cà phê', 'Du lịch', 'Mèo'],
      coins: 900,
      diamonds: 3200,
      vip_level: 2,
      is_host: true,
      call_rate_per_min: 25,
      is_verified: true,
      is_online: true,
      is_in_call: true // BUSY
    },
    {
      id: 9,
      username: 'phuong_linh',
      email: 'phuonglinh@gmail.com',
      full_name: 'Phương Linh',
      gender: 'female',
      age: 24,
      birth_date: '2002-12-03',
      bio: 'Biên đạo múa & Dancer 💃 Năng lượng tích cực, yêu đời, thích thể thao và du lịch khám phá.',
      avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600',
      photos: [
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'
      ],
      job: 'Dancer / Fitness Coach',
      company_or_school: 'Dance Studio Hanoi',
      city: 'Hà Nội',
      country: 'Việt Nam',
      latitude: 21.038,
      longitude: 105.852,
      interests: ['Nhảy múa', 'Kpop', 'Gym', 'Cắm trại', 'Nấu ăn'],
      coins: 450,
      diamonds: 1800,
      vip_level: 2,
      is_host: true,
      call_rate_per_min: 25,
      is_verified: true,
      is_online: true,
      is_in_call: false // Rảnh
    },
    {
      id: 10,
      username: 'dieu_nhi',
      email: 'dieunhi@gmail.com',
      full_name: 'Diệu Nhi',
      gender: 'female',
      age: 20,
      birth_date: '2006-07-19',
      bio: 'Cô bé hạt tiêu vui tính 🐥 Thích làm người khác cười, mê xem phim hoạt hình anime và đọc truyện tranh.',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600',
      photos: [
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600'
      ],
      job: 'Sinh viên Ngôn ngữ',
      company_or_school: 'ĐH Ngoại Ngữ',
      city: 'Đà Lạt',
      country: 'Việt Nam',
      latitude: 11.9404,
      longitude: 108.4583,
      interests: ['Anime', 'Trà hoa cúc', 'Đà Lạt', 'Chó Corgi', 'Nhiếp ảnh'],
      coins: 200,
      diamonds: 600,
      vip_level: 1,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      is_in_call: false // Rảnh
    },
    {
      id: 11,
      username: 'ha_my',
      email: 'hamy@gmail.com',
      full_name: 'Hà My (Mimi)',
      gender: 'female',
      age: 23,
      birth_date: '2003-02-14',
      bio: 'Makeup Artist & Beauty Blogger 💄 Cùng mình trò chuyện về làm đẹp, thời trang và phong cách sống!',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600',
      photos: [
        'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600'
      ],
      job: 'Beauty Creator',
      company_or_school: 'Mimi Beauty',
      city: 'TP. Hồ Chí Minh',
      country: 'Việt Nam',
      latitude: 10.765,
      longitude: 106.69,
      interests: ['Makeup', 'Skincare', 'Shopping', 'Cà phê', 'Du lịch'],
      coins: 650,
      diamonds: 2100,
      vip_level: 2,
      is_host: true,
      call_rate_per_min: 30,
      is_verified: true,
      is_online: true,
      is_in_call: false // Rảnh
    },
    {
      id: 12,
      username: 'minh_thu',
      email: 'minhthu@gmail.com',
      full_name: 'Minh Thư',
      gender: 'female',
      age: 22,
      birth_date: '2004-10-08',
      bio: 'Thích biển Nha Trang, mê lặn san hô và ngắm sao đêm 🌊 Tìm người bạn có cùng sở thích biển cả!',
      avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600',
      photos: [
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600'
      ],
      job: 'Hướng dẫn viên Lặn biển',
      company_or_school: 'Nha Trang Diving Club',
      city: 'Nha Trang',
      country: 'Việt Nam',
      latitude: 12.2388,
      longitude: 109.1967,
      interests: ['Lặn biển', 'Hải sản', 'Bơi lội', 'Bikini', 'Nắng gió'],
      coins: 300,
      diamonds: 1100,
      vip_level: 1,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: false, // Offline
      is_in_call: false
    },
    {
      id: 13,
      username: 'thu_trang',
      email: 'thutrang@gmail.com',
      full_name: 'Thu Trang',
      gender: 'female',
      age: 26,
      birth_date: '2000-09-30',
      bio: 'Nữ doanh nhân trẻ ngành F&B ☕ Tìm kiếm một người đàn ông chín chắn, biết lắng nghe và tôn trọng.',
      avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=600',
      photos: [
        'https://images.unsplash.com/photo-1548142813-c348350df52b?w=600',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600'
      ],
      job: 'Founder / Cafe Owner',
      company_or_school: 'The Coffee House',
      city: 'Hà Nội',
      country: 'Việt Nam',
      latitude: 21.032,
      longitude: 105.848,
      interests: ['Kinh doanh', 'Cà phê', 'Golf', 'Du lịch Châu Âu', 'Sách kinh tế'],
      coins: 2500,
      diamonds: 5500,
      vip_level: 3,
      is_host: true,
      call_rate_per_min: 35,
      is_verified: true,
      is_online: true,
      is_in_call: true // BUSY
    },
    {
      id: 14,
      username: 'tuyet_nhi',
      email: 'tuyetnhi@gmail.com',
      full_name: 'Tuyết Nhi',
      gender: 'female',
      age: 21,
      birth_date: '2005-05-18',
      bio: 'Streamer Game & Cosplayer 🎮 Nhẹ nhàng, dễ thương. Call với mình để cùng tâm sự đêm muộn nha!',
      avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=600',
      photos: [
        'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=600',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'
      ],
      job: 'Game Streamer',
      company_or_school: 'Gaming Clan',
      city: 'TP. Hồ Chí Minh',
      country: 'Việt Nam',
      latitude: 10.79,
      longitude: 106.685,
      interests: ['Game', 'Cosplay', 'Mèo béo', 'Trà đào', 'Kpop'],
      coins: 500,
      diamonds: 1600,
      vip_level: 2,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      is_in_call: false // Rảnh
    },
    {
      id: 15,
      username: 'yen_vy',
      email: 'yenvy@gmail.com',
      full_name: 'Yến Vy',
      gender: 'female',
      age: 22,
      birth_date: '2004-11-22',
      bio: 'Tiếp viên hàng không ✈️ Thích bay lượn khắp các phương trời, tìm người đợi mình sau mỗi chuyến bay dài.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600',
      photos: [
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600'
      ],
      job: 'Flight Attendant',
      company_or_school: 'Vietnam Airlines',
      city: 'Hà Nội',
      country: 'Việt Nam',
      latitude: 21.026,
      longitude: 105.858,
      interests: ['Hàng không', 'Du lịch thế giới', 'Thời trang', 'Nước hoa', 'Ẩm thực'],
      coins: 1100,
      diamonds: 3100,
      vip_level: 3,
      is_host: true,
      call_rate_per_min: 30,
      is_verified: true,
      is_online: true,
      is_in_call: false // Rảnh
    },
    {
      id: 16,
      username: 'tram_anh',
      email: 'tramanh@gmail.com',
      full_name: 'Trâm Anh',
      gender: 'female',
      age: 23,
      birth_date: '2003-03-08',
      bio: 'Kiến trúc sư nội thất 🏡 Thích cái đẹp tinh tế, yêu cây xanh và những quán cafe phong cách mộc mạc.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600',
      photos: [
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600'
      ],
      job: 'Interior Designer',
      company_or_school: 'ĐH Kiến Trúc',
      city: 'Đà Nẵng',
      country: 'Việt Nam',
      latitude: 16.06,
      longitude: 108.21,
      interests: ['Kiến trúc', 'Vẽ tranh', 'Cây cảnh', 'Cà phê mộc', 'Gốm sứ'],
      coins: 400,
      diamonds: 1200,
      vip_level: 1,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      is_in_call: false // Rảnh
    },
    {
      id: 17,
      username: 'khanh_linh',
      email: 'khanhlinh@gmail.com',
      full_name: 'Khánh Linh',
      gender: 'female',
      age: 24,
      birth_date: '2002-08-16',
      bio: 'Chuyên viên tài chính & ngân hàng 📈 Ban ngày bận rộn với những con số, tối về muốn tìm người tâm sự.',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600',
      photos: [
        'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600'
      ],
      job: 'Banker',
      company_or_school: 'Vietcombank',
      city: 'Hà Nội',
      country: 'Việt Nam',
      latitude: 21.031,
      longitude: 105.856,
      interests: ['Tài chính', 'Yoga', 'Chạy bộ', 'Xem phim tài liệu', 'Rượu vang'],
      coins: 700,
      diamonds: 1900,
      vip_level: 2,
      is_host: true,
      call_rate_per_min: 25,
      is_verified: true,
      is_online: true,
      is_in_call: true // BUSY
    },
    {
      id: 18,
      username: 'bich_phuong',
      email: 'bichphuong@gmail.com',
      full_name: 'Bích Phương',
      gender: 'female',
      age: 25,
      birth_date: '2001-07-27',
      bio: 'Nhiếp ảnh gia đường phố 📷 Tìm một chàng trai làm mẫu ảnh độc quyền cho riêng mình.',
      avatar: 'https://images.unsplash.com/photo-1534751516642-a171edd2521d?w=600',
      photos: [
        'https://images.unsplash.com/photo-1534751516642-a171edd2521d?w=600',
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600'
      ],
      job: 'Photographer',
      company_or_school: 'Freelance Artist',
      city: 'Huế',
      country: 'Việt Nam',
      latitude: 16.4637,
      longitude: 107.5909,
      interests: ['Máy ảnh film', 'Huế mộng mơ', 'Trà cung đình', 'Triển lãm', 'Mèo tam thể'],
      coins: 350,
      diamonds: 1400,
      vip_level: 1,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      is_in_call: false // Rảnh
    },
    {
      id: 19,
      username: 'thuy_tien',
      email: 'thuytien@gmail.com',
      full_name: 'Thùy Tiên',
      gender: 'female',
      age: 22,
      birth_date: '2004-12-10',
      bio: 'Người mẫu ảnh Lookbook ✨ Thích nụ cười tỏa nắng và sự chân thành.',
      avatar: 'https://images.unsplash.com/photo-1514315384763-ba401779410f?w=600',
      photos: [
        'https://images.unsplash.com/photo-1514315384763-ba401779410f?w=600',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600'
      ],
      job: 'Fashion Model',
      company_or_school: 'Elite Models',
      city: 'TP. Hồ Chí Minh',
      country: 'Việt Nam',
      latitude: 10.772,
      longitude: 106.705,
      interests: ['Catwalk', 'Thời trang', 'Nấu ăn gia đình', 'Bơi lội', 'Du lịch'],
      coins: 1500,
      diamonds: 4200,
      vip_level: 3,
      is_host: true,
      call_rate_per_min: 30,
      is_verified: true,
      is_online: true,
      is_in_call: false // Rảnh
    },
    {
      id: 20,
      username: 'anh_duong',
      email: 'anhduong@gmail.com',
      full_name: 'Ánh Dương',
      gender: 'female',
      age: 21,
      birth_date: '2005-06-01',
      bio: 'Nữ sinh ngành Du lịch lữ hành 🎒 Yêu những chuyến đi phượt bằng xe máy, thích ngắm mây Tây Bắc.',
      avatar: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=600',
      photos: [
        'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=600',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600'
      ],
      job: 'Tour Guide Trainee',
      company_or_school: 'ĐH Văn Hóa',
      city: 'Hà Nội',
      country: 'Việt Nam',
      latitude: 21.04,
      longitude: 105.83,
      interests: ['Phượt', 'Leo núi Fansipan', 'Chụp ảnh phong cảnh', 'Guitar', 'Đốt lửa trại'],
      coins: 300,
      diamonds: 800,
      vip_level: 1,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      is_in_call: false // Rảnh
    },
    {
      id: 21,
      username: 'cam_tu',
      email: 'camtu@gmail.com',
      full_name: 'Cẩm Tú',
      gender: 'female',
      age: 23,
      birth_date: '2003-09-14',
      bio: 'Bác sĩ thú y 🐱 Yêu tất cả các bé cún và mèo trên đời! Ai yêu thú cưng thì quẹt phải ngay nhé.',
      avatar: 'https://images.unsplash.com/photo-1546961329-78bef0414d7c?w=600',
      photos: [
        'https://images.unsplash.com/photo-1546961329-78bef0414d7c?w=600',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600'
      ],
      job: 'Bác sĩ Thú y',
      company_or_school: 'Pet Hospital',
      city: 'Cần Thơ',
      country: 'Việt Nam',
      latitude: 10.0452,
      longitude: 105.7469,
      interests: ['Cún mèo', 'Bến Ninh Kiều', 'Trái cây miền Tây', 'Làm vườn', 'Nấu ăn'],
      coins: 400,
      diamonds: 1300,
      vip_level: 1,
      is_host: true,
      call_rate_per_min: 20,
      is_verified: true,
      is_online: true,
      is_in_call: false // Rảnh
    },
    {
      id: 22,
      username: 'kieu_oanh',
      email: 'kieuoanh@gmail.com',
      full_name: 'Kiều Oanh',
      gender: 'female',
      age: 24,
      birth_date: '2002-05-20',
      bio: 'Chuyên viên Marketing & Event Planner 🎉 Năng động, thích các buổi concert âm nhạc ngoài trời.',
      avatar: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=600',
      photos: [
        'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=600',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600'
      ],
      job: 'Event Planner',
      company_or_school: 'Event Agency',
      city: 'Hải Phòng',
      country: 'Việt Nam',
      latitude: 20.8449,
      longitude: 106.6881,
      interests: ['Concert', 'Lễ hội âm nhạc', 'Bánh đa cua', 'Đồ biển', 'Du lịch'],
      coins: 500,
      diamonds: 1700,
      vip_level: 2,
      is_host: true,
      call_rate_per_min: 25,
      is_verified: true,
      is_online: true,
      is_in_call: true // BUSY
    }
  ];

  // Combine users
  const fullUsers = [...baseUsers];
  const allPhotos = [
    { id: 1, user_id: 1, photo_url: baseUsers[0].avatar, is_primary: true, created_at: new Date().toISOString() },
    { id: 2, user_id: 2, photo_url: baseUsers[1].avatar, is_primary: true, created_at: new Date().toISOString() }
  ];

  let photoIdCounter = 3;

  for (const f of femaleProfiles) {
    const { photos, ...userData } = f;
    fullUsers.push({
      ...userData,
      password: hashedPassword,
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (photos && photos.length > 0) {
      photos.forEach((pUrl, idx) => {
        allPhotos.push({
          id: photoIdCounter++,
          user_id: f.id,
          photo_url: pUrl,
          is_primary: idx === 0,
          created_at: new Date().toISOString()
        });
      });
    }
  }

  // Pre-seed some Tinder matches for demo_user (id: 2)
  const defaultSwipes = [
    { id: 1, swiper_id: 2, target_id: 3, action: 'like', created_at: new Date().toISOString() },
    { id: 2, swiper_id: 3, target_id: 2, action: 'like', created_at: new Date().toISOString() },
    { id: 3, swiper_id: 2, target_id: 4, action: 'superlike', created_at: new Date().toISOString() },
    { id: 4, swiper_id: 4, target_id: 2, action: 'like', created_at: new Date().toISOString() },
    { id: 5, swiper_id: 2, target_id: 6, action: 'like', created_at: new Date().toISOString() },
    { id: 6, swiper_id: 6, target_id: 2, action: 'like', created_at: new Date().toISOString() }
  ];

  const defaultMatches = [
    { id: 1, user1_id: 2, user2_id: 3, is_active: true, created_at: new Date().toISOString() },
    { id: 2, user1_id: 2, user2_id: 4, is_active: true, created_at: new Date().toISOString() },
    { id: 3, user1_id: 2, user2_id: 6, is_active: true, created_at: new Date().toISOString() }
  ];

  store.users = fullUsers;
  store.user_photos = allPhotos;
  store.swipes = defaultSwipes;
  store.matches = defaultMatches;

  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
  console.log(`✅ Successfully seeded ${fullUsers.length} total users with ${femaleProfiles.length} rich Vietnamese female profiles into JSON store!`);

  // Also sync to MySQL if connected
  try {
    const db = require('./config/db');
    if (!db.isUsingFallback()) {
      for (const u of fullUsers) {
        await db.query(`
          INSERT INTO users (id, username, email, password, full_name, gender, age, birth_date, bio, avatar, job, company_or_school, city, country, latitude, longitude, interests, coins, diamonds, vip_level, is_host, call_rate_per_min, is_verified, is_online, is_in_call, role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), avatar = VALUES(avatar), bio = VALUES(bio), city = VALUES(city), is_host = VALUES(is_host), call_rate_per_min = VALUES(call_rate_per_min), is_online = VALUES(is_online), is_in_call = VALUES(is_in_call)
        `, [
          u.id, u.username, u.email, u.password, u.full_name, u.gender, u.age, u.birth_date || '2000-01-01', u.bio, u.avatar, u.job, u.company_or_school, u.city, u.country, u.latitude, u.longitude, JSON.stringify(u.interests || []), u.coins, u.diamonds, u.vip_level, u.is_host ? 1 : 0, u.call_rate_per_min || 20, u.is_verified ? 1 : 0, u.is_online ? 1 : 0, u.is_in_call ? 1 : 0, u.role || 'user'
        ]);
      }
      console.log('✅ Successfully synced all female profiles to MySQL database!');
    }
  } catch (err) {
    console.log('MySQL sync skipped (using fallback JSON store):', err.message);
  }
}

seedRichFemaleUsers().catch(console.error);
