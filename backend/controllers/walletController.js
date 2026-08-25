const dataService = require('../models/dataService');

const getCoinPackages = async (req, res) => {
  try {
    const packages = await dataService.getCoinPackages();
    return res.json({ success: true, packages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getBankTransferInfo = async (req, res) => {
  try {
    const settings = await dataService.getSystemSettings();
    return res.json({
      success: true,
      bank_name: settings.bank_name || 'MBBank',
      bank_account: settings.bank_account || '999988886666',
      bank_holder: settings.bank_holder || 'CONG TY CP AYARFLAME VIETNAM',
      vietqr_template: settings.vietqr_template || 'compact2'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await dataService.getUserTransactions(req.user.id);
    return res.json({ success: true, transactions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create a pending VietQR deposit request
const createDepositRequest = async (req, res) => {
  try {
    const { package_id } = req.body;
    const packages = await dataService.getCoinPackages();
    const pkg = packages.find(p => p.id === Number(package_id));

    if (!pkg) {
      return res.status(400).json({ success: false, message: 'Gói xu không hợp lệ' });
    }

    const deposit = await dataService.createDepositRequest({
      user_id: req.user.id,
      package_id: pkg.id,
      money_amount: pkg.price_vnd,
      coins_amount: pkg.coins,
      bonus_coins: pkg.bonus_coins || 0
    });

    const settings = await dataService.getSystemSettings();
    const bankName = deposit.bank_name || settings.bank_name || 'MBBank';
    const bankAccount = deposit.bank_account || settings.bank_account || '999988886666';
    const bankHolder = deposit.bank_holder || settings.bank_holder || 'CONG TY CP AYARFLAME VIETNAM';

    // VietQR URL
    const qrUrl = `https://img.vietqr.io/image/${bankName}-${bankAccount}-${settings.vietqr_template || 'compact2'}.png?amount=${deposit.money_amount}&addInfo=${deposit.transaction_code}&accountName=${encodeURIComponent(bankHolder)}`;

    return res.json({
      success: true,
      message: 'Tạo đơn nạp tiền VietQR thành công! Vui lòng quét mã để chuyển khoản.',
      deposit,
      qr_url: qrUrl,
      payment_instructions: {
        bank_name: bankName,
        account_number: bankAccount,
        account_holder: bankHolder,
        amount: deposit.money_amount,
        transfer_content: deposit.transaction_code,
        note: 'Vui lòng ghi chính xác nội dung chuyển khoản để hệ thống cộng xu nhanh nhất.'
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// User notifies they have transferred money
const confirmDepositSent = async (req, res) => {
  try {
    const { deposit_id } = req.body;
    return res.json({
      success: true,
      message: 'Đã ghi nhận thông báo chuyển khoản! Quản trị viên đang kiểm tra và sẽ cộng xu cho bạn ngay sau khi nhận tiền.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Direct Simulation for Demo / Test purpose
const depositCoins = async (req, res) => {
  try {
    const { package_id, payment_method } = req.body;
    const packages = await dataService.getCoinPackages();
    const pkg = packages.find(p => p.id === Number(package_id));

    if (!pkg) {
      return res.status(400).json({ success: false, message: 'Gói xu không hợp lệ' });
    }

    const totalCoins = pkg.coins + (pkg.bonus_coins || 0);

    // Create deposit record as completed directly for simulation
    const deposit = await dataService.createDepositRequest({
      user_id: req.user.id,
      package_id: pkg.id,
      money_amount: pkg.price_vnd,
      coins_amount: pkg.coins,
      bonus_coins: pkg.bonus_coins || 0,
      payment_method: payment_method || 'Mô phỏng Thanh toán Test'
    });

    await dataService.approveDeposit(deposit.id, 'Thanh toán mô phỏng tự động');
    const user = await dataService.findUserById(req.user.id);

    return res.json({
      success: true,
      message: `Nạp thành công ${totalCoins} Xu vào tài khoản! 🎉`,
      new_coins: user.coins
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const buyVip = async (req, res) => {
  try {
    const { vip_level, months = 1 } = req.body;
    const level = Number(vip_level);

    const prices = { 1: 300, 2: 700, 3: 1500 }; // in coins
    const cost = (prices[level] || 500) * Number(months);

    const user = await dataService.findUserById(req.user.id);
    if (user.coins < cost) {
      return res.status(400).json({ success: false, message: `Bạn cần ${cost} Xu để kích hoạt gói VIP này. Vui lòng nạp thêm Xu!` });
    }

    await dataService.updateUserBalance(req.user.id, -cost, 0);

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + Number(months));

    await dataService.updateUser(req.user.id, {
      vip_level: level,
      vip_expires_at: expiresAt.toISOString()
    });

    await dataService.createTransaction({
      user_id: req.user.id,
      type: 'vip_purchase',
      amount: cost,
      description: `Kích hoạt gói VIP ${level === 1 ? 'Silver' : level === 2 ? 'Gold' : 'Platinum'} (${months} tháng)`
    });

    const updatedUser = await dataService.findUserById(req.user.id);
    return res.json({
      success: true,
      message: `Chúc mừng bạn đã nâng cấp VIP thành công! 👑`,
      user: updatedUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const requestWithdrawal = async (req, res) => {
  try {
    const { diamonds, bank_name, account_number, account_holder } = req.body;
    const amount = Number(diamonds);

    if (!amount || amount < 100) {
      return res.status(400).json({ success: false, message: 'Số lượng kim cương tối thiểu để rút là 100' });
    }

    const user = await dataService.findUserById(req.user.id);
    if (user.diamonds < amount) {
      return res.status(400).json({ success: false, message: 'Số dư Kim Cương không đủ' });
    }

    const vndRate = 1000; // 1 diamond = 1,000 VND
    const moneyAmount = amount * vndRate;

    // Deduct diamonds
    await dataService.updateUserBalance(req.user.id, 0, -amount);

    // Record transaction
    await dataService.createTransaction({
      user_id: req.user.id,
      type: 'withdrawal',
      amount: amount,
      money_amount: moneyAmount,
      status: 'pending',
      payment_method: `${bank_name} - ${account_number} (${account_holder})`,
      description: `Yêu cầu rút ${amount} Kim Cương (${moneyAmount.toLocaleString('vi-VN')} đ)`
    });

    const updatedUser = await dataService.findUserById(req.user.id);
    return res.json({
      success: true,
      message: 'Yêu cầu rút tiền đã được gửi! Quản trị viên sẽ xử lý trong 24h.',
      new_diamonds: updatedUser.diamonds
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getCoinPackages, 
  getTransactions, 
  depositCoins, 
  buyVip, 
  requestWithdrawal,
  createDepositRequest,
  getBankTransferInfo,
  confirmDepositSent
};
