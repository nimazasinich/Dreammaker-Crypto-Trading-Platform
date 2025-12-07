/**
 * مثال 3: دریافت اخبار (Latest News)
 * 
 * این مثال نشان می‌دهد چگونه آخرین اخبار کریپتو را دریافت کنید
 * و از آن‌ها برای تحلیل، نمایش، و هشدار استفاده کنید.
 */

import { CryptoAPIClient, NewsArticle } from './CryptoAPIClient';

// ============================================================================
// تنظیمات اولیه
// ============================================================================

const client = new CryptoAPIClient({
    baseURL: 'https://huggingface.co/spaces/Really-amin/Datasourceforcryptocurrency-2',
    timeout: 15000,
});

// ============================================================================
// مثال 1: دریافت ساده اخبار
// ============================================================================

async function example1_BasicNews() {
    console.log('📰 مثال 1: دریافت ساده اخبار\n');

    try {
        // دریافت 20 خبر آخر
        const response = await client.getNews(20);

        const articles = response.news || response.articles || [];

        console.log('✅ موفق!');
        console.log(`📊 تعداد اخبار: ${articles.length}`);
        console.log(`🔗 منبع: ${response.source}`);

        console.log('\n📰 لیست اخبار:');
        articles.forEach((article, index) => {
            console.log(`\n${index + 1}. ${article.title}`);
            console.log(`   منبع: ${article.source}`);
            console.log(`   زمان: ${new Date(article.published_at).toLocaleString()}`);
            console.log(`   خلاصه: ${article.summary}`);
            if (article.sentiment) {
                console.log(`   احساسات: ${article.sentiment}`);
            }
        });

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 2: فیلتر اخبار بر اساس کلمات کلیدی
// ============================================================================

async function example2_FilterByKeywords() {
    console.log('\n📰 مثال 2: فیلتر اخبار بر اساس کلمات کلیدی\n');

    const keywords = ['Bitcoin', 'BTC', 'Ethereum', 'ETH'];

    try {
        const response = await client.getNews(50);
        const articles = response.news || response.articles || [];

        if (articles.length === 0) {
            console.log('❌ خبری دریافت نشد');
            return;
        }

        console.log(`🔍 جستجو برای: ${keywords.join(', ')}\n`);

        const filtered = articles.filter(article => {
            const text = `${article.title} ${article.summary}`.toLowerCase();
            return keywords.some(keyword => text.includes(keyword.toLowerCase()));
        });

        console.log(`✅ ${filtered.length} خبر مرتبط یافت شد:\n`);

        filtered.forEach((article, index) => {
            console.log(`${index + 1}. ${article.title}`);
            console.log(`   منبع: ${article.source}`);
            console.log(`   زمان: ${new Date(article.published_at).toLocaleString()}\n`);
        });

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 3: دسته‌بندی اخبار بر اساس منبع
// ============================================================================

async function example3_GroupBySource() {
    console.log('\n📰 مثال 3: دسته‌بندی اخبار بر اساس منبع\n');

    try {
        const response = await client.getNews(50);
        const articles = response.news || response.articles || [];

        if (articles.length === 0) {
            console.log('❌ خبری دریافت نشد');
            return;
        }

        // دسته‌بندی بر اساس منبع
        const bySource: { [source: string]: NewsArticle[] } = {};

        articles.forEach(article => {
            if (!bySource[article.source]) {
                bySource[article.source] = [];
            }
            bySource[article.source].push(article);
        });

        console.log('📊 اخبار به تفکیک منبع:\n');

        Object.entries(bySource).forEach(([source, sourceArticles]) => {
            console.log(`📰 ${source}: ${sourceArticles.length} خبر`);
            sourceArticles.slice(0, 3).forEach(article => {
                console.log(`   • ${article.title}`);
            });
            console.log('');
        });

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 4: تحلیل زمانی اخبار
// ============================================================================

async function example4_TimeAnalysis() {
    console.log('\n📰 مثال 4: تحلیل زمانی اخبار\n');

    try {
        const response = await client.getNews(50);
        const articles = response.news || response.articles || [];

        if (articles.length === 0) {
            console.log('❌ خبری دریافت نشد');
            return;
        }

        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const lastHour = articles.filter(
            article => new Date(article.published_at) > oneHourAgo
        );

        const last24Hours = articles.filter(
            article => new Date(article.published_at) > oneDayAgo
        );

        console.log('⏰ تحلیل زمانی:');
        console.log(`   اخبار ساعت گذشته: ${lastHour.length}`);
        console.log(`   اخبار 24 ساعت گذشته: ${last24Hours.length}`);

        if (lastHour.length > 0) {
            console.log('\n🔥 اخبار داغ (ساعت گذشته):');
            lastHour.forEach((article, index) => {
                const minutesAgo = Math.floor(
                    (now.getTime() - new Date(article.published_at).getTime()) / 60000
                );
                console.log(`   ${index + 1}. ${article.title}`);
                console.log(`      (${minutesAgo} دقیقه پیش)`);
            });
        }

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 5: ترکیب اخبار با تحلیل احساسات
// ============================================================================

async function example5_NewsWithSentiment() {
    console.log('\n📰 مثال 5: ترکیب اخبار با تحلیل احساسات\n');

    try {
        const response = await client.getNews(10);
        const articles = response.news || response.articles || [];

        if (articles.length === 0) {
            console.log('❌ خبری دریافت نشد');
            return;
        }

        console.log('🎭 تحلیل احساسات اخبار:\n');

        for (const article of articles) {
            try {
                // تحلیل احساسات عنوان و خلاصه
                const text = `${article.title}. ${article.summary}`;
                const sentiment = await client.analyzeSentiment(text);

                console.log(`📰 ${article.title}`);
                console.log(`   منبع: ${article.source}`);
                console.log(`   احساسات: ${sentiment.label} (${(sentiment.score * 100).toFixed(1)}%)`);

                // نمایش emoji بر اساس احساسات
                let emoji = '😐';
                if (sentiment.label === 'bullish') emoji = '🚀';
                else if (sentiment.label === 'bearish') emoji = '📉';
                else if (sentiment.label === 'positive') emoji = '😊';
                else if (sentiment.label === 'negative') emoji = '😟';

                console.log(`   ${emoji}\n`);

            } catch (error) {
                console.log(`   ⚠️  تحلیل احساسات ناموفق\n`);
            }
        }

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 6: ساخت RSS Feed
// ============================================================================

async function example6_GenerateRSS() {
    console.log('\n📰 مثال 6: ساخت RSS Feed\n');

    try {
        const response = await client.getNews(20);
        const articles = response.news || response.articles || [];

        if (articles.length === 0) {
            console.log('❌ خبری دریافت نشد');
            return;
        }

        let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Crypto News Feed</title>
    <description>Latest cryptocurrency news</description>
    <link>https://example.com</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
`;

        articles.forEach(article => {
            rss += `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <description><![CDATA[${article.summary}]]></description>
      <link>${article.url}</link>
      <pubDate>${new Date(article.published_at).toUTCString()}</pubDate>
      <source>${article.source}</source>
    </item>
`;
        });

        rss += `
  </channel>
</rss>
`;

        console.log('✅ RSS Feed آماده شد!');
        console.log('\n📄 نمونه RSS:');
        console.log(rss.substring(0, 500) + '...');

        // در Node.js می‌توانید فایل را ذخیره کنید:
        // const fs = require('fs');
        // fs.writeFileSync('crypto_news.xml', rss);

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 7: هشدار اخبار مهم
// ============================================================================

async function example7_ImportantNewsAlert() {
    console.log('\n📰 مثال 7: هشدار اخبار مهم\n');

    // کلمات کلیدی مهم
    const importantKeywords = [
        'regulation',
        'sec',
        'etf',
        'hack',
        'security',
        'crash',
        'surge',
        'all-time high',
        'ath',
    ];

    try {
        const response = await client.getNews(50);
        const articles = response.news || response.articles || [];

        if (articles.length === 0) {
            console.log('❌ خبری دریافت نشد');
            return;
        }

        console.log('🚨 بررسی اخبار مهم:\n');

        const importantNews = articles.filter(article => {
            const text = `${article.title} ${article.summary}`.toLowerCase();
            return importantKeywords.some(keyword => text.includes(keyword));
        });

        if (importantNews.length > 0) {
            console.log(`⚠️  ${importantNews.length} خبر مهم یافت شد!\n`);

            importantNews.forEach((article, index) => {
                console.log(`🚨 ${index + 1}. ${article.title}`);
                console.log(`   منبع: ${article.source}`);
                console.log(`   زمان: ${new Date(article.published_at).toLocaleString()}`);
                console.log(`   لینک: ${article.url}\n`);
            });
        } else {
            console.log('✅ خبر مهمی یافت نشد');
        }

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 8: ساخت Newsletter
// ============================================================================

async function example8_GenerateNewsletter() {
    console.log('\n📰 مثال 8: ساخت Newsletter\n');

    try {
        const response = await client.getNews(10);
        const articles = response.news || response.articles || [];

        if (articles.length === 0) {
            console.log('❌ خبری دریافت نشد');
            return;
        }

        let newsletter = `
<!DOCTYPE html>
<html>
<head>
  <title>Daily Crypto Newsletter</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
    .article { border-bottom: 1px solid #eee; padding: 20px 0; }
    .article h2 { color: #333; margin: 0 0 10px 0; }
    .meta { color: #666; font-size: 14px; margin: 5px 0; }
    .summary { color: #444; line-height: 1.6; }
    .footer { text-align: center; padding: 20px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📰 Daily Crypto Newsletter</h1>
    <p>${new Date().toLocaleDateString()}</p>
  </div>
  
  <div class="content">
`;

        articles.forEach((article, index) => {
            newsletter += `
    <div class="article">
      <h2>${index + 1}. ${article.title}</h2>
      <div class="meta">
        <span>📰 ${article.source}</span> | 
        <span>⏰ ${new Date(article.published_at).toLocaleString()}</span>
      </div>
      <p class="summary">${article.summary}</p>
      <a href="${article.url}">Read more →</a>
    </div>
`;
        });

        newsletter += `
  </div>
  
  <div class="footer">
    <p>Data provided by Crypto API Monitor</p>
    <p>Source: ${response.source}</p>
  </div>
</body>
</html>
`;

        console.log('✅ Newsletter آماده شد!');
        console.log('\n📄 نمونه Newsletter:');
        console.log(newsletter.substring(0, 500) + '...');

        // در Node.js می‌توانید فایل را ذخیره کنید:
        // const fs = require('fs');
        // fs.writeFileSync('newsletter.html', newsletter);

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// اجرای همه مثال‌ها
// ============================================================================

async function runAllExamples() {
    console.log('🚀 شروع مثال‌های News\n');
    console.log('='.repeat(60));

    await example1_BasicNews();
    console.log('\n' + '='.repeat(60));

    await example2_FilterByKeywords();
    console.log('\n' + '='.repeat(60));

    await example3_GroupBySource();
    console.log('\n' + '='.repeat(60));

    await example4_TimeAnalysis();
    console.log('\n' + '='.repeat(60));

    await example5_NewsWithSentiment();
    console.log('\n' + '='.repeat(60));

    await example6_GenerateRSS();
    console.log('\n' + '='.repeat(60));

    await example7_ImportantNewsAlert();
    console.log('\n' + '='.repeat(60));

    await example8_GenerateNewsletter();
    console.log('\n' + '='.repeat(60));

    console.log('\n✅ همه مثال‌ها اجرا شدند!');
}

// اجرا
if (require.main === module) {
    runAllExamples().catch(console.error);
}

export {
    example1_BasicNews,
    example2_FilterByKeywords,
    example3_GroupBySource,
    example4_TimeAnalysis,
    example5_NewsWithSentiment,
    example6_GenerateRSS,
    example7_ImportantNewsAlert,
    example8_GenerateNewsletter
};

