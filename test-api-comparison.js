/**
 * تست مقایسه‌ای API پیشنهادی با API موجود
 * این اسکریپت API Hugging Face پیشنهادی را تست می‌کند
 */

import fetch from 'node-fetch';

// تنظیمات
const HF_API_URL = 'https://huggingface.co/spaces/Really-amin/Datasourceforcryptocurrency-2';
const TEST_SYMBOL = 'BTCUSDT';
const TEST_INTERVAL = '1h';
const TEST_LIMIT = 100;

// رنگ‌ها برای خروجی
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80) + '\n');
}

// تابع تست OHLC
async function testOHLC() {
  logSection('🔍 تست 1: دریافت داده OHLCV (کندل استیک)');
  
  const url = `${HF_API_URL}/api/market/ohlc?symbol=${TEST_SYMBOL}&interval=${TEST_INTERVAL}&limit=${TEST_LIMIT}`;
  
  log(`📡 درخواست به: ${url}`, 'blue');
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    const duration = Date.now() - startTime;
    
    log(`⏱️  زمان پاسخ: ${duration}ms`, 'yellow');
    log(`📊 وضعیت HTTP: ${response.status} ${response.statusText}`, 
        response.ok ? 'green' : 'red');
    
    if (!response.ok) {
      log(`❌ خطا: درخواست ناموفق بود`, 'red');
      const text = await response.text();
      log(`پاسخ سرور: ${text.substring(0, 200)}`, 'red');
      return { success: false, error: `HTTP ${response.status}`, duration };
    }
    
    const data = await response.json();
    
    // بررسی ساختار پاسخ
    log('\n📦 ساختار پاسخ:', 'cyan');
    console.log(JSON.stringify(data, null, 2).substring(0, 500));
    
    // اعتبارسنجی داده
    let validData = false;
    let dataArray = [];
    
    if (data.success && Array.isArray(data.data)) {
      dataArray = data.data;
      validData = true;
    } else if (Array.isArray(data)) {
      dataArray = data;
      validData = true;
    }
    
    if (validData && dataArray.length > 0) {
      log(`\n✅ موفق: ${dataArray.length} کندل دریافت شد`, 'green');
      
      // نمایش اولین کندل
      const firstCandle = dataArray[0];
      log('\n📊 نمونه داده (اولین کندل):', 'cyan');
      console.log(JSON.stringify(firstCandle, null, 2));
      
      // بررسی فیلدهای مورد نیاز
      const requiredFields = ['time', 'open', 'high', 'low', 'close', 'volume'];
      const hasAllFields = requiredFields.every(field => 
        firstCandle.hasOwnProperty(field) || 
        firstCandle.hasOwnProperty(field.charAt(0)) // برای فرمت کوتاه (t, o, h, l, c, v)
      );
      
      if (hasAllFields) {
        log('✅ تمام فیلدهای مورد نیاز موجود است', 'green');
      } else {
        log('⚠️  برخی فیلدها ممکن است با نام متفاوت باشند', 'yellow');
      }
      
      return { 
        success: true, 
        count: dataArray.length, 
        duration,
        sample: firstCandle 
      };
    } else {
      log(`❌ خطا: داده معتبر دریافت نشد`, 'red');
      return { success: false, error: 'Invalid data structure', duration };
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    log(`❌ خطا: ${error.message}`, 'red');
    return { success: false, error: error.message, duration };
  }
}

