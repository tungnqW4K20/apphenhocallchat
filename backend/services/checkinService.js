/**
 * Daily Check-in & Voucher Inventory Service
 * Manages 7-day consecutive check-in streaks, free 2-min call vouchers,
 * free chat passes, coin rewards, and inventory consumption.
 */

class CheckinService {
  constructor() {
    // 7-day check-in reward structure
    this.REWARDS_CONFIG = [
      {
        day: 1,
        title: '30 Xu Thưởng',
        type: 'coins',
        amount: 30,
        icon: '🪙',
        description: 'Cộng ngay 30 Xu vào ví'
      },
      {
        day: 2,
        title: 'Vé Nhắn Tin Free 24h',
        type: 'voucher',
        voucher_type: 'free_chat',
        amount: 1,
        duration_hours: 24,
        icon: '💬',
        description: 'Nhắn tin không tốn 10 xu/tin trong 24 giờ'
      },
      {
        day: 3,
        title: '50 Xu Thưởng',
        type: 'coins',
        amount: 50,
        icon: '🪙',
        description: 'Cộng ngay 50 Xu vào ví'
      },
      {
        day: 4,
        title: 'Quà Tặng 3D Mini',
        type: 'gift',
        gift_id: 1,
        amount: 1,
        icon: '🌹',
        description: '1 Bông hoa hồng 3D miễn phí tặng Idol'
      },
      {
        day: 5,
        title: '100 Xu Thưởng',
        type: 'coins',
        amount: 100,
        icon: '🪙',
        description: 'Cộng ngay 100 Xu vào ví'
      },
      {
        day: 6,
        title: 'Vé Gọi Free 2 Phút Đầu',
        type: 'voucher',
        voucher_type: 'free_call_2min',
        amount: 1,
        icon: '🎟️',
        description: 'Miễn phí 2 phút đầu cuộc gọi video (phút thứ 3 mới tính phí)'
      },
      {
        day: 7,
        title: 'Gói Quà Kim Cương',
        type: 'combo',
        coins: 200,
        vouchers: [
          { voucher_type: 'free_call_2min', amount: 2 },
          { voucher_type: 'free_chat', amount: 1 }
        ],
        icon: '👑',
        description: '200 Xu + 2 Vé Gọi Free 2 Phút + 1 Vé Nhắn Tin Free'
      }
    ];
  }

  getRewardsConfig() {
    return this.REWARDS_CONFIG;
  }

  /**
   * Check if user can check in today
   */
  canCheckIn(lastCheckInDate) {
    if (!lastCheckInDate) return true;

    const last = new Date(lastCheckInDate);
    const now = new Date();

    // Check if on same calendar day (UTC+7 Vietnam)
    const isSameDay =
      last.getFullYear() === now.getFullYear() &&
      last.getMonth() === now.getMonth() &&
      last.getDate() === now.getDate();

    return !isSameDay;
  }

  /**
   * Calculate current streak day (1 to 7)
   */
  calculateNextStreak(currentStreak, lastCheckInDate) {
    if (!lastCheckInDate) return 1;

    const last = new Date(lastCheckInDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If within 48 hours, advance streak; otherwise reset to day 1
    if (diffDays <= 2) {
      return (currentStreak % 7) + 1;
    } else {
      return 1;
    }
  }
}

module.exports = new CheckinService();
