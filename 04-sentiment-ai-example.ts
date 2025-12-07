/**
 * مثال 4: تحلیل احساسات و تصمیم AI
 * 
 * این مثال نشان می‌دهد چگونه از endpoint‌های تحلیل احساسات
 * و تصمیم‌گیری AI برای تحلیل بازار استفاده کنید.
 */

import { CryptoAPIClient } from './CryptoAPIClient';

// ============================================================================
// تنظیمات اولیه
// ============================================================================

const client = new CryptoAPIClient({
    baseURL: 'https://huggingface.co/spaces/Really-amin/Datasourceforcryptocurrency-2',
    timeout: 15000,
});

// ============================================================================
// مثال 1: تحلیل احساسات ساده
// ============================================================================

async function example1_BasicSentiment() {
    console.log('🎭 مثال 1: تحلیل احساسات ساده\n');

    const texts = [
        'Bitcoin is showing strong bullish momentum with high volume!',
        'Market crash! Ethereum dumps below $2000',
        'Stable market conditions, no significant movement',
        'BTC to the moon! 🚀 New all-time high coming soon!',
        'Bear market continues, investors losing confidence',
    ];

    try {
        console.log('📊 تحلیل متون مختلف:\n');

        for (const text of texts) {
            const sentiment = await client.analyzeSentiment(text, 'BTC');

            // انتخاب emoji
            let emoji = '😐';
            if (sentiment.label === 'bullish') emoji = '🚀';
            else if (sentiment.label === 'bearish') emoji = '📉';
            else if (sentiment.label === 'positive') emoji = '😊';
            else if (sentiment.label === 'negative') emoji = '😟';

            console.log(`${emoji} متن: "${text}"`);
            console.log(`   احساسات: ${sentiment.label}`);
            console.log(`   امتیاز: ${(sentiment.score * 100).toFixed(1)}%`);
            console.log(`   مدل: ${sentiment.model}\n`);
        }

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 2: تحلیل احساسات چند ارز
// ============================================================================

async function example2_MultiSymbolSentiment() {
    console.log('\n🎭 مثال 2: تحلیل احساسات چند ارز\n');

    const sentiments = [
        { text: 'Bitcoin breaking resistance levels', symbol: 'BTC' },
        { text: 'Ethereum 2.0 upgrade successful', symbol: 'ETH' },
        { text: 'Solana network experiencing issues', symbol: 'SOL' },
        { text: 'Cardano smart contracts gaining traction', symbol: 'ADA' },
    ];

    try {
        console.log('📊 تحلیل احساسات برای ارزهای مختلف:\n');

        for (const item of sentiments) {
            const sentiment = await client.analyzeSentiment(item.text, item.symbol);

            console.log(`💎 ${item.symbol}:`);
            console.log(`   متن: "${item.text}"`);
            console.log(`   احساسات: ${sentiment.label} (${(sentiment.score * 100).toFixed(1)}%)`);
            console.log('');
        }

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 3: تصمیم AI ساده
// ============================================================================

async function example3_BasicAIDecision() {
    console.log('\n🤖 مثال 3: تصمیم AI ساده\n');

    const symbols = ['BTC', 'ETH', 'SOL'];
    const timeframe = '1h';

    try {
        console.log(`📊 دریافت تصمیم AI برای ${timeframe}:\n`);

        for (const symbol of symbols) {
            const decision = await client.getAIDecision(symbol, timeframe);

            // انتخاب emoji
            let emoji = '⏸️';
            if (decision.decision === 'BUY') emoji = '🟢';
            else if (decision.decision === 'SELL') emoji = '🔴';

            console.log(`${emoji} ${symbol}:`);
            console.log(`   تصمیم: ${decision.decision}`);
            console.log(`   اطمینان: ${decision.confidence}%`);
            console.log(`   دلیل: ${decision.reason}`);

            if (decision.indicators) {
                console.log('   اندیکاتورها:');
                Object.entries(decision.indicators).forEach(([key, value]) => {
                    console.log(`     - ${key}: ${value}`);
                });
            }

            console.log('');
        }

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 4: تصمیم AI با متن اضافی
// ============================================================================

async function example4_AIDecisionWithContext() {
    console.log('\n🤖 مثال 4: تصمیم AI با متن اضافی\n');

    const scenarios = [
        {
            symbol: 'BTC',
            timeframe: '1h',
            context: 'Strong volume increase, breaking resistance at $45000',
        },
        {
            symbol: 'ETH',
            timeframe: '4h',
            context: 'Bearish divergence on RSI, potential correction incoming',
        },
        {
            symbol: 'SOL',
            timeframe: '1d',
            context: 'Network upgrade successful, positive sentiment on social media',
        },
    ];

    try {
        console.log('📊 تصمیم AI با context اضافی:\n');

        for (const scenario of scenarios) {
            const decision = await client.getAIDecision(
                scenario.symbol,
                scenario.timeframe,
                scenario.context
            );

            console.log(`💎 ${scenario.symbol} (${scenario.timeframe}):`);
            console.log(`   Context: "${scenario.context}"`);
            console.log(`   تصمیم: ${decision.decision} (${decision.confidence}%)`);
            console.log(`   دلیل: ${decision.reason}\n`);
        }

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 5: ترکیب OHLCV + Sentiment + AI Decision
// ============================================================================

async function example5_CompleteAnalysis() {
    console.log('\n🔬 مثال 5: تحلیل کامل (OHLCV + Sentiment + AI)\n');

    const symbol = 'BTC';
    const timeframe = '1h';

    try {
        console.log(`📊 تحلیل کامل ${symbol}:\n`);

        // 1. دریافت OHLCV
        console.log('1️⃣ دریافت داده OHLCV...');
        const ohlcv = await client.getOHLCV(symbol, timeframe, 100);

        if (!ohlcv.data || ohlcv.data.length === 0) {
            console.log('❌ داده OHLCV دریافت نشد');
            return;
        }

        const lastCandle = ohlcv.data[ohlcv.data.length - 1];
        const prevCandle = ohlcv.data[ohlcv.data.length - 2];
        const priceChange = ((lastCandle.close - prevCandle.close) / prevCandle.close) * 100;

        console.log(`   ✅ قیمت فعلی: $${lastCandle.close.toFixed(2)}`);
        console.log(`   📈 تغییر: ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%`);
        console.log(`   📊 حجم: ${lastCandle.volume.toFixed(2)}`);

        // 2. تحلیل احساسات
        console.log('\n2️⃣ تحلیل احساسات بازار...');
        const marketContext = `${symbol} price is ${priceChange > 0 ? 'rising' : 'falling'} with ${priceChange > 0 ? 'strong' : 'weak'} momentum`;
        const sentiment = await client.analyzeSentiment(marketContext, symbol);

        console.log(`   ✅ احساسات: ${sentiment.label} (${(sentiment.score * 100).toFixed(1)}%)`);

        // 3. تصمیم AI
        console.log('\n3️⃣ دریافت تصمیم AI...');
        const decision = await client.getAIDecision(symbol, timeframe, marketContext);

        console.log(`   ✅ تصمیم: ${decision.decision}`);
        console.log(`   📊 اطمینان: ${decision.confidence}%`);
        console.log(`   💡 دلیل: ${decision.reason}`);

        // 4. نتیجه‌گیری نهایی
        console.log('\n4️⃣ نتیجه‌گیری نهایی:');

        let recommendation = '';
        if (decision.decision === 'BUY' && sentiment.label === 'bullish' && priceChange > 0) {
            recommendation = '🟢 سیگنال خرید قوی - همه اندیکاتورها مثبت';
        } else if (decision.decision === 'SELL' && sentiment.label === 'bearish' && priceChange < 0) {
            recommendation = '🔴 سیگنال فروش قوی - همه اندیکاتورها منفی';
        } else if (decision.decision === 'HOLD') {
            recommendation = '⏸️ نگهداری - بازار در حالت تعادل';
        } else {
            recommendation = '⚠️ سیگنال‌های متناقض - احتیاط لازم است';
        }

        console.log(`   ${recommendation}`);

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 6: سیستم Trading Bot ساده
// ============================================================================

interface TradeSignal {
    symbol: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    price: number;
    timestamp: Date;
    reasons: string[];
}

async function example6_SimpleTradingBot() {
    console.log('\n🤖 مثال 6: سیستم Trading Bot ساده\n');

    const symbols = ['BTC', 'ETH', 'SOL'];
    const timeframe = '1h';
    const signals: TradeSignal[] = [];

    try {
        console.log('🔍 اسکن بازار برای سیگنال‌های معاملاتی...\n');

        for (const symbol of symbols) {
            // دریافت قیمت
            const ohlcv = await client.getOHLCV(symbol, timeframe, 50);
            if (!ohlcv.data || ohlcv.data.length === 0) continue;

            const currentPrice = ohlcv.data[ohlcv.data.length - 1].close;

            // دریافت تصمیم AI
            const decision = await client.getAIDecision(symbol, timeframe);

            // ساخت سیگنال
            const signal: TradeSignal = {
                symbol,
                action: decision.decision,
                confidence: decision.confidence,
                price: currentPrice,
                timestamp: new Date(),
                reasons: [decision.reason],
            };

            signals.push(signal);

            // نمایش سیگنال
            let emoji = '⏸️';
            if (signal.action === 'BUY') emoji = '🟢';
            else if (signal.action === 'SELL') emoji = '🔴';

            console.log(`${emoji} ${symbol}:`);
            console.log(`   اکشن: ${signal.action}`);
            console.log(`   قیمت: $${signal.price.toFixed(2)}`);
            console.log(`   اطمینان: ${signal.confidence}%`);
            console.log(`   دلایل: ${signal.reasons.join(', ')}\n`);
        }

        // خلاصه سیگنال‌ها
        console.log('📊 خلاصه سیگنال‌ها:');
        const buySignals = signals.filter(s => s.action === 'BUY');
        const sellSignals = signals.filter(s => s.action === 'SELL');
        const holdSignals = signals.filter(s => s.action === 'HOLD');

        console.log(`   🟢 خرید: ${buySignals.length}`);
        console.log(`   🔴 فروش: ${sellSignals.length}`);
        console.log(`   ⏸️  نگهداری: ${holdSignals.length}`);

        // بهترین فرصت
        if (buySignals.length > 0) {
            const bestBuy = buySignals.reduce((best, current) =>
                current.confidence > best.confidence ? current : best
            );
            console.log(`\n💎 بهترین فرصت خرید: ${bestBuy.symbol} (${bestBuy.confidence}%)`);
        }

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 7: تحلیل احساسات اخبار
// ============================================================================

async function example7_NewsSentimentAnalysis() {
    console.log('\n🎭 مثال 7: تحلیل احساسات اخبار\n');

    try {
        // دریافت اخبار
        console.log('📰 دریافت آخرین اخبار...');
        const news = await client.getNews(10);
        const articles = news.news || news.articles || [];

        if (articles.length === 0) {
            console.log('❌ خبری دریافت نشد');
            return;
        }

        console.log(`✅ ${articles.length} خبر دریافت شد\n`);

        // تحلیل احساسات هر خبر
        const sentiments = {
            bullish: 0,
            bearish: 0,
            neutral: 0,
        };

        console.log('🔍 تحلیل احساسات اخبار:\n');

        for (const article of articles) {
            const text = `${article.title}. ${article.summary}`;
            const sentiment = await client.analyzeSentiment(text);

            // شمارش احساسات
            if (sentiment.label === 'bullish' || sentiment.label === 'positive') {
                sentiments.bullish++;
            } else if (sentiment.label === 'bearish' || sentiment.label === 'negative') {
                sentiments.bearish++;
            } else {
                sentiments.neutral++;
            }

            let emoji = '😐';
            if (sentiment.label === 'bullish') emoji = '🚀';
            else if (sentiment.label === 'bearish') emoji = '📉';

            console.log(`${emoji} ${article.title}`);
            console.log(`   احساسات: ${sentiment.label} (${(sentiment.score * 100).toFixed(1)}%)\n`);
        }

        // خلاصه احساسات کلی بازار
        console.log('📊 خلاصه احساسات کلی بازار:');
        console.log(`   🚀 Bullish: ${sentiments.bullish} (${((sentiments.bullish / articles.length) * 100).toFixed(1)}%)`);
        console.log(`   📉 Bearish: ${sentiments.bearish} (${((sentiments.bearish / articles.length) * 100).toFixed(1)}%)`);
        console.log(`   😐 Neutral: ${sentiments.neutral} (${((sentiments.neutral / articles.length) * 100).toFixed(1)}%)`);

        // نتیجه‌گیری
        console.log('\n💡 نتیجه‌گیری:');
        if (sentiments.bullish > sentiments.bearish) {
            console.log('   ✅ احساسات کلی بازار مثبت است');
        } else if (sentiments.bearish > sentiments.bullish) {
            console.log('   ⚠️  احساسات کلی بازار منفی است');
        } else {
            console.log('   😐 احساسات بازار خنثی است');
        }

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 8: سیستم هشدار هوشمند
// ============================================================================

async function example8_SmartAlertSystem() {
    console.log('\n🔔 مثال 8: سیستم هشدار هوشمند\n');

    const watchlist = ['BTC', 'ETH', 'SOL'];

    try {
        console.log('🔍 بررسی watchlist...\n');

        for (const symbol of watchlist) {
            // دریافت قیمت
            const ohlcv = await client.getOHLCV(symbol, '1h', 50);
            if (!ohlcv.data || ohlcv.data.length === 0) continue;

            const currentPrice = ohlcv.data[ohlcv.data.length - 1].close;
            const prevPrice = ohlcv.data[ohlcv.data.length - 2].close;
            const priceChange = ((currentPrice - prevPrice) / prevPrice) * 100;

            // دریافت تصمیم AI
            const decision = await client.getAIDecision(symbol, '1h');

            // بررسی شرایط هشدار
            const alerts: string[] = [];

            if (Math.abs(priceChange) > 5) {
                alerts.push(`تغییر قیمت شدید: ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%`);
            }

            if (decision.decision === 'BUY' && decision.confidence > 70) {
                alerts.push(`سیگنال خرید قوی (${decision.confidence}%)`);
            }

            if (decision.decision === 'SELL' && decision.confidence > 70) {
                alerts.push(`سیگنال فروش قوی (${decision.confidence}%)`);
            }

            // نمایش هشدارها
            if (alerts.length > 0) {
                console.log(`🚨 ${symbol} - ${alerts.length} هشدار:`);
                console.log(`   قیمت: $${currentPrice.toFixed(2)}`);
                alerts.forEach(alert => {
                    console.log(`   ⚠️  ${alert}`);
                });
                console.log('');
            } else {
                console.log(`✅ ${symbol} - وضعیت عادی ($${currentPrice.toFixed(2)})\n`);
            }
        }

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// اجرای همه مثال‌ها
// ============================================================================

async function runAllExamples() {
    console.log('🚀 شروع مثال‌های Sentiment & AI Decision\n');
    console.log('='.repeat(60));

    await example1_BasicSentiment();
    console.log('\n' + '='.repeat(60));

    await example2_MultiSymbolSentiment();
    console.log('\n' + '='.repeat(60));

    await example3_BasicAIDecision();
    console.log('\n' + '='.repeat(60));

    await example4_AIDecisionWithContext();
    console.log('\n' + '='.repeat(60));

    await example5_CompleteAnalysis();
    console.log('\n' + '='.repeat(60));

    await example6_SimpleTradingBot();
    console.log('\n' + '='.repeat(60));

    await example7_NewsSentimentAnalysis();
    console.log('\n' + '='.repeat(60));

    await example8_SmartAlertSystem();
    console.log('\n' + '='.repeat(60));

    console.log('\n✅ همه مثال‌ها اجرا شدند!');
}

// اجرا
if (require.main === module) {
    runAllExamples().catch(console.error);
}

export {
    example1_BasicSentiment,
    example2_MultiSymbolSentiment,
    example3_BasicAIDecision,
    example4_AIDecisionWithContext,
    example5_CompleteAnalysis,
    example6_SimpleTradingBot,
    example7_NewsSentimentAnalysis,
    example8_SmartAlertSystem
};

