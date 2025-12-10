/**
 * مثال 4: سیگنال‌ها و تصمیمات معاملاتی AI
 * 
 * این مثال نحوه استفاده از قابلیت‌های AI برای معامله را نشان می‌دهد
 */

import { CryptoDataClient } from '../crypto-client';
import type { TradingHorizon, RiskTolerance } from '../types';

async function aiTradingExample() {
  console.log('🤖 مثال معامله با کمک AI\n');
  console.log('='.repeat(60));
  
  const client = new CryptoDataClient();
  
  try {
    // 1. دریافت سیگنال‌های معاملاتی
    console.log('\n1️⃣ سیگنال‌های معاملاتی AI:');
    
    const symbols = ['BTC', 'ETH'];
    for (const symbol of symbols) {
      console.log(`\n   📊 سیگنال‌ها برای ${symbol}:`);
      const signals = await client.getSignals(symbol);
      
      if (signals.count === 0) {
        console.log('   ℹ️  هیچ سیگنالی موجود نیست');
        continue;
      }
      
      signals.signals.slice(0, 3).forEach((signal, index) => {
        const typeEmoji = {
          'buy': '🟢',
          'sell': '🔴',
          'hold': '🟡'
        }[signal.type] || '⚪';
        
        console.log(`\n   ${typeEmoji} سیگنال ${index + 1}:`);
        console.log(`      نوع: ${signal.type.toUpperCase()}`);
        console.log(`      امتیاز: ${signal.score.toFixed(2)}`);
        console.log(`      اطمینان: ${(signal.confidence * 100).toFixed(1)}%`);
        console.log(`      مدل: ${signal.model}`);
        console.log(`      زمان: ${new Date(signal.created_at).toLocaleString('fa-IR')}`);
      });
    }
    
    // 2. تصمیمات معاملاتی AI برای سناریوهای مختلف
    console.log('\n\n2️⃣ تصمیمات معاملاتی AI:');
    
    const scenarios: Array<{
      symbol: string;
      horizon: TradingHorizon;
      risk: RiskTolerance;
      description: string;
    }> = [
      {
        symbol: 'BTC',
        horizon: 'scalp',
        risk: 'conservative',
        description: 'معامله کوتاه‌مدت محافظه‌کارانه BTC'
      },
      {
        symbol: 'BTC',
        horizon: 'swing',
        risk: 'moderate',
        description: 'معامله میان‌مدت متعادل BTC'
      },
      {
        symbol: 'ETH',
        horizon: 'position',
        risk: 'aggressive',
        description: 'معامله بلندمدت پرریسک ETH'
      }
    ];
    
    for (const scenario of scenarios) {
      console.log(`\n   ${'-'.repeat(56)}`);
      console.log(`   📋 سناریو: ${scenario.description}`);
      console.log(`   ${'-'.repeat(56)}`);
      
      const decision = await client.getDecision({
        symbol: scenario.symbol,
        horizon: scenario.horizon,
        risk_tolerance: scenario.risk
      });
      
      const decisionEmoji = {
        'BUY': '🟢',
        'SELL': '🔴',
        'HOLD': '🟡'
      }[decision.decision] || '⚪';
      
      console.log(`\n   ${decisionEmoji} تصمیم نهایی: ${decision.decision}`);
      console.log(`   📊 سطح اطمینان: ${(decision.confidence * 100).toFixed(1)}%`);
      console.log(`\n   📝 خلاصه:\n      ${decision.summary}`);
      
      console.log(`\n   🎯 اهداف قیمتی:`);
      console.log(`      حمایت:    $${decision.targets.support.toLocaleString()}`);
      console.log(`      مقاومت:   $${decision.targets.resistance.toLocaleString()}`);
      console.log(`      هدف:      $${decision.targets.target.toLocaleString()}`);
      
      if (decision.signals.length > 0) {
        console.log(`\n   🚦 سیگنال‌های تشخیص داده شده:`);
        decision.signals.forEach(sig => {
          console.log(`      ${sig.type}: ${sig.text}`);
        });
      }
      
      if (decision.risks.length > 0) {
        console.log(`\n   ⚠️  ریسک‌ها:`);
        decision.risks.forEach(risk => {
          console.log(`      • ${risk}`);
        });
      }
    }
    
    // 3. بررسی وضعیت مدل‌های AI
    console.log('\n\n3️⃣ وضعیت مدل‌های AI:');
    
    const modelsStatus = await client.getModelsStatus();
    console.log(`   📊 تعداد کل مدل‌ها: ${modelsStatus.total}`);
    console.log(`   ✅ مدل‌های بارگذاری شده: ${modelsStatus.loaded}`);
    
    console.log('\n   📋 لیست مدل‌ها:');
    modelsStatus.models.slice(0, 5).forEach(model => {
      const statusEmoji = model.loaded ? '✅' : '⏳';
      console.log(
        `      ${statusEmoji} ${model.key.padEnd(20)} | ` +
        `وضعیت: ${model.status}`
      );
    });
    
    // 4. سلامت مدل‌ها
    console.log('\n4️⃣ سلامت مدل‌های AI:');
    const modelsHealth = await client.getModelsHealth();
    console.log(`   🏥 وضعیت کلی: ${modelsHealth.overall_health}`);
    
    if (modelsHealth.models.length > 0) {
      modelsHealth.models.slice(0, 5).forEach(model => {
        const healthEmoji = model.health === 'healthy' ? '💚' : '💛';
        console.log(
          `      ${healthEmoji} ${model.key.padEnd(20)} | ` +
          `${model.latency_ms ? `تاخیر: ${model.latency_ms}ms` : 'N/A'}`
        );
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ تحلیل معاملاتی AI با موفقیت انجام شد!');
    
  } catch (error) {
    console.error('\n❌ خطا در تحلیل AI:', error);
    throw error;
  }
}

// اجرای مثال
if (require.main === module) {
  aiTradingExample()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default aiTradingExample;
