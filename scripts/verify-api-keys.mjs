#!/usr/bin/env node
// scripts/verify-api-keys.mjs
// Quick script to verify all API keys are loaded from environment

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load environment variables
dotenv.config({ path: join(rootDir, 'env') });

console.log('\n🔍 Verifying API Keys Configuration...\n');

const keys = [
  { name: 'HuggingFace', vars: ['HF_TOKEN', 'HUGGINGFACE_API_KEY'], required: true },
  { name: 'TronScan', vars: ['TronScan', 'TRONSCAN_API_KEY'], required: false },
  { name: 'BscScan', vars: ['BscScan', 'BSCSCAN_API_KEY'], required: false },
  { name: 'Etherscan', vars: ['Etherscan', 'ETHERSCAN_API_KEY'], required: false },
  { name: 'Etherscan Backup', vars: ['Etherscan_2', 'ETHERSCAN_BACKUP_API_KEY'], required: false },
  { name: 'NewsAPI', vars: ['NEWS_API_KEY', 'NEWSAPI_KEY'], required: false },
  { name: 'CoinMarketCap', vars: ['CMC_API_KEY', 'COINMARKETCAP_API_KEY'], required: false },
  { name: 'CryptoCompare', vars: ['CRYPTOCOMPARE_API_KEY'], required: false },
];

const securityVars = [
  { name: 'FRONTEND_ORIGIN', required: true },
  { name: 'SESSION_SECRET', required: true },
  { name: 'RATE_LIMIT_WINDOW_MS', required: false },
  { name: 'RATE_LIMIT_MAX_REQUESTS', required: false },
];

let allGood = true;
let configuredCount = 0;

// Check API keys
console.log('📊 API Keys Status:\n');
for (const key of keys) {
  let found = false;
  let value = '';
  
  for (const varName of key.vars) {
    if (process.env[varName]) {
      found = true;
      value = process.env[varName];
      break;
    }
  }
  
  if (found) {
    // Mask the key for security
    const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4);
    console.log(`  ✅ ${key.name.padEnd(20)} ${masked}`);
    configuredCount++;
  } else {
    const status = key.required ? '❌ REQUIRED' : '⚠️  Optional';
    console.log(`  ${status} ${key.name.padEnd(20)} Not configured`);
    if (key.required) allGood = false;
  }
}

// Check security variables
console.log('\n🔒 Security Variables:\n');
for (const secVar of securityVars) {
  const value = process.env[secVar.name];
  if (value) {
    console.log(`  ✅ ${secVar.name.padEnd(25)} ${value.substring(0, 30)}...`);
  } else {
    const status = secVar.required ? '❌ REQUIRED' : '⚠️  Optional';
    console.log(`  ${status} ${secVar.name.padEnd(25)} Not configured`);
    if (secVar.required) allGood = false;
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📈 Summary:`);
console.log(`  • API Keys Configured: ${configuredCount}/${keys.length}`);
console.log(`  • Required Keys: ${allGood ? '✅ All present' : '❌ Missing required keys'}`);
console.log(`  • Security Variables: ${securityVars.filter(v => process.env[v.name]).length}/${securityVars.length}`);

if (allGood && configuredCount >= 5) {
  console.log(`\n✅ Configuration is EXCELLENT! Ready to run.`);
  process.exit(0);
} else if (allGood) {
  console.log(`\n✅ Configuration is GOOD. Core services will work.`);
  console.log(`   (Consider adding more API keys for additional data sources)`);
  process.exit(0);
} else {
  console.log(`\n❌ Configuration INCOMPLETE. Please add required API keys.`);
  console.log(`   See env.example for configuration template.`);
  process.exit(1);
}

