/**
 * مثال 5: داشبورد کامل معاملاتی
 * 
 * این مثال یک داشبورد کامل با تمام قابلیت‌ها را نمایش می‌دهد
 */

import { CryptoDataClient, CryptoAPIError } from '../crypto-client';

async function completeDashboard() {
  console.clear();
  console.log('🎯 داشبورد کامل معاملاتی کریپتو\n');
  console.log('='.repeat(70));
  
  const client = new CryptoDataClient();
  const symbol = 'BTC';
  
  try {
    // بررسی سلامت سرویس
    console.log('\n🏥 بررسی سلامت سیستم...');
    const health = await client.health();
    console.log(`   ✅ سرویس فعال است (نسخه ${health.version})`);
    
    // نمای کلی بازار
    console.log('\n📊 نمای کلی بازار جهانی');
    console.log('-'.repeat(70));
    const market = await client.getMarket();
    console.log(`   💰 ارزش کل بازار:      $${(market.total_market_cap / 1e12).toFixed(3)} تریلیون`);
    console.log(`   📈 حجم 24 ساعته:        $${(market.total_volume / 1e9).toFixed(2)} میلیارد`);
    console.log(`   ₿  تسلط بیت‌کوین:      ${market.btc_dominance.toFixed(2)}%`);
    console.log(`   Ξ  تسلط اتریوم:         ${market.eth_dominance.toFixed(2)}%`);
    
    // قیمت‌های فعلی
    console.log('\n💹 قیمت‌های فعلی');
    console.log('-'.repeat(70));
    const pairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'];
    const rates = await client.getBatchRates(pairs);
    
    rates.rates.forEach(rate => {
      const arrow = rate.change24h > 0 ? '📈' : '📉';
      const color = rate.change24h > 0 ? '+' : '';
      console.log(
        `   ${rate.pair.padEnd(12)} $${rate.price.toLocaleString().padStart(15)} ` +
        `${arrow} ${color}${rate.change24h.toFixed(2)}%`
      );
    });
    
    // احساسات بازار
    console.log('\n🎭 تحلیل احساسات');
    console.log('-'.repeat(70));
    const sentiment = await client.getGlobalSentiment('1D');
    
    const sentimentDetails = {
      'extreme_fear': { emoji: '😱', text: 'ترس شدید', color: 'قرمز' },
      'fear': { emoji: '😨', text: 'ترس', color: 'نارنجی' },
      'neutral': { emoji: '😐', text: 'خنثی', color: 'زرد' },
      'greed': { emoji: '😊', text: 'طمع', color: 'سبز روشن' },
      'extreme_greed': { emoji: '🤑', text: 'طمع شدید', color: 'سبز' }
    }[sentiment.sentiment] || { emoji: '😐', text: 'نامشخص', color: 'خاکستری' };
    
    console.log(`   ${sentimentDetails.emoji} احساس کلی:          ${sentimentDetails.text}`);
    console.log(`   📊 شاخص ترس و طمع:    ${sentiment.fear_greed_index}/100`);
    console.log(`   🎯 سطح اطمینان:       ${(sentiment.confidence * 100).toFixed(1)}%`);
    
    // سیگنال‌های AI
    console.log('\n🤖 سیگنال‌های معاملاتی AI');
    console.log('-'.repeat(70));
    const signals = await client.getSignals(symbol);
    
    if (signals.count > 0) {
      const latestSignals = signals.signals.slice(0, 3);
      latestSignals.forEach((signal, index) => {
        const typeEmoji = {
          'buy': '🟢 خرید',
          'sell': '🔴 فروش',
          'hold': '🟡 نگهداری'
        }[signal.type] || '⚪ نامشخص';
        
        console.log(`\n   سیگنال ${index + 1}: ${typeEmoji}`);
        console.log(`   امتیاز: ${signal.score.toFixed(2)} | اطمینان: ${(signal.confidence * 100).toFixed(1)}%`);
      });
    } else {
      console.log('   ℹ️  سیگنالی موجود نیست');
    }
    
    // تصمیم AI
    console.log('\n\n🎯 تصمیم معاملاتی AI برای BTC');
    console.log('-'.repeat(70));
    const decision = await client.getDecision({
      symbol: symbol,
      horizon: 'swing',
      risk_tolerance: 'moderate'
    });
    
    const decisionEmoji = {
      'BUY': '🟢',
      'SELL': '🔴',
      'HOLD': '🟡'
    }[decision.decision] || '⚪';
    
    console.log(`\n   ${decisionEmoji} تصمیم نهایی:        ${decision.decision}`);
    console.log(`   📊 سطح اطمینان:       ${(decision.confidence * 100).toFixed(1)}%`);
    console.log(`\n   💡 توصیه:\n      ${decision.summary}`);
    
    console.log(`\n   🎯 اهداف قیمتی:`);
    console.log(`      حمایت:    $${decision.targets.support.toLocaleString()}`);
    console.log(`      مقاومت:   $${decision.targets.resistance.toLocaleString()}`);
    console.log(`      هدف:      $${decision.targets.target.toLocaleString()}`);
    
    if (decision.risks.length > 0) {
      console.log(`\n   ⚠️  ریسک‌های احتمالی:`);
      decision.risks.forEach(risk => {
        console.log(`      • ${risk}`);
      });
    }
    
    // اخبار
    console.log('\n\n📰 آخرین اخبار');
    console.log('-'.repeat(70));
    const news = await client.getLatestNews(3);
    
    news.articles.forEach((article, index) => {
      console.log(`\n   ${index + 1}. ${article.title}`);
      console.log(`      منبع: ${article.source} | ${new Date(article.published_at).toLocaleString('fa-IR')}`);
      if (article.tags.length > 0) {
        console.log(`      تگ‌ها: ${article.tags.slice(0, 3).join(', ')}`);
      }
    });
    
    // منابع و Providers
    console.log('\n\n🔌 منابع و ارائه‌دهندگان');
    console.log('-'.repeat(70));
    
    try {
      const providers = await client.getProviders();
      const onlineProviders = providers.providers.filter(p => p.status === 'online');
      console.log(`   ✅ ارائه‌دهندگان فعال:  ${onlineProviders.length}/${providers.count}`);
      
      providers.providers.slice(0, 5).forEach(provider => {
        const statusEmoji = {
          'online': '🟢',
          'offline': '🔴',
          'degraded': '🟡'
        }[provider.status] || '⚪';
        
        console.log(`   ${statusEmoji} ${provider.name.padEnd(20)} (${provider.type})`);
      });
    } catch (error) {
      console.log('   ℹ️  اطلاعات ارائه‌دهندگان موجود نیست');
    }
    
    // خلاصه نهایی
    console.log('\n\n📈 خلاصه و توصیه نهایی');
    console.log('-'.repeat(70));
    
    const btcRate = rates.rates.find(r => r.pair === 'BTC/USDT');
    if (btcRate) {
      const trend = btcRate.change24h > 2 ? 'صعودی قوی' :
                   btcRate.change24h > 0 ? 'صعودی ملایم' :
                   btcRate.change24h > -2 ? 'نزولی ملایم' : 'نزولی قوی';
      
      console.log(`   🎯 روند فعلی بازار:    ${trend}`);
      console.log(`   💰 قیمت BTC:            $${btcRate.price.toLocaleString()}`);
      console.log(`   🎭 احساس بازار:        ${sentimentDetails.text}`);
      console.log(`   🤖 توصیه AI:            ${decision.decision}`);
      
      // توصیه نهایی بر اساس داده‌ها
      let finalRecommendation = '';
      if (decision.decision === 'BUY' && sentiment.fear_greed_index < 40) {
        finalRecommendation = '✅ فرصت خرید مناسب - بازار در حالت ترس است';
      } else if (decision.decision === 'SELL' && sentiment.fear_greed_index > 60) {
        finalRecommendation = '⚠️ احتمال اصلاح - بازار در حالت طمع است';
      } else if (decision.decision === 'HOLD') {
        finalRecommendation = '🟡 صبر و نظاره - موقعیت مناسبی برای ورود نیست';
      } else {
        finalRecommendation = 'ℹ️ تصمیم‌گیری با احتیاط - سیگنال‌های مختلط';
      }
      
      console.log(`\n   💡 نتیجه‌گیری:\n      ${finalRecommendation}`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ داشبورد با موفقیت بارگذاری شد');
    console.log(`   🕐 زمان به‌روزرسانی: ${new Date().toLocaleString('fa-IR')}`);
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('\n❌ خطا در بارگذاری داشبورد:');
    if (error instanceof CryptoAPIError) {
      console.error(`   پیام: ${error.message}`);
      console.error(`   کد وضعیت: ${error.statusCode}`);
      console.error(`   Endpoint: ${error.endpoint}`);
    } else {
      console.error(`   ${error}`);
    }
    throw error;
  }
}

// اجرای داشبورد
if (require.main === module) {
  console.log('🚀 در حال راه‌اندازی داشبورد...\n');
  
  completeDashboard()
    .then(() => {
      console.log('\n💡 برای نمایش مجدد داشبورد، برنامه را دوباره اجرا کنید');
      process.exit(0);
    })
    .catch(() => {
      console.log('\n❌ داشبورد با خطا مواجه شد');
      process.exit(1);
    });
}

export default completeDashboard;
