/**
 * مثال 5: مثال کامل - ترکیب همه قابلیت‌ها
 * 
 * این مثال یک اپلیکیشن کامل است که از تمام endpoint‌ها استفاده می‌کند
 * و یک داشبورد تحلیلی جامع ایجاد می‌کند.
 */

import { CryptoAPIClient } from './CryptoAPIClient';

// ============================================================================
// تنظیمات اولیه
// ============================================================================

const client = new CryptoAPIClient({
    baseURL: 'https://huggingface.co/spaces/Really-amin/Datasourceforcryptocurrency-2',
    timeout: 15000,
    retries: 3,
});

// ============================================================================
// Interface‌های کمکی
// ============================================================================

interface MarketAnalysis {
    symbol: string;
    price: number;
    priceChange24h: number;
    volume: number;
    marketCap: number;
    technicalIndicators: {
        rsi: number;
        sma20: number;
        sma50: number;
        trend: 'bullish' | 'bearish' | 'neutral';
    };
    sentiment: {
        label: string;
        score: number;
        newsCount: number;
        positiveNews: number;
        negativeNews: number;
    };
    aiDecision: {
        action: 'BUY' | 'SELL' | 'HOLD';
        confidence: number;
        reason: string;
    };
    recommendation: string;
}

// ============================================================================
// توابع کمکی
// ============================================================================

/**
 * محاسبه RSI
 */
function calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = prices.length - period; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) gains += change;
        else losses += Math.abs(change);
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

/**
 * محاسبه SMA
 */
function calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];

    const slice = prices.slice(-period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / period;
}

/**
 * تشخیص روند
 */
function detectTrend(currentPrice: number, sma20: number, sma50: number): 'bullish' | 'bearish' | 'neutral' {
    if (currentPrice > sma20 && sma20 > sma50) return 'bullish';
    if (currentPrice < sma20 && sma20 < sma50) return 'bearish';
    return 'neutral';
}

// ============================================================================
// تحلیل کامل یک ارز
// ============================================================================

