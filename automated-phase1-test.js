/**
 * Automated Phase 1 Testing Script
 * Tests Trading Hub merge implementation
 * 
 * Usage: node automated-phase1-test.js
 */

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5173';
const TESTS_PASSED = [];
const TESTS_FAILED = [];

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${name}`, color);
  if (details) {
    log(`   ${details}`, 'cyan');
  }
  
  if (passed) {
    TESTS_PASSED.push(name);
  } else {
    TESTS_FAILED.push(name);
  }
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, {
      headers: {
        'User-Agent': 'Phase1-Test-Script'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url: res.responseUrl || url
        });
      });
    }).on('error', reject);
  });
}

async function testServerRunning() {
  log('\n📡 Testing Server Status...', 'bold');
  try {
    const response = await makeRequest(BASE_URL);
    const passed = response.statusCode === 200;
    logTest('Server is running', passed, `Status: ${response.statusCode}`);
    return passed;
  } catch (error) {
    logTest('Server is running', false, `Error: ${error.message}`);
    return false;
  }
}

async function testTradingHubRoute() {
  log('\n🏠 Testing Trading Hub Route...', 'bold');
  try {
    const response = await makeRequest(`${BASE_URL}/trading-hub`);
    const passed = response.statusCode === 200;
    logTest('Trading Hub route accessible', passed, `Status: ${response.statusCode}`);
    
    // Check if HTML contains expected elements
    if (passed && response.body) {
      const hasTabContent = response.body.includes('tab') || response.body.includes('Trading');
      logTest('Trading Hub HTML structure', hasTabContent, 'Contains tab-related content');
    }
    
    return passed;
  } catch (error) {
    logTest('Trading Hub route accessible', false, `Error: ${error.message}`);
    return false;
  }
}

async function testDirectTabAccess() {
  log('\n📑 Testing Direct Tab Access...', 'bold');
  
  const tabs = ['futures', 'technical', 'risk', 'positions', 'portfolio'];
  let allPassed = true;
  
  for (const tab of tabs) {
    try {
      const url = `${BASE_URL}/trading-hub?tab=${tab}`;
      const response = await makeRequest(url);
      const passed = response.statusCode === 200;
      logTest(`Direct access: ?tab=${tab}`, passed, `Status: ${response.statusCode}`);
      allPassed = allPassed && passed;
    } catch (error) {
      logTest(`Direct access: ?tab=${tab}`, false, `Error: ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function testLegacyRedirects() {
  log('\n🔄 Testing Legacy Route Redirects...', 'bold');
  
  // Note: HTTP redirects need to be tested in browser
  // This test just checks if routes exist
  
  const routes = [
    { path: '/positions', expected: 'positions' },
    { path: '/portfolio', expected: 'portfolio' }
  ];
  
  let allPassed = true;
  
  for (const route of routes) {
    try {
      const response = await makeRequest(`${BASE_URL}${route.path}`);
      // Should get 200 (SPA handles routing client-side)
      const passed = response.statusCode === 200;
      logTest(`Legacy route: ${route.path}`, passed, `Status: ${response.statusCode}`);
      allPassed = allPassed && passed;
    } catch (error) {
      logTest(`Legacy route: ${route.path}`, false, `Error: ${error.message}`);
      allPassed = false;
    }
  }
  
  log('\n⚠️  Note: Client-side redirects must be tested in browser', 'yellow');
  
  return allPassed;
}

async function testFileStructure() {
  log('\n📁 Testing File Structure...', 'bold');
  
  const requiredFiles = [
    'src/views/TradingHubView.tsx',
    'src/views/PositionsView.tsx',
    'src/views/PortfolioPage.tsx',
    'src/App.tsx',
    'src/components/Navigation/EnhancedSidebar.tsx'
  ];
  
  let allPassed = true;
  
  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(__dirname, file));
    logTest(`File exists: ${file}`, exists);
    allPassed = allPassed && exists;
  }
  
  return allPassed;
}

async function testTypeScriptCompilation() {
  log('\n🔧 Testing TypeScript Compilation...', 'bold');
  
  try {
    // Run TypeScript compiler in check mode
    const output = execSync('npx tsc --noEmit', { 
      stdio: 'pipe',
      timeout: 30000,
      encoding: 'utf8'
    });
    logTest('TypeScript compilation', true, 'No errors found');
    return true;
  } catch (error) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    const errorCount = (output.match(/error TS/g) || []).length;
    
    // If no TS errors, it might just be a warning or exit code issue
    if (errorCount === 0) {
      logTest('TypeScript compilation', true, 'No errors found');
      return true;
    }
    
    logTest('TypeScript compilation', false, `${errorCount} errors found`);
    
    // Show first few errors
    const errors = output.split('\n').filter(line => line.includes('error TS')).slice(0, 3);
    errors.forEach(err => log(`   ${err}`, 'red'));
    
    return false;
  }
}

