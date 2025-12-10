/**
 * مثال 2: کار با داده‌های بازار
 * 
 * این مثال نحوه دریافت و نمایش داده‌های بازار را نشان می‌دهد
 */

import { CryptoDataClient } from '../crypto-client';

async function marketData() {
  console.log('📊 مثال داده‌های بازار\n');
  console.log('='.repeat(60));
  
  const client = new CryptoDataClient();
  
  try {
    // 1. نمای کلی بازار
    console.log('\n1️⃣ نمای کلی بازار جهانی:');
    const market = await client.getMarket();
    console.log(`   💰 ارزش کل بازار: $${(market.total_market_cap / 1e12).toFixed(2)} تریلیون`);
    console.log(`   📊 حجم معاملات 24h: $${(market.total_volume / 1e9).toFixed(2)} میلیارد`);
    console.log(`   ₿ تسلط بیت‌کوین: ${market.btc_dominance.toFixed(2)}%`);
    console.log(`   Ξ تسلط اتریوم: ${market.eth_dominance.toFixed(2)}%`);
    console.log(`   🪙 ارزهای فعال: ${market.active_coins.toLocaleString()}`);
    
    // 2. برترین ارزها
    console.log('\n2️⃣ 10 ارز برتر بازار:');
    const topCoins = await client.getTopCoins(10);
    console.log('\n   رتبه | نام                | قیمت          | تغییر 24h');
    console.log('   ' + '-'.repeat(60));
    
    topCoins.coins.forEach(coin => {
      const changeEmoji = coin.change_24h > 0 ? '📈' : '📉';
      const changePct = coin.change_24h.toFixed(2).padStart(7);
      console.log(
        `   ${coin.rank.toString().padStart(4)} | ` +
        `${coin.name.padEnd(18)} | ` +
        `$${coin.price.toFixed(2).padStart(12)} | ` +
        `${changeEmoji} ${changePct}%`
      );
    });
    
    // 3. ارزهای ترند
    console.log('\n3️⃣ ارزهای ترند:');
    const trending = await client.getTrending();
    trending.coins.slice(0, 5).forEach((coin, index) => {
      console.log(`   ${index + 1}. 🔥 ${coin.name} (${coin.symbol})`);
    });
    
    // 4. نرخ چند ارز
    console.log('\n4️⃣ نرخ ارزهای محبوب:');
    const pairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT'];
    const batchRates = await client.getBatchRates(pairs);
    
    batchRates.rates.forEach(rate => {
      const arrow = rate.change24h > 0 ? '📈' : '📉';
      console.log(
        `   ${rate.pair.padEnd(10)} | ` +
        `$${rate.price.toLocaleString().padEnd(15)} | ` +
        `${arrow} ${rate.change24h.toFixed(2)}%`
      );
    });
    
    // 5. وضعیت بازار
    console.log('\n5️⃣ وضعیت بازار:');
    const marketStatus = await client.getMarketStatus();
    console.log(`   📍 وضعیت: ${marketStatus.status}`);
    console.log(`   🏦 صرافی‌های فعال: ${marketStatus.active_exchanges}`);
    console.log(`   📊 تعداد بازارها: ${marketStatus.markets_count}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ دریافت داده‌های بازار با موفقیت انجام شد!');
    
  } catch (error) {
    console.error('\n❌ خطا در دریافت داده‌های بازار:', error);
    throw error;
  }
}

// اجرای مثال
if (require.main === module) {
  marketData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default marketData;
