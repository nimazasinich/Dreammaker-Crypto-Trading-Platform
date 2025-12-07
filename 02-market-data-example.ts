/**
 * مثال 2: دریافت قیمت‌های بازار (Top Coins)
 * 
 * این مثال نشان می‌دهد چگونه لیست ارزهای برتر را دریافت کنید
 * و از آن‌ها برای نمایش، مقایسه، و تحلیل استفاده کنید.
 */

import { CoinInfo, CryptoAPIClient } from './CryptoAPIClient';

// ============================================================================
// تنظیمات اولیه
// ============================================================================

const client = new CryptoAPIClient({
    baseURL: 'https://huggingface.co/spaces/Really-amin/Datasourceforcryptocurrency-2',
    timeout: 15000,
});

// ============================================================================
// مثال 1: دریافت ساده لیست ارزها
// ============================================================================

async function example1_BasicTopCoins() {
    console.log('💰 مثال 1: دریافت ساده لیست ارزها\n');

    try {
        // دریافت 10 ارز برتر
        const response = await client.getTopCoins(10);

        console.log('✅ موفق!');
        console.log(`📊 تعداد ارز: ${response.data?.length || 0}`);
        console.log(`🔗 منبع: ${response.source}`);

        if (response.data) {
            console.log('\n💎 لیست ارزها:');
            response.data.forEach((coin, index) => {
                console.log(`  ${index + 1}. ${coin.name} (${coin.symbol})`);
                console.log(`     قیمت: $${coin.current_price.toLocaleString()}`);
                console.log(`     تغییر 24h: ${coin.price_change_percentage_24h.toFixed(2)}%`);
                console.log(`     مارکت کپ: $${(coin.market_cap / 1e9).toFixed(2)}B`);
            });
        }

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 2: مقایسه قیمت‌ها
// ============================================================================

async function example2_ComparePrices() {
    console.log('\n💰 مثال 2: مقایسه قیمت‌ها\n');

    try {
        const response = await client.getTopCoins(50);

        if (!response.data || response.data.length === 0) {
            console.log('❌ داده‌ای دریافت نشد');
            return;
        }

        // پیدا کردن بیشترین و کمترین تغییر
        const sortedByChange = [...response.data].sort(
            (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
        );

        console.log('🔝 بیشترین رشد 24 ساعته:');
        sortedByChange.slice(0, 5).forEach((coin, index) => {
            console.log(`  ${index + 1}. ${coin.name}: +${coin.price_change_percentage_24h.toFixed(2)}%`);
        });

        console.log('\n📉 بیشترین افت 24 ساعته:');
        sortedByChange.slice(-5).reverse().forEach((coin, index) => {
            console.log(`  ${index + 1}. ${coin.name}: ${coin.price_change_percentage_24h.toFixed(2)}%`);
        });

        // محاسبه میانگین تغییرات
        const avgChange = response.data.reduce(
            (sum, coin) => sum + coin.price_change_percentage_24h,
            0
        ) / response.data.length;

        console.log(`\n📊 میانگین تغییرات بازار: ${avgChange.toFixed(2)}%`);

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 3: فیلتر و جستجو
// ============================================================================

async function example3_FilterAndSearch() {
    console.log('\n💰 مثال 3: فیلتر و جستجو\n');

    try {
        const response = await client.getTopCoins(50);

        if (!response.data || response.data.length === 0) {
            console.log('❌ داده‌ای دریافت نشد');
            return;
        }

        // فیلتر 1: ارزهای با قیمت بالای $1000
        const expensiveCoins = response.data.filter(coin => coin.current_price > 1000);
        console.log(`💎 ارزهای با قیمت > $1000: ${expensiveCoins.length}`);
        expensiveCoins.forEach(coin => {
            console.log(`   ${coin.name}: $${coin.current_price.toLocaleString()}`);
        });

        // فیلتر 2: ارزهای با رشد مثبت
        const positiveCoins = response.data.filter(
            coin => coin.price_change_percentage_24h > 0
        );
        console.log(`\n📈 ارزهای با رشد مثبت: ${positiveCoins.length}/${response.data.length}`);

        // فیلتر 3: ارزهای با مارکت کپ بالا
        const largeCapCoins = response.data.filter(coin => coin.market_cap > 10e9); // > 10B
        console.log(`\n🏆 ارزهای با مارکت کپ > $10B: ${largeCapCoins.length}`);
        largeCapCoins.forEach(coin => {
            console.log(`   ${coin.name}: $${(coin.market_cap / 1e9).toFixed(2)}B`);
        });

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 4: ساخت پورتفولیو
// ============================================================================

interface PortfolioItem {
    coin: CoinInfo;
    amount: number;
    value: number;
}

async function example4_BuildPortfolio() {
    console.log('\n💰 مثال 4: ساخت پورتفولیو\n');

    try {
        const response = await client.getTopCoins(50);

        if (!response.data || response.data.length === 0) {
            console.log('❌ داده‌ای دریافت نشد');
            return;
        }

        // پورتفولیوی فرضی
        const holdings: { [symbol: string]: number } = {
            'BTC': 0.5,      // 0.5 Bitcoin
            'ETH': 5,        // 5 Ethereum
            'SOL': 100,      // 100 Solana
            'ADA': 1000,     // 1000 Cardano
        };

        const portfolio: PortfolioItem[] = [];
        let totalValue = 0;

        console.log('📊 پورتفولیوی شما:\n');

        Object.entries(holdings).forEach(([symbol, amount]) => {
            const coin = response.data?.find(c => c.symbol === symbol);
            if (coin) {
                const value = coin.current_price * amount;
                portfolio.push({ coin, amount, value });
                totalValue += value;

                console.log(`💎 ${coin.name} (${symbol})`);
                console.log(`   مقدار: ${amount} ${symbol}`);
                console.log(`   قیمت: $${coin.current_price.toLocaleString()}`);
                console.log(`   ارزش: $${value.toLocaleString()}`);
                console.log(`   تغییر 24h: ${coin.price_change_percentage_24h.toFixed(2)}%`);
                console.log('');
            }
        });

        console.log(`💰 ارزش کل پورتفولیو: $${totalValue.toLocaleString()}`);

        // محاسبه درصد هر دارایی
        console.log('\n📊 توزیع پورتفولیو:');
        portfolio.forEach(item => {
            const percentage = (item.value / totalValue) * 100;
            console.log(`   ${item.coin.symbol}: ${percentage.toFixed(2)}%`);
        });

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 5: نظارت بر قیمت (Price Alert)
// ============================================================================

async function example5_PriceAlert() {
    console.log('\n💰 مثال 5: نظارت بر قیمت\n');

    // تنظیمات هشدار
    const alerts = [
        { symbol: 'BTC', targetPrice: 50000, type: 'above' as const },
        { symbol: 'ETH', targetPrice: 2000, type: 'below' as const },
    ];

    try {
        const response = await client.getTopCoins(50);

        if (!response.data || response.data.length === 0) {
            console.log('❌ داده‌ای دریافت نشد');
            return;
        }

        console.log('🔔 بررسی هشدارهای قیمت:\n');

        alerts.forEach(alert => {
            const coin = response.data?.find(c => c.symbol === alert.symbol);
            if (coin) {
                const currentPrice = coin.current_price;
                const triggered = alert.type === 'above'
                    ? currentPrice > alert.targetPrice
                    : currentPrice < alert.targetPrice;

                if (triggered) {
                    console.log(`🚨 هشدار! ${coin.name} (${alert.symbol})`);
                    console.log(`   قیمت فعلی: $${currentPrice.toLocaleString()}`);
                    console.log(`   قیمت هدف: $${alert.targetPrice.toLocaleString()}`);
                    console.log(`   شرط: ${alert.type === 'above' ? 'بالای' : 'زیر'}`);
                } else {
                    console.log(`✅ ${coin.name}: $${currentPrice.toLocaleString()} (هنوز trigger نشده)`);
                }
            }
        });

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 6: ترکیب با نرخ معامله
// ============================================================================

async function example6_CombineWithServiceRate() {
    console.log('\n💰 مثال 6: ترکیب با نرخ معامله\n');

    try {
        // دریافت لیست ارزها
        const coinsResponse = await client.getTopCoins(5);

        if (!coinsResponse.data || coinsResponse.data.length === 0) {
            console.log('❌ داده‌ای دریافت نشد');
            return;
        }

        console.log('💱 مقایسه قیمت‌ها از منابع مختلف:\n');

        for (const coin of coinsResponse.data) {
            try {
                // دریافت نرخ معامله
                const rateResponse = await client.getServiceRate(`${coin.symbol}/USDT`);

                console.log(`📊 ${coin.name} (${coin.symbol})`);
                console.log(`   قیمت از لیست: $${coin.current_price.toLocaleString()}`);

                if (rateResponse.success) {
                    console.log(`   قیمت از معامله: $${rateResponse.price.toLocaleString()}`);
                    console.log(`   حجم 24h: $${(rateResponse.volume_24h || 0).toLocaleString()}`);
                    console.log(`   منبع: ${rateResponse.source}`);
                }

                console.log('');

            } catch (error) {
                console.log(`   ⚠️  نرخ معامله در دسترس نیست\n`);
            }
        }

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// مثال 7: ساخت جدول HTML
// ============================================================================

async function example7_GenerateHTMLTable() {
    console.log('\n💰 مثال 7: ساخت جدول HTML\n');

    try {
        const response = await client.getTopCoins(10);

        if (!response.data || response.data.length === 0) {
            console.log('❌ داده‌ای دریافت نشد');
            return;
        }

        let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Top Cryptocurrencies</title>
  <style>
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    .positive { color: green; }
    .negative { color: red; }
  </style>
</head>
<body>
  <h1>Top 10 Cryptocurrencies</h1>
  <table>
    <tr>
      <th>#</th>
      <th>Name</th>
      <th>Symbol</th>
      <th>Price</th>
      <th>24h Change</th>
      <th>Market Cap</th>
    </tr>
`;

        response.data.forEach((coin, index) => {
            const changeClass = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';
            html += `
    <tr>
      <td>${index + 1}</td>
      <td>${coin.name}</td>
      <td>${coin.symbol}</td>
      <td>$${coin.current_price.toLocaleString()}</td>
      <td class="${changeClass}">${coin.price_change_percentage_24h.toFixed(2)}%</td>
      <td>$${(coin.market_cap / 1e9).toFixed(2)}B</td>
    </tr>
`;
        });

        html += `
  </table>
  <p>Data source: ${response.source}</p>
</body>
</html>
`;

        console.log('✅ HTML آماده شد!');
        console.log('\n📄 نمونه HTML:');
        console.log(html.substring(0, 500) + '...');

        // در Node.js می‌توانید فایل را ذخیره کنید:
        // const fs = require('fs');
        // fs.writeFileSync('top_coins.html', html);

    } catch (error) {
        console.error('❌ خطا:', error);
    }
}

// ============================================================================
// اجرای همه مثال‌ها
// ============================================================================

async function runAllExamples() {
    console.log('🚀 شروع مثال‌های Market Data\n');
    console.log('='.repeat(60));

    await example1_BasicTopCoins();
    console.log('\n' + '='.repeat(60));

    await example2_ComparePrices();
    console.log('\n' + '='.repeat(60));

    await example3_FilterAndSearch();
    console.log('\n' + '='.repeat(60));

    await example4_BuildPortfolio();
    console.log('\n' + '='.repeat(60));

    await example5_PriceAlert();
    console.log('\n' + '='.repeat(60));

    await example6_CombineWithServiceRate();
    console.log('\n' + '='.repeat(60));

    await example7_GenerateHTMLTable();
    console.log('\n' + '='.repeat(60));

    console.log('\n✅ همه مثال‌ها اجرا شدند!');
}

// اجرا
if (require.main === module) {
    runAllExamples().catch(console.error);
}

export {
    example1_BasicTopCoins,
    example2_ComparePrices,
    example3_FilterAndSearch,
    example4_BuildPortfolio,
    example5_PriceAlert,
    example6_CombineWithServiceRate,
    example7_GenerateHTMLTable
};