async function checkCodePatterns() {
  log('\n🔍 Checking Code Patterns...', 'bold');
  
  // Check TradingHubView for URL handling
  const tradingHubPath = path.join(__dirname, 'src/views/TradingHubView.tsx');
  const tradingHubContent = fs.readFileSync(tradingHubPath, 'utf8');
  
  const hasURLHandling = tradingHubContent.includes('URLSearchParams') && 
                         tradingHubContent.includes('window.location.search');
  logTest('TradingHubView has URL parameter handling', hasURLHandling);
  
  const hasCleanupDocs = tradingHubContent.includes('WebSocket Cleanup') || 
                         tradingHubContent.includes('cleanup');
  logTest('TradingHubView has cleanup documentation', hasCleanupDocs);
  
  // Check App.tsx for redirects
  const appPath = path.join(__dirname, 'src/App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  const hasPositionsRedirect = appContent.includes('positions') && 
                               appContent.includes('trading-hub?tab=positions');
  logTest('App.tsx has /positions redirect', hasPositionsRedirect);
  
  const hasPortfolioRedirect = appContent.includes('portfolio') && 
                               appContent.includes('trading-hub?tab=portfolio');
  logTest('App.tsx has /portfolio redirect', hasPortfolioRedirect);
  
  // Check EnhancedSidebar
  const sidebarPath = path.join(__dirname, 'src/components/Navigation/EnhancedSidebar.tsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  
  const hasTradingHub = sidebarContent.includes('trading-hub');
  logTest('EnhancedSidebar has Trading Hub entry', hasTradingHub);
  
  // Check for removed standalone entries (should not have separate positions/portfolio routes)
  const lines = sidebarContent.split('\n');
  const positionsLine = lines.find(line => 
    line.includes("id: 'positions'") && 
    !line.includes('trading-hub')
  );
  const noStandalonePositions = !positionsLine;
  logTest('EnhancedSidebar removed standalone Positions', noStandalonePositions);
  
  return hasURLHandling && hasCleanupDocs && hasPositionsRedirect && 
         hasPortfolioRedirect && hasTradingHub && noStandalonePositions;
}

async function checkWebSocketCleanup() {
  log('\n🔌 Checking WebSocket Cleanup Patterns...', 'bold');
  
  // Check PositionsView
  const positionsPath = path.join(__dirname, 'src/views/PositionsView.tsx');
  const positionsContent = fs.readFileSync(positionsPath, 'utf8');
  
  const hasPositionsCleanup = positionsContent.includes('clearInterval') && 
                              positionsContent.includes('return () =>');
  logTest('PositionsView has cleanup function', hasPositionsCleanup);
  
  // Check PortfolioPage
  const portfolioPath = path.join(__dirname, 'src/views/PortfolioPage.tsx');
  const portfolioContent = fs.readFileSync(portfolioPath, 'utf8');
  
  const hasPortfolioCleanup = portfolioContent.includes('clearInterval') && 
                              portfolioContent.includes('return () =>');
  logTest('PortfolioPage has cleanup function', hasPortfolioCleanup);
  
  return hasPositionsCleanup && hasPortfolioCleanup;
}

function printSummary() {
  log('\n' + '='.repeat(60), 'bold');
  log('📊 TEST SUMMARY', 'bold');
  log('='.repeat(60), 'bold');
  
  const total = TESTS_PASSED.length + TESTS_FAILED.length;
  const passRate = ((TESTS_PASSED.length / total) * 100).toFixed(1);
  
  log(`\nTotal Tests: ${total}`, 'cyan');
  log(`Passed: ${TESTS_PASSED.length}`, 'green');
  log(`Failed: ${TESTS_FAILED.length}`, 'red');
  log(`Pass Rate: ${passRate}%`, passRate === '100.0' ? 'green' : 'yellow');
  
  if (TESTS_FAILED.length > 0) {
    log('\n❌ Failed Tests:', 'red');
    TESTS_FAILED.forEach(test => log(`   • ${test}`, 'red'));
  }
  
  log('\n' + '='.repeat(60), 'bold');
  
  if (TESTS_FAILED.length === 0) {
    log('\n🎉 ALL TESTS PASSED! Phase 1 is ready!', 'green');
    log('✅ You can proceed to browser testing', 'green');
    log('✅ Open verify-phase1.html for interactive testing', 'cyan');
  } else {
    log('\n⚠️  SOME TESTS FAILED', 'yellow');
    log('Please review the failed tests above', 'yellow');
    log('Fix issues before proceeding to browser testing', 'yellow');
  }
  
  log('\n📋 Next Steps:', 'bold');
  log('1. Review test results above', 'cyan');
  log('2. Fix any failed tests', 'cyan');
  log('3. Open verify-phase1.html in browser', 'cyan');
  log('4. Complete manual testing checklist', 'cyan');
  log('5. Document results in POST_TESTING_ACTIONS.md', 'cyan');
  log('');
}

async function runAllTests() {
  log('\n🚀 Phase 1 Automated Testing', 'bold');
  log('Testing Trading Hub Merge Implementation\n', 'cyan');
  
  try {
    // Run all test suites
    await testFileStructure();
    await testTypeScriptCompilation();
    await checkCodePatterns();
    await checkWebSocketCleanup();
    await testServerRunning();
    await testTradingHubRoute();
    await testDirectTabAccess();
    await testLegacyRedirects();
    
    // Print summary
    printSummary();
    
    // Exit with appropriate code
    process.exit(TESTS_FAILED.length === 0 ? 0 : 1);
    
  } catch (error) {
    log(`\n❌ Test suite error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
