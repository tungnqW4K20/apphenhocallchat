-- Database Schema for Dating & Video Call Chat (Tinder + AyarChat)
CREATE DATABASE IF NOT EXISTS `dating_callchat` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `dating_callchat`;

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `email` VARCHAR(100) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `gender` ENUM('male', 'female', 'other') DEFAULT 'male',
  `birth_date` DATE NULL,
  `age` INT DEFAULT 22,
  `bio` TEXT NULL,
  `avatar` VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  `job` VARCHAR(100) DEFAULT 'Designer',
  `company_or_school` VARCHAR(100) DEFAULT 'Đại học Quốc Gia',
  `city` VARCHAR(100) DEFAULT 'Hà Nội',
  `country` VARCHAR(100) DEFAULT 'Việt Nam',
  `latitude` DECIMAL(10, 8) DEFAULT 21.0285,
  `longitude` DECIMAL(11, 8) DEFAULT 105.8542,
  `interests` JSON NULL, -- e.g. ["Du lịch", "Cà phê", "Âm nhạc", "Gym", "Nấu ăn"]
  `coins` INT DEFAULT 200, -- Xu dùng để gọi video & tặng quà
  `diamonds` INT DEFAULT 0, -- Kim cương nhận từ quà/gọi (có thể rút tiền)
  `vip_level` INT DEFAULT 0, -- 0: Normal, 1: Silver, 2: Gold, 3: Platinum
  `vip_expires_at` DATETIME NULL,
  `is_host` BOOLEAN DEFAULT FALSE, -- Có phải idol/host nhận cuộc gọi không
  `call_rate_per_min` INT DEFAULT 20, -- Giá cước xu/phút nếu là host
  `is_verified` BOOLEAN DEFAULT FALSE, -- Tích xanh đã xác minh
  `is_online` BOOLEAN DEFAULT FALSE,
  `is_in_call` BOOLEAN DEFAULT FALSE,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `is_banned` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Photos Table (Tinder Album)