// تست قیمت‌های بازار
async function testMarketPrices() {
  logSection('🔍 تست 2: دریافت قیمت‌های بازار');
  
  const url = `${HF_API_URL}/api/coins/top?limit=10`;
  
  log(`📡 درخواست به: ${url}`, 'blue');
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    const duration = Date.now() - startTime;
    
    log(`⏱️  زمان پاسخ: ${duration}ms`, 'yellow');
    log(`📊 وضعیت HTTP: ${response.status} ${response.statusText}`, 
        response.ok ? 'green' : 'red');
    
    if (!response.ok) {
      log(`❌ خطا: درخواست ناموفق بود`, 'red');
      return { success: false, error: `HTTP ${response.status}`, duration };
    }
    
    const data = await response.json();
    
    let coins = [];
    if (data.data && Array.isArray(data.data)) {
      coins = data.data;
    } else if (Array.isArray(data)) {
      coins = data;
    }
    
    if (coins.length > 0) {
      log(`\n✅ موفق: ${coins.length} ارز دریافت شد`, 'green');
      
      log('\n💰 نمونه قیمت‌ها:', 'cyan');
      coins.slice(0, 5).forEach((coin, index) => {
        console.log(`${index + 1}. ${coin.name || coin.symbol}: $${coin.price} (${coin.price_change_24h || coin.change_24h}%)`);
      });
      
      return { success: true, count: coins.length, duration };
    } else {
      log(`❌ خطا: هیچ داده‌ای دریافت نشد`, 'red');
      return { success: false, error: 'No data received', duration };
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    log(`❌ خطا: ${error.message}`, 'red');
    return { success: false, error: error.message, duration };
  }
}

// تست اخبار
async function testNews() {
  logSection('🔍 تست 3: دریافت اخبار');
  
  const url = `${HF_API_URL}/api/news/latest?limit=5`;
  
  log(`📡 درخواست به: ${url}`, 'blue');
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    const duration = Date.now() - startTime;
    
    log(`⏱️  زمان پاسخ: ${duration}ms`, 'yellow');
    log(`📊 وضعیت HTTP: ${response.status} ${response.statusText}`, 
        response.ok ? 'green' : 'red');
    
    if (!response.ok) {
      log(`❌ خطا: درخواست ناموفق بود`, 'red');
      return { success: false, error: `HTTP ${response.status}`, duration };
    }
    
    const data = await response.json();
    
    let newsItems = [];
    if (data.data && Array.isArray(data.data)) {
      newsItems = data.data;
    } else if (Array.isArray(data)) {
      newsItems = data;
    }
    
    if (newsItems.length > 0) {
      log(`\n✅ موفق: ${newsItems.length} خبر دریافت شد`, 'green');
      
      log('\n📰 نمونه اخبار:', 'cyan');
      newsItems.slice(0, 3).forEach((news, index) => {
        console.log(`${index + 1}. ${news.title}`);
        console.log(`   منبع: ${news.source || 'نامشخص'}`);
      });
      
      return { success: true, count: newsItems.length, duration };
    } else {
      log(`❌ خطا: هیچ خبری دریافت نشد`, 'red');
      return { success: false, error: 'No news received', duration };
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    log(`❌ خطا: ${error.message}`, 'red');
    return { success: false, error: error.message, duration };
  }
}

// تست تحلیل احساسات
async function testSentiment() {
  logSection('🔍 تست 4: تحلیل احساسات');
  
  const url = `${HF_API_URL}/api/sentiment/analyze`;
  const body = {
    text: 'Bitcoin is showing strong bullish momentum with high volume!',
    symbol: 'BTC'
  };
  
  log(`📡 درخواست POST به: ${url}`, 'blue');
  log(`📦 بدنه درخواست: ${JSON.stringify(body)}`, 'blue');
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      timeout: 30000
    });
    
    const duration = Date.now() - startTime;
    
    log(`⏱️  زمان پاسخ: ${duration}ms`, 'yellow');
    log(`📊 وضعیت HTTP: ${response.status} ${response.statusText}`, 
        response.ok ? 'green' : 'red');
    
    if (!response.ok) {
      log(`❌ خطا: درخواست ناموفق بود`, 'red');
      return { success: false, error: `HTTP ${response.status}`, duration };
    }
    
    const data = await response.json();
    
    if (data.sentiment || data.score !== undefined) {
      log(`\n✅ موفق: تحلیل احساسات انجام شد`, 'green');
      log(`\n😊 نتیجه تحلیل:`, 'cyan');
      console.log(JSON.stringify(data, null, 2));
      
      return { success: true, sentiment: data, duration };
    } else {
      log(`❌ خطا: پاسخ معتبر دریافت نشد`, 'red');
      return { success: false, error: 'Invalid response', duration };
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    log(`❌ خطا: ${error.message}`, 'red');
    return { success: false, error: error.message, duration };
  }
}