async function analyzeSymbol(symbol: string): Promise<MarketAnalysis | null> {
    try {
        console.log(`\n🔍 تحلیل ${symbol}...`);

        // 1. دریافت OHLCV
        console.log('  📊 دریافت OHLCV...');
        const ohlcv = await client.getOHLCV(symbol, '1h', 200);

        if (!ohlcv.data || ohlcv.data.length === 0) {
            console.log(`  ❌ داده OHLCV برای ${symbol} دریافت نشد`);
            return null;
        }

        const candles = ohlcv.data;
        const lastCandle = candles[candles.length - 1];
        const prevCandle = candles[candles.length - 2];

        const currentPrice = lastCandle.close;
        const priceChange24h = ((currentPrice - prevCandle.close) / prevCandle.close) * 100;
        const volume = lastCandle.volume;

        // 2. محاسبه اندیکاتورهای تکنیکال
        console.log('  📈 محاسبه اندیکاتورها...');
        const closePrices = candles.map(c => c.close);
        const rsi = calculateRSI(closePrices, 14);
        const sma20 = calculateSMA(closePrices, 20);
        const sma50 = calculateSMA(closePrices, 50);
        const trend = detectTrend(currentPrice, sma20, sma50);

        // 3. دریافت قیمت از market data
        console.log('  💰 دریافت market data...');
        const coins = await client.getTopCoins(50);
        const coinData = coins.data?.find(c => c.symbol === symbol);
        const marketCap = coinData?.market_cap || 0;

        // 4. تحلیل اخبار و احساسات
        console.log('  📰 تحلیل اخبار...');
        const news = await client.getNews(50);
        const articles = news.news || news.articles || [];

        // فیلتر اخبار مرتبط با این ارز
        const relatedNews = articles.filter(article => {
            const text = `${article.title} ${article.summary}`.toLowerCase();
            return text.includes(symbol.toLowerCase()) ||
                text.includes(coinData?.name.toLowerCase() || '');
        });

        let positiveNews = 0;
        let negativeNews = 0;
        let totalSentimentScore = 0;

        for (const article of relatedNews.slice(0, 10)) {
            try {
                const text = `${article.title}. ${article.summary}`;
                const sentiment = await client.analyzeSentiment(text, symbol);

                totalSentimentScore += sentiment.score;

                if (sentiment.label === 'bullish' || sentiment.label === 'positive') {
                    positiveNews++;
                } else if (sentiment.label === 'bearish' || sentiment.label === 'negative') {
                    negativeNews++;
                }
            } catch (error) {
                // Skip if sentiment analysis fails
            }
        }

        const avgSentimentScore = relatedNews.length > 0
            ? totalSentimentScore / Math.min(relatedNews.length, 10)
            : 0.5;

        const sentimentLabel = positiveNews > negativeNews ? 'positive' :
            negativeNews > positiveNews ? 'negative' : 'neutral';

        // 5. دریافت تصمیم AI
        console.log('  🤖 دریافت تصمیم AI...');
        const aiContext = `${symbol} price ${priceChange24h > 0 ? 'rising' : 'falling'}, RSI: ${rsi.toFixed(2)}, trend: ${trend}`;
        const decision = await client.getAIDecision(symbol, '1h', aiContext);

        // 6. ساخت توصیه نهایی
        let recommendation = '';
        let score = 0;

        // امتیازدهی بر اساس اندیکاتورها
        if (trend === 'bullish') score += 2;
        else if (trend === 'bearish') score -= 2;

        if (rsi < 30) score += 2; // oversold
        else if (rsi > 70) score -= 2; // overbought

        if (sentimentLabel === 'positive') score += 1;
        else if (sentimentLabel === 'negative') score -= 1;

        if (decision.decision === 'BUY' && decision.confidence > 60) score += 2;
        else if (decision.decision === 'SELL' && decision.confidence > 60) score -= 2;

        // تولید توصیه
        if (score >= 4) {
            recommendation = '🟢 خرید قوی - همه سیگنال‌ها مثبت';
        } else if (score >= 2) {
            recommendation = '🟢 خرید - سیگنال‌های مثبت غالب';
        } else if (score <= -4) {
            recommendation = '🔴 فروش قوی - همه سیگنال‌ها منفی';
        } else if (score <= -2) {
            recommendation = '🔴 فروش - سیگنال‌های منفی غالب';
        } else {
            recommendation = '⏸️  نگهداری - سیگنال‌های متناقض';
        }

        console.log(`  ✅ تحلیل ${symbol} کامل شد`);

        return {
            symbol,
            price: currentPrice,
            priceChange24h,
            volume,
            marketCap,
            technicalIndicators: {
                rsi,
                sma20,
                sma50,
                trend,
            },
            sentiment: {
                label: sentimentLabel,
                score: avgSentimentScore,
                newsCount: relatedNews.length,
                positiveNews,
                negativeNews,
            },
            aiDecision: {
                action: decision.decision,
                confidence: decision.confidence,
                reason: decision.reason,
            },
            recommendation,
        };

    } catch (error) {
        console.error(`  ❌ خطا در تحلیل ${symbol}:`, error);
        return null;
    }
}

// ============================================================================
// نمایش گزارش تحلیل
// ============================================================================

