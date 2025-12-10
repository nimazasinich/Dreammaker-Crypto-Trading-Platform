/**
 * مثال 1: استفاده پایه از کلاینت
 * 
 * این مثال نحوه استفاده اولیه از کلاینت را نشان می‌دهد
 */

import { CryptoDataClient } from '../crypto-client';

async function basicUsage() {
  console.log('🚀 شروع مثال استفاده پایه\n');
  
  // ایجاد نمونه کلاینت
  const client = new CryptoDataClient();
  
  try {
    // 1. بررسی سلامت سرویس
    console.log('1️⃣ بررسی سلامت سرویس...');
    const health = await client.health();
    console.log('   ✅ وضعیت:', health.status);
    console.log('   📦 نسخه:', health.version);
    console.log('   🕐 زمان:', health.timestamp);
    
    // 2. دریافت وضعیت سیستم
    console.log('\n2️⃣ دریافت وضعیت سیستم...');
    const status = await client.status();
    console.log('   ✅ وضعیت:', status.status);
    console.log('   ⏱️ زمان فعالیت:', status.uptime, 'ثانیه');
    
    // 3. دریافت قیمت بیت‌کوین
    console.log('\n3️⃣ دریافت قیمت بیت‌کوین...');
    const btcRate = await client.getRate('BTC/USDT');
    console.log('   💰 قیمت:', `$${btcRate.price.toLocaleString()}`);
    console.log('   📊 تغییر 24h:', `${btcRate.change24h.toFixed(2)}%`);
    console.log('   📈 حجم 24h:', `$${btcRate.volume24h.toLocaleString()}`);
    
    console.log('\n✅ مثال با موفقیت اجرا شد!');
    
  } catch (error) {
    console.error('\n❌ خطا:', error);
    throw error;
  }
}

// اجرای مثال
if (require.main === module) {
  basicUsage()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default basicUsage;