// تست تصمیم‌گیری AI
async function testAIDecision() {
  logSection('🔍 تست 5: تصمیم‌گیری AI');
  
  const url = `${HF_API_URL}/api/ai/decision`;
  const body = {
    symbol: 'BTC',
    timeframe: '1h'
  };
  
  log(`📡 درخواست POST به: ${url}`, 'blue');
  log(`📦 بدنه درخواست: ${JSON.stringify(body)}`, 'blue');
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      timeout: 30000
    });
    
    const duration = Date.now() - startTime;
    
    log(`⏱️  زمان پاسخ: ${duration}ms`, 'yellow');
    log(`📊 وضعیت HTTP: ${response.status} ${response.statusText}`, 
        response.ok ? 'green' : 'red');
    
    if (!response.ok) {
      log(`❌ خطا: درخواست ناموفق بود`, 'red');
      return { success: false, error: `HTTP ${response.status}`, duration };
    }
    
    const data = await response.json();
    
    if (data.decision || data.action) {
      log(`\n✅ موفق: تصمیم AI دریافت شد`, 'green');
      log(`\n🤖 تصمیم AI:`, 'cyan');
      console.log(JSON.stringify(data, null, 2));
      
      return { success: true, decision: data, duration };
    } else {
      log(`❌ خطا: پاسخ معتبر دریافت نشد`, 'red');
      return { success: false, error: 'Invalid response', duration };
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    log(`❌ خطا: ${error.message}`, 'red');
    return { success: false, error: error.message, duration };
  }
}

// اجرای تمام تست‌ها
async function runAllTests() {
  log('\n🚀 شروع تست‌های جامع API', 'cyan');
  log(`🌐 URL پایه: ${HF_API_URL}`, 'blue');
  
  const results = {
    ohlc: await testOHLC(),
    marketPrices: await testMarketPrices(),
    news: await testNews(),
    sentiment: await testSentiment(),
    aiDecision: await testAIDecision()
  };
  
  // خلاصه نتایج
  logSection('📊 خلاصه نتایج تست');
  
  const tests = [
    { name: 'OHLCV (کندل استیک)', result: results.ohlc },
    { name: 'قیمت‌های بازار', result: results.marketPrices },
    { name: 'اخبار', result: results.news },
    { name: 'تحلیل احساسات', result: results.sentiment },
    { name: 'تصمیم‌گیری AI', result: results.aiDecision }
  ];
  
  let successCount = 0;
  let totalDuration = 0;
  
  tests.forEach(test => {
    const status = test.result.success ? '✅' : '❌';
    const statusColor = test.result.success ? 'green' : 'red';
    const duration = test.result.duration || 0;
    totalDuration += duration;
    
    if (test.result.success) successCount++;
    
    log(`${status} ${test.name}: ${test.result.success ? 'موفق' : 'ناموفق'} (${duration}ms)`, statusColor);
    
    if (!test.result.success && test.result.error) {
      log(`   خطا: ${test.result.error}`, 'red');
    }
  });
  
  log(`\n📈 نتیجه کلی: ${successCount}/${tests.length} تست موفق`, 
      successCount === tests.length ? 'green' : 'yellow');
  log(`⏱️  مجموع زمان: ${totalDuration}ms`, 'yellow');
  
  // نتیجه‌گیری
  logSection('🎯 نتیجه‌گیری');
  
  if (results.ohlc.success) {
    log('✅ API برای دریافت داده‌های OHLC مناسب است', 'green');
    log(`   - ${results.ohlc.count} کندل دریافت شد`, 'green');
    log(`   - زمان پاسخ: ${results.ohlc.duration}ms`, 'green');
  } else {
    log('❌ API برای دریافت داده‌های OHLC مناسب نیست', 'red');
    log(`   - خطا: ${results.ohlc.error}`, 'red');
  }
  
  if (successCount >= 3) {
    log('\n✅ توصیه: این API می‌تواند برای پروژه شما استفاده شود', 'green');
  } else {
    log('\n⚠️  توصیه: این API ممکن است برای پروژه شما کافی نباشد', 'yellow');
  }
  
  return results;
}

// اجرای تست‌ها
runAllTests()
  .then(() => {
    log('\n✅ تست‌ها با موفقیت اجرا شدند', 'green');
    process.exit(0);
  })
  .catch(error => {
    log(`\n❌ خطای غیرمنتظره: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });

