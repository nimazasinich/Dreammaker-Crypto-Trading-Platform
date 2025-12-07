/**
 * مثال 1: دریافت داده OHLCV (کندل استیک)
 * 
 * این مثال نشان می‌دهد چگونه داده‌های OHLCV را از API دریافت کنید
 * و آن‌ها را برای رسم نمودار یا تحلیل تکنیکال استفاده کنید.
 */

import { CryptoAPIClient, OHLCVCandle } from './CryptoAPIClient';

// ============================================================================
// تنظیمات اولیه
// ============================================================================

const client = new CryptoAPIClient({
    baseURL: 'https://huggingface.co/spaces/Really-amin/Datasourceforcryptocurrency-2',
    timeout: 15000,
    retries: 3,
});

// ============================================================================
// مثال 1: دریافت ساده OHLCV
// ============================================================================

async function example1_BasicOHLCV() {
    console.log('📊 مثال 1: دریافت ساده OHLCV\n');

    try {
        // دریافت 100 کندل 1 ساعته BTC
        const response = await client.getOHLCV('BTC', '1h', 100);

        console.log('✅ موفق!');
        console.log(`📈 نماد: ${response.symbol}`);
        console.log(`⏱️  بازه زمانی: ${response.timeframe}`);
        console.log(`📊 تعداد کندل: ${response.count}`);
        console.log(`🔗 منبع: ${response.source}`);

        // نمایش 5 کندل آخر
        console.log('\n📉 5 کندل آخر:');
        const lastCandles = response.data?.slice(-5) || [];
        lastCandles.forEach((candle, index) => {
            const date = new Date(candle.time * 1000);
            console.log(`  ${index + 1}. زمان: ${date.toLocaleString()}`);
            console.log(`     باز: $${candle.open.toFixed(2)}`);
            console.log(`     بسته: $${candle.close.toFixed(2)}`);
            console.log(`     بالا: $${candle.high.toFixed(2)}`);
            console.log(`     پایین: $${candle.low.toFixed(2)}`);
            console.log(`     حجم: ${candle.volume.toFixed(2)}`);
        });

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 2: دریافت OHLCV برای چند ارز
// ============================================================================

async function example2_MultipleSymbols() {
    console.log('\n📊 مثال 2: دریافت OHLCV برای چند ارز\n');

    const symbols = ['BTC', 'ETH', 'SOL', 'ADA'];
    const timeframe = '4h';
    const limit = 50;

    for (const symbol of symbols) {
        try {
            const response = await client.getOHLCV(symbol, timeframe, limit);

            if (response.data && response.data.length > 0) {
                const lastCandle = response.data[response.data.length - 1];
                console.log(`✅ ${symbol}:`);
                console.log(`   قیمت فعلی: $${lastCandle.close.toFixed(2)}`);
                console.log(`   حجم: ${lastCandle.volume.toFixed(2)}`);
                console.log(`   منبع: ${response.source}`);
            }

        } catch (error) {
            console.error(`❌ خطا در دریافت ${symbol}:`, error);
        }
    }
}

// ============================================================================
// مثال 3: محاسبه اندیکاتورهای تکنیکال
// ============================================================================

/**
 * محاسبه میانگین متحرک ساده (SMA)
 */
function calculateSMA(candles: OHLCVCandle[], period: number): number[] {
    const sma: number[] = [];

    for (let i = period - 1; i < candles.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += candles[i - j].close;
        }
        sma.push(sum / period);
    }

    return sma;
}

/**
 * محاسبه RSI (Relative Strength Index)
 */
function calculateRSI(candles: OHLCVCandle[], period: number = 14): number {
    if (candles.length < period + 1) {
        return 50; // مقدار پیش‌فرض
    }

    let gains = 0;
    let losses = 0;

    // محاسبه تغییرات
    for (let i = candles.length - period; i < candles.length; i++) {
        const change = candles[i].close - candles[i - 1].close;
        if (change > 0) {
            gains += change;
        } else {
            losses += Math.abs(change);
        }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    return rsi;
}

async function example3_TechnicalAnalysis() {
    console.log('\n📊 مثال 3: تحلیل تکنیکال\n');

    try {
        // دریافت 200 کندل برای تحلیل دقیق‌تر
        const response = await client.getOHLCV('BTC', '1h', 200);

        if (!response.data || response.data.length === 0) {
            console.log('❌ داده‌ای دریافت نشد');
            return;
        }

        const candles = response.data;

        // محاسبه SMA
        const sma20 = calculateSMA(candles, 20);
        const sma50 = calculateSMA(candles, 50);

        // محاسبه RSI
        const rsi = calculateRSI(candles, 14);

        // قیمت فعلی
        const currentPrice = candles[candles.length - 1].close;

        console.log('📈 تحلیل تکنیکال BTC:');
        console.log(`   قیمت فعلی: $${currentPrice.toFixed(2)}`);
        console.log(`   SMA(20): $${sma20[sma20.length - 1].toFixed(2)}`);
        console.log(`   SMA(50): $${sma50[sma50.length - 1].toFixed(2)}`);
        console.log(`   RSI(14): ${rsi.toFixed(2)}`);

        // تحلیل
        console.log('\n💡 تحلیل:');

        if (currentPrice > sma20[sma20.length - 1]) {
            console.log('   ✅ قیمت بالای SMA(20) - روند صعودی کوتاه‌مدت');
        } else {
            console.log('   ⚠️  قیمت زیر SMA(20) - روند نزولی کوتاه‌مدت');
        }

        if (rsi > 70) {
            console.log('   ⚠️  RSI > 70 - اشباع خرید (Overbought)');
        } else if (rsi < 30) {
            console.log('   ⚠️  RSI < 30 - اشباع فروش (Oversold)');
        } else {
            console.log('   ✅ RSI در محدوده طبیعی');
        }

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 4: ذخیره داده در فایل CSV
// ============================================================================

async function example4_ExportToCSV() {
    console.log('\n📊 مثال 4: ذخیره داده در CSV\n');

    try {
        const response = await client.getOHLCV('BTC', '1d', 365); // 1 سال

        if (!response.data || response.data.length === 0) {
            console.log('❌ داده‌ای دریافت نشد');
            return;
        }

        // ساخت CSV
        let csv = 'Date,Open,High,Low,Close,Volume\n';

        response.data.forEach(candle => {
            const date = new Date(candle.time * 1000).toISOString().split('T')[0];
            csv += `${date},${candle.open},${candle.high},${candle.low},${candle.close},${candle.volume}\n`;
        });

        console.log('✅ CSV آماده شد!');
        console.log(`📊 تعداد ردیف: ${response.data.length}`);
        console.log('\n📄 نمونه CSV (5 خط اول):');
        console.log(csv.split('\n').slice(0, 6).join('\n'));

        // در Node.js می‌توانید فایل را ذخیره کنید:
        // const fs = require('fs');
        // fs.writeFileSync('btc_ohlcv.csv', csv);

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 5: استفاده از روش‌های مختلف endpoint
// ============================================================================

async function example5_DifferentEndpoints() {
    console.log('\n📊 مثال 5: استفاده از روش‌های مختلف endpoint\n');

    const symbol = 'ETH';
    const timeframe = '1h';
    const limit = 50;

    try {
        // روش 1: Query parameter
        console.log('🔹 روش 1: /api/ohlcv (query parameter)');
        const method1 = await client.getOHLCV(symbol, timeframe, limit);
        console.log(`   ✅ دریافت ${method1.count} کندل از ${method1.source}`);

        // روش 2: Path parameter
        console.log('\n🔹 روش 2: /api/ohlcv/{symbol} (path parameter)');
        const method2 = await client.getOHLCVByPath(symbol, timeframe, limit);
        console.log(`   ✅ دریافت ${method2.count} کندل از ${method2.source}`);

        // روش 3: Market endpoint
        console.log('\n🔹 روش 3: /api/market/ohlc (alias)');
        const method3 = await client.getMarketOHLC(symbol, timeframe, limit);
        console.log(`   ✅ دریافت ${method3.count} کندل از ${method3.source}`);

        console.log('\n💡 همه روش‌ها داده یکسانی برمی‌گردانند!');

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 6: مدیریت خطا و retry
// ============================================================================

async function example6_ErrorHandling() {
    console.log('\n📊 مثال 6: مدیریت خطا\n');

    // کلاینت با تنظیمات سفارشی
    const customClient = new CryptoAPIClient({
        baseURL: 'https://huggingface.co/spaces/Really-amin/Datasourceforcryptocurrency-2',
        timeout: 5000,  // 5 ثانیه
        retries: 5,     // 5 تلاش
        retryDelay: 500, // 0.5 ثانیه
    });

    try {
        console.log('🔄 در حال تلاش برای دریافت داده...');
        const response = await customClient.getOHLCV('BTC', '1h', 100);
        console.log(`✅ موفق! منبع: ${response.source}`);

    } catch (error) {
        console.error('❌ خطا پس از چند تلاش:', error);
        console.log('💡 می‌توانید:');
        console.log('   1. تنظیمات timeout را افزایش دهید');
        console.log('   2. تعداد retry را بیشتر کنید');
        console.log('   3. از fallback data استفاده کنید');
    }
}

// ============================================================================
// اجرای همه مثال‌ها
// ============================================================================

async function runAllExamples() {
    console.log('🚀 شروع مثال‌های OHLCV\n');
    console.log('='.repeat(60));

    await example1_BasicOHLCV();
    console.log('\n' + '='.repeat(60));

    await example2_MultipleSymbols();
    console.log('\n' + '='.repeat(60));

    await example3_TechnicalAnalysis();
    console.log('\n' + '='.repeat(60));

    await example4_ExportToCSV();
    console.log('\n' + '='.repeat(60));

    await example5_DifferentEndpoints();
    console.log('\n' + '='.repeat(60));

    await example6_ErrorHandling();
    console.log('\n' + '='.repeat(60));

    console.log('\n✅ همه مثال‌ها اجرا شدند!');
}

// اجرا
if (require.main === module) {
    runAllExamples().catch(console.error);
}

export {
    example1_BasicOHLCV,
    example2_MultipleSymbols,
    example3_TechnicalAnalysis,
    example4_ExportToCSV,
    example5_DifferentEndpoints,
    example6_ErrorHandling
};

