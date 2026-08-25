/**
 * Security & Anti-Leak Protection Service
 * Handles Watermark Token Generation for anti-screen recording,
 * input sanitization, and security policy enforcement.
 */

const crypto = require('crypto');

class SecurityService {
  /**
   * Generate encrypted watermark payload for video calls
   * The watermark contains user identifiers embedded invisibly/subtly on screen
   */
  generateCallWatermark(userId, userName, role) {
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(4).toString('hex');
    const raw = `${userId}:${userName}:${timestamp}:${nonce}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 8);

    return {
      text: `${userName} (ID:${userId}) • #${hash}`,
      code: hash,
      timestamp,
      userId
    };
  }

  /**
   * Sanitize text input to prevent XSS and SQL injection patterns
   */
  sanitizeText(text) {
    if (typeof text !== 'string') return text;
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  }

  /**
   * Generate a unique bank transfer transaction reference code
   * Format: NAP{amount_in_k}K_U{userId}_{random}
   * Example: NAP50K_U2_893A
   */
  generateDepositCode(userId, amountVnd) {
    const kAmount = Math.round(amountVnd / 1000);
    const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `NAP${kAmount}K_U${userId}_${rand}`;
  }
}

module.exports = new SecurityService();