CREATE TABLE IF NOT EXISTS `user_photos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `photo_url` VARCHAR(255) NOT NULL,
  `is_primary` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Swipes Table (Tinder Mechanism)
CREATE TABLE IF NOT EXISTS `swipes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `swiper_id` INT NOT NULL,
  `target_id` INT NOT NULL,
  `action` ENUM('like', 'pass', 'superlike') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_swipe` (`swiper_id`, `target_id`),
  FOREIGN KEY (`swiper_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`target_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Matches Table
CREATE TABLE IF NOT EXISTS `matches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user1_id` INT NOT NULL,
  `user2_id` INT NOT NULL,
  `matched_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `is_active` BOOLEAN DEFAULT TRUE,
  UNIQUE KEY `unique_match` (`user1_id`, `user2_id`),
  FOREIGN KEY (`user1_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user2_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Conversations Table
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user1_id` INT NOT NULL,
  `user2_id` INT NOT NULL,
  `last_message` LONGTEXT NULL,
  `last_message_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_conversation` (`user1_id`, `user2_id`),
  FOREIGN KEY (`user1_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user2_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Messages Table
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` INT NOT NULL,
  `sender_id` INT NOT NULL,
  `receiver_id` INT NOT NULL,
  `message_type` ENUM('text', 'image', 'audio', 'gift', 'call_notice') DEFAULT 'text',
  `content` LONGTEXT NOT NULL,
  `metadata` JSON NULL, -- Gift ID, call duration, audio duration, etc.
  `is_read` BOOLEAN DEFAULT FALSE,
  `is_recalled` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Gifts Catalog Table (AyarChat)
CREATE TABLE IF NOT EXISTS `gifts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(255) NOT NULL,
  `animation_type` VARCHAR(50) DEFAULT 'floating', -- floating, full_screen, blast, fireworks
  `coin_price` INT NOT NULL DEFAULT 10,
  `diamond_reward` INT NOT NULL DEFAULT 7, -- Idol nhận lại bao nhiêu kim cương
  `category` VARCHAR(50) DEFAULT 'popular', -- popular, romantic, luxury, vip
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Call Logs Table (AyarChat 1v1 & Random Calls)
CREATE TABLE IF NOT EXISTS `call_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `caller_id` INT NOT NULL,
  `receiver_id` INT NOT NULL,
  `call_type` ENUM('random_video', 'direct_video', 'voice_call') DEFAULT 'direct_video',
  `duration_seconds` INT DEFAULT 0,
  `coins_spent` INT DEFAULT 0,
  `diamonds_earned` INT DEFAULT 0,
  `status` ENUM('completed', 'missed', 'declined', 'canceled', 'insufficient_coins') DEFAULT 'completed',
  `started_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `ended_at` TIMESTAMP NULL,
  FOREIGN KEY (`caller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Coin Packages Table
CREATE TABLE IF NOT EXISTS `coin_packages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `coins` INT NOT NULL,
  `bonus_coins` INT DEFAULT 0,
  `price_vnd` INT NOT NULL,
  `badge` VARCHAR(50) NULL, -- 'HOT', 'BEST CHOICE', 'POPULAR'
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table (Nạp xu & Rút tiền)
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `type` ENUM('deposit', 'withdrawal', 'gift_sent', 'gift_received', 'call_spent', 'call_earned', 'vip_purchase') NOT NULL,
  `amount` INT NOT NULL, -- Số xu hoặc kim cương
  `money_amount` INT DEFAULT 0, -- Số tiền VND nếu nạp/rút
  `status` ENUM('pending', 'completed', 'rejected') DEFAULT 'completed',
  `payment_method` VARCHAR(50) DEFAULT 'Momo/Bank',
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- KYC Verification Requests
CREATE TABLE IF NOT EXISTS `verifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `selfie_photo` VARCHAR(255) NOT NULL,
  `id_card_photo` VARCHAR(255) NULL,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `admin_note` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Reports Table
CREATE TABLE IF NOT EXISTS `reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `reporter_id` INT NOT NULL,
  `reported_id` INT NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `details` TEXT NULL,
  `status` ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reported_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Follows Table (Theo Dõi & Bạn Bè)
CREATE TABLE IF NOT EXISTS `follows` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `follower_id` INT NOT NULL,
  `following_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_follow` (`follower_id`, `following_id`),
  FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- System Settings
CREATE TABLE IF NOT EXISTS `system_settings` (
  `key_name` VARCHAR(50) PRIMARY KEY,
  `value` TEXT NOT NULL,
  `description` VARCHAR(255) NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- VietQR Bank Deposits
CREATE TABLE IF NOT EXISTS `deposits` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `package_id` INT NOT NULL,
  `transaction_code` VARCHAR(50) UNIQUE NOT NULL,
  `money_amount` INT NOT NULL,
  `coins_amount` INT NOT NULL,
  `bonus_coins` INT DEFAULT 0,
  `total_coins` INT NOT NULL,
  `bank_name` VARCHAR(50) DEFAULT 'MBBank',
  `bank_account` VARCHAR(50) DEFAULT '999988886666',
  `bank_holder` VARCHAR(100) DEFAULT 'CONG TY CP AYARFLAME VIETNAM',
  `status` ENUM('pending', 'completed', 'rejected') DEFAULT 'pending',
  `payment_method` VARCHAR(100) DEFAULT 'VietQR Banking',
  `admin_note` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reviewed_at` TIMESTAMP NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- User Vouchers
CREATE TABLE IF NOT EXISTS `vouchers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `voucher_type` ENUM('free_call_2min', 'free_chat', 'custom') NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `amount` INT DEFAULT 1,
  `expires_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Daily Check-ins
CREATE TABLE IF NOT EXISTS `daily_checkins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `streak_days` INT DEFAULT 1,
  `checkin_date` DATE NOT NULL,
  `reward_summary` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_checkin_date` (`user_id`, `checkin_date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);