function displayAnalysisReport(analysis: MarketAnalysis) {
    console.log('\n' + '='.repeat(70));
    console.log(`📊 گزارش تحلیل کامل ${analysis.symbol}`);
    console.log('='.repeat(70));

    // قیمت و بازار
    console.log('\n💰 اطلاعات بازار:');
    console.log(`   قیمت فعلی: $${analysis.price.toLocaleString()}`);
    console.log(`   تغییر 24h: ${analysis.priceChange24h > 0 ? '+' : ''}${analysis.priceChange24h.toFixed(2)}%`);
    console.log(`   حجم: ${analysis.volume.toLocaleString()}`);
    console.log(`   مارکت کپ: $${(analysis.marketCap / 1e9).toFixed(2)}B`);

    // اندیکاتورهای تکنیکال
    console.log('\n📈 اندیکاتورهای تکنیکال:');
    console.log(`   RSI(14): ${analysis.technicalIndicators.rsi.toFixed(2)}`);
    console.log(`   SMA(20): $${analysis.technicalIndicators.sma20.toFixed(2)}`);
    console.log(`   SMA(50): $${analysis.technicalIndicators.sma50.toFixed(2)}`);
    console.log(`   روند: ${analysis.technicalIndicators.trend}`);

    // تحلیل احساسات
    console.log('\n🎭 تحلیل احساسات:');
    console.log(`   احساسات کلی: ${analysis.sentiment.label}`);
    console.log(`   امتیاز: ${(analysis.sentiment.score * 100).toFixed(1)}%`);
    console.log(`   تعداد اخبار: ${analysis.sentiment.newsCount}`);
    console.log(`   اخبار مثبت: ${analysis.sentiment.positiveNews}`);
    console.log(`   اخبار منفی: ${analysis.sentiment.negativeNews}`);

    // تصمیم AI
    console.log('\n🤖 تصمیم AI:');
    console.log(`   اکشن: ${analysis.aiDecision.action}`);
    console.log(`   اطمینان: ${analysis.aiDecision.confidence}%`);
    console.log(`   دلیل: ${analysis.aiDecision.reason}`);

    // توصیه نهایی
    console.log('\n💡 توصیه نهایی:');
    console.log(`   ${analysis.recommendation}`);

    console.log('\n' + '='.repeat(70));
}

// ============================================================================
// داشبورد کامل
// ============================================================================

