#!/usr/bin/env tsx

/**
 * Environment Variable Validation Script
 * Run before deployment to ensure proper configuration
 * 
 * Usage:
 *   npm run validate:env           # Validate .env
 *   npm run validate:env:prod      # Validate .env.production
 *   tsx scripts/validate-env.ts .env.custom
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationRule {
  key: string;
  required: boolean;
  expectedValue?: string | string[];
  pattern?: RegExp;
  description: string;
  productionOnly?: boolean;
}

const PRODUCTION_RULES: ValidationRule[] = [
  {
    key: 'VITE_APP_MODE',
    required: true,
    expectedValue: 'online',
    description: 'Must be online mode for production',
    productionOnly: true
  },
  {
    key: 'VITE_STRICT_REAL_DATA',
    required: true,
    expectedValue: 'true',
    description: 'Strict real data mode must be enabled',
    productionOnly: true
  },
  {
    key: 'VITE_USE_MOCK_DATA',
    required: true,
    expectedValue: 'false',
    description: 'Mock data must be disabled',
    productionOnly: true
  },
  {
    key: 'VITE_ALLOW_FAKE_DATA',
    required: true,
    expectedValue: 'false',
    description: 'Fake data must be disabled',
    productionOnly: true
  },
  {
    key: 'HF_ENGINE_BASE_URL',
    required: true,
    pattern: /^https:\/\/[a-z0-9-]+\.hf\.space$/,
    description: 'Must be a valid HuggingFace Space URL (lowercase only)'
  },
  {
    key: 'PRIMARY_DATA_SOURCE',
    required: true,
    expectedValue: 'huggingface',
    description: 'Must use HuggingFace as primary data source'
  },
  {
    key: 'HF_ENGINE_ENABLED',
    required: true,
    expectedValue: 'true',
    description: 'HuggingFace engine must be enabled'
  },
  {
    key: 'HF_TOKEN',
    required: false, // Optional for public spaces
    pattern: /^hf_[a-zA-Z0-9]{30,}$/,
    description: 'Valid HuggingFace token (if provided)'
  }
];

function parseEnvFile(envPath: string): Record<string, string> {
  const envVars: Record<string, string> = {};
  
  if (!fs.existsSync(envPath)) {
    return envVars;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  envContent.split('\n').forEach(line => {
    // Skip comments and empty lines
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }
    
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) {
      // Remove quotes if present
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      envVars[match[1]] = value;
    }
  });
  
  return envVars;
}

function validateEnvironment(envPath: string = '.env', isProduction: boolean = false): boolean {
  console.log('🔍 Validating environment configuration...');
  console.log(`   File: ${envPath}`);
  console.log(`   Mode: ${isProduction ? 'Production' : 'Development'}\n`);
  
  // Check if file exists
  if (!fs.existsSync(envPath)) {
    console.error(`❌ Environment file not found: ${envPath}`);
    console.error('   Create one from env.example:\n');
    console.error(`   cp env.example ${envPath}\n`);
    return false;
  }
  
  const envVars = parseEnvFile(envPath);
  
  let hasErrors = false;
  let hasWarnings = false;
  const results: { status: string; key: string; value?: string; message?: string }[] = [];
  
  // Filter rules based on mode
  const applicableRules = PRODUCTION_RULES.filter(rule => 
    !rule.productionOnly || isProduction
  );
  
  // Validate each rule
  for (const rule of applicableRules) {
    const value = envVars[rule.key];
    
    // Check if required
    if (rule.required && (!value || value === '')) {
      results.push({
        status: 'error',
        key: rule.key,
        message: `REQUIRED: ${rule.description}`
      });
      hasErrors = true;
      continue;
    }
    
    // Skip further checks if value is empty and not required
    if (!value || value === '') {
      results.push({
        status: 'skip',
        key: rule.key,
        message: 'Optional, not set'
      });
      continue;
    }
    
    // Check expected value
    if (rule.expectedValue) {
      const expected = Array.isArray(rule.expectedValue) 
        ? rule.expectedValue 
        : [rule.expectedValue];
      
      if (!expected.includes(value)) {
        results.push({
          status: 'error',
          key: rule.key,
          value,
          message: `Expected: ${expected.join(' or ')} - ${rule.description}`
        });
        hasErrors = true;
        continue;
      }
    }
    
    // Check pattern
    if (rule.pattern && !rule.pattern.test(value)) {
      results.push({
        status: 'error',
        key: rule.key,
        value: value.substring(0, 20) + (value.length > 20 ? '...' : ''),
        message: `Invalid format - ${rule.description}`
      });
      hasErrors = true;
      continue;
    }
    
    // Success
    const displayValue = rule.key.includes('TOKEN') || rule.key.includes('SECRET')
      ? value.substring(0, 8) + '***'
      : value;
    results.push({
      status: 'ok',
      key: rule.key,
      value: displayValue
    });
  }
  
  // Print results
  console.log('Validation Results:\n');
  
  for (const result of results) {
    if (result.status === 'ok') {
      console.log(`  ✅ ${result.key}=${result.value}`);
    } else if (result.status === 'error') {
      console.error(`  ❌ ${result.key}${result.value ? `=${result.value}` : ''}`);
      console.error(`     ${result.message}`);
    } else if (result.status === 'skip') {
      console.log(`  ⏭️  ${result.key} - ${result.message}`);
    }
  }
  
  console.log('');
  
  // Summary
  if (hasErrors) {
    console.error('❌ Environment validation FAILED');
    console.error('   Fix the errors above before deploying\n');
    return false;
  }
  
  if (hasWarnings) {
    console.warn('⚠️  Environment validation passed with warnings\n');
    return true;
  }
  
  console.log('✅ Environment validation PASSED');
  console.log('   Configuration is ready for deployment\n');
  return true;
}

// CLI handling
const args = process.argv.slice(2);
let envFile = '.env';
let isProduction = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--production' || args[i] === '-p') {
    isProduction = true;
  } else if (!args[i].startsWith('-')) {
    envFile = args[i];
  }
}

// Auto-detect production from filename
if (envFile.includes('production') || envFile.includes('prod')) {
  isProduction = true;
}

const isValid = validateEnvironment(envFile, isProduction);
process.exit(isValid ? 0 : 1);
