/**
 * مثال 3: تحلیل احساسات بازار
 * 
 * این مثال نحوه استفاده از ابزارهای تحلیل احساسات را نشان می‌دهد
 */

import { CryptoDataClient } from '../crypto-client';

async function sentimentAnalysis() {
  console.log('🎭 مثال تحلیل احساسات\n');
  console.log('='.repeat(60));
  
  const client = new CryptoDataClient();
  
  try {
    // 1. احساسات کلی بازار
    console.log('\n1️⃣ احساسات کلی بازار (24 ساعت گذشته):');
    const sentiment = await client.getGlobalSentiment('1D');
    
    const sentimentEmoji = {
      'extreme_fear': '😱 ترس شدید',
      'fear': '😨 ترس',
      'neutral': '😐 خنثی',
      'greed': '😊 طمع',
      'extreme_greed': '🤑 طمع شدید'
    }[sentiment.sentiment] || '😐 نامشخص';
    
    console.log(`\n   ${sentimentEmoji}`);
    console.log(`   📊 شاخص ترس و طمع: ${sentiment.fear_greed_index}/100`);
    console.log(`   🎯 سطح اطمینان: ${(sentiment.confidence * 100).toFixed(1)}%`);
    console.log(`   💭 حالت بازار: ${sentiment.market_mood}`);
    
    // نمایش تاریخچه
    console.log('\n   📈 روند اخیر احساسات:');
    sentiment.history.slice(0, 7).forEach((point, index) => {
      const date = new Date(point.timestamp * 1000);
      const bar = '█'.repeat(Math.floor(point.sentiment / 10));
      console.log(`   ${date.toLocaleDateString('fa-IR')}: ${bar} ${point.sentiment}`);
    });
    
    // 2. احساسات ارزهای خاص
    console.log('\n2️⃣ احساسات ارزهای محبوب:');
    const symbols = ['BTC', 'ETH', 'BNB', 'XRP'];
    
    for (const symbol of symbols) {
      try {
        const assetSentiment = await client.getAssetSentiment(symbol);
        const emoji = {
          'extreme_fear': '😱',
          'fear': '😨',
          'neutral': '😐',
          'greed': '😊',
          'extreme_greed': '🤑'
        }[assetSentiment.sentiment] || '😐';
        
        console.log(
          `   ${emoji} ${symbol.padEnd(6)} | ` +
          `احساس: ${assetSentiment.sentiment.padEnd(15)} | ` +
          `امتیاز: ${assetSentiment.score.toFixed(2)} | ` +
          `منابع: ${assetSentiment.sources}`
        );
      } catch (error) {
        console.log(`   ❓ ${symbol.padEnd(6)} | داده موجود نیست`);
      }
    }
    
    // 3. تحلیل متن‌های مختلف
    console.log('\n3️⃣ تحلیل احساسات متن:');
    
    const testTexts = [
      'Bitcoin is pumping to the moon! This is amazing!',
      'Market is crashing hard. Everyone is selling.',
      'Stable market today, no major movements.',
      'Ethereum showing strong support levels.',
      'Warning: Major correction incoming, be careful!'
    ];
    
    for (const text of testTexts) {
      const analysis = await client.analyzeText(text);
      const emoji = {
        'extreme_fear': '😱',
        'fear': '😨',
        'neutral': '😐',
        'greed': '😊',
        'extreme_greed': '🤑'
      }[analysis.sentiment] || '😐';
      
      console.log(`\n   ${emoji} "${text.substring(0, 50)}..."`);
      console.log(`      احساس: ${analysis.sentiment} (امتیاز: ${analysis.score.toFixed(2)})`);
      console.log(`      اطمینان: ${(analysis.confidence * 100).toFixed(1)}%`);
      if (analysis.keywords.length > 0) {
        console.log(`      کلمات کلیدی: ${analysis.keywords.join(', ')}`);
      }
    }
    
    // 4. مقایسه احساسات در بازه‌های زمانی مختلف
    console.log('\n4️⃣ مقایسه احساسات در بازه‌های زمانی:');
    
    const timeframes: Array<'1D' | '7D' | '30D'> = ['1D', '7D', '30D'];
    for (const timeframe of timeframes) {
      const tfSentiment = await client.getGlobalSentiment(timeframe);
      console.log(
        `   ${timeframe.padEnd(4)} | ` +
        `شاخص: ${tfSentiment.fear_greed_index.toString().padStart(3)} | ` +
        `احساس: ${tfSentiment.sentiment}`
      );
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ تحلیل احساسات با موفقیت انجام شد!');
    
  } catch (error) {
    console.error('\n❌ خطا در تحلیل احساسات:', error);
    throw error;
  }
}

// اجرای مثال
if (require.main === module) {
  sentimentAnalysis()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default sentimentAnalysis;