async function runCompleteDashboard() {
    console.log('🚀 داشبورد تحلیل کامل کریپتو');
    console.log('='.repeat(70));

    // لیست ارزها برای تحلیل
    const symbols = ['BTC', 'ETH', 'SOL'];

    // تحلیل همه ارزها
    const analyses: MarketAnalysis[] = [];

    for (const symbol of symbols) {
        const analysis = await analyzeSymbol(symbol);
        if (analysis) {
            analyses.push(analysis);
            displayAnalysisReport(analysis);
        }
    }

    // خلاصه کلی
    console.log('\n\n📊 خلاصه کلی بازار');
    console.log('='.repeat(70));

    const buySignals = analyses.filter(a => a.aiDecision.action === 'BUY');
    const sellSignals = analyses.filter(a => a.aiDecision.action === 'SELL');
    const holdSignals = analyses.filter(a => a.aiDecision.action === 'HOLD');

    console.log(`\n🟢 سیگنال خرید: ${buySignals.length}`);
    buySignals.forEach(a => {
        console.log(`   ${a.symbol}: ${a.aiDecision.confidence}% - ${a.recommendation}`);
    });

    console.log(`\n🔴 سیگنال فروش: ${sellSignals.length}`);
    sellSignals.forEach(a => {
        console.log(`   ${a.symbol}: ${a.aiDecision.confidence}% - ${a.recommendation}`);
    });

    console.log(`\n⏸️  سیگنال نگهداری: ${holdSignals.length}`);
    holdSignals.forEach(a => {
        console.log(`   ${a.symbol}: ${a.aiDecision.confidence}% - ${a.recommendation}`);
    });

    // بهترین فرصت‌ها
    if (buySignals.length > 0) {
        const bestBuy = buySignals.reduce((best, current) =>
            current.aiDecision.confidence > best.aiDecision.confidence ? current : best
        );
        console.log(`\n💎 بهترین فرصت خرید: ${bestBuy.symbol} (${bestBuy.aiDecision.confidence}%)`);
    }

    // میانگین احساسات بازار
    const avgSentiment = analyses.reduce((sum, a) => sum + a.sentiment.score, 0) / analyses.length;
    console.log(`\n🎭 میانگین احساسات بازار: ${(avgSentiment * 100).toFixed(1)}%`);

    if (avgSentiment > 0.6) {
        console.log('   ✅ احساسات کلی بازار مثبت است');
    } else if (avgSentiment < 0.4) {
        console.log('   ⚠️  احساسات کلی بازار منفی است');
    } else {
        console.log('   😐 احساسات بازار خنثی است');
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ تحلیل کامل به پایان رسید!');
    console.log('='.repeat(70));
}

// ============================================================================
// مثال ساخت گزارش HTML
// ============================================================================

async function generateHTMLReport() {
    console.log('\n📄 ساخت گزارش HTML...\n');

    const symbols = ['BTC', 'ETH', 'SOL'];
    const analyses: MarketAnalysis[] = [];

    for (const symbol of symbols) {
        const analysis = await analyzeSymbol(symbol);
        if (analysis) analyses.push(analysis);
    }

    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>گزارش تحلیل کامل کریپتو</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      background: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
    }
    .card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      background: #f9f9f9;
    }
    .card h2 {
      margin-top: 0;
      color: #667eea;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    .metric {
      background: white;
      padding: 15px;
      border-radius: 5px;
      border-left: 4px solid #667eea;
    }
    .metric-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    .positive { color: #22c55e; }
    .negative { color: #ef4444; }
    .neutral { color: #f59e0b; }
    .recommendation {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 گزارش تحلیل کامل کریپتو</h1>
    <p style="text-align: center; color: #666;">
      ${new Date().toLocaleString('fa-IR')}
    </p>
`;

    analyses.forEach(analysis => {
        const priceClass = analysis.priceChange24h >= 0 ? 'positive' : 'negative';
        const trendEmoji = analysis.technicalIndicators.trend === 'bullish' ? '📈' :
            analysis.technicalIndicators.trend === 'bearish' ? '📉' : '➡️';

        html += `
    <div class="card">
      <h2>${analysis.symbol}</h2>
      
      <div class="grid">
        <div class="metric">
          <div class="metric-label">قیمت فعلی</div>
          <div class="metric-value">$${analysis.price.toLocaleString()}</div>
        </div>
        
        <div class="metric">
          <div class="metric-label">تغییر 24 ساعته</div>
          <div class="metric-value ${priceClass}">
            ${analysis.priceChange24h > 0 ? '+' : ''}${analysis.priceChange24h.toFixed(2)}%
          </div>
        </div>
        
        <div class="metric">
          <div class="metric-label">RSI</div>
          <div class="metric-value">${analysis.technicalIndicators.rsi.toFixed(2)}</div>
        </div>
        
        <div class="metric">
          <div class="metric-label">روند ${trendEmoji}</div>
          <div class="metric-value">${analysis.technicalIndicators.trend}</div>
        </div>
        
        <div class="metric">
          <div class="metric-label">تصمیم AI</div>
          <div class="metric-value">${analysis.aiDecision.action}</div>
        </div>
        
        <div class="metric">
          <div class="metric-label">اطمینان AI</div>
          <div class="metric-value">${analysis.aiDecision.confidence}%</div>
        </div>
      </div>
      
      <div class="recommendation">
        ${analysis.recommendation}
      </div>
    </div>
`;
    });

    html += `
    <div class="footer">
      <p>داده‌ها از Crypto API Monitor</p>
      <p>این گزارش به صورت خودکار تولید شده است</p>
    </div>
  </div>
</body>
</html>
`;

    console.log('✅ گزارش HTML آماده شد!');
    console.log('\n📄 نمونه HTML:');
    console.log(html.substring(0, 500) + '...');

    // در Node.js می‌توانید فایل را ذخیره کنید:
    // const fs = require('fs');
    // fs.writeFileSync('crypto_analysis_report.html', html);

    return html;
}

// ============================================================================
// اجرای برنامه
// ============================================================================

async function main() {
    try {
        // اجرای داشبورد کامل
        await runCompleteDashboard();

        // ساخت گزارش HTML
        await generateHTMLReport();

    } catch (error) {
        console.error('\n❌ خطای کلی:', error);
    }
}

// اجرا
if (require.main === module) {
    main().catch(console.error);
}

export {
    analyzeSymbol,
    displayAnalysisReport, generateHTMLReport, runCompleteDashboard
};

