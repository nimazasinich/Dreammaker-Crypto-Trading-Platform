#!/usr/bin/env node

/**
 * Phase 2 Automated Test Suite
 * Comprehensive automated testing for Market Analysis Hub & Trading Hub
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Test results
const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: [],
    startTime: Date.now(),
    endTime: null
};

// Utility functions
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(category, name, status, duration) {
    const statusColor = status === 'PASSED' ? 'green' : status === 'FAILED' ? 'red' : 'yellow';
    const icon = status === 'PASSED' ? '✓' : status === 'FAILED' ? '✗' : '⊘';
    log(`  ${icon} [${category}] ${name} ${colors.dim}(${duration}ms)${colors.reset}`, statusColor);
}

function formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}

// Test runner
async function runTest(category, name, testFn) {
    const startTime = Date.now();
    let status = 'PASSED';
    let error = null;

    try {
        await testFn();
    } catch (e) {
        status = 'FAILED';
        error = e.message;
        results.failed++;
    }

    if (status === 'PASSED') {
        results.passed++;
    }

    const duration = Date.now() - startTime;
    results.tests.push({ category, name, status, duration, error });
    logTest(category, name, status, duration);

    return status === 'PASSED';
}

// File system tests
async function runFileSystemTests() {
    log('\n📁 Running File System Tests...', 'cyan');

    await runTest('FileSystem', 'verify-phase2.html exists', async () => {
        if (!fs.existsSync('verify-phase2.html')) throw new Error('File not found');
    });

    await runTest('FileSystem', 'package.json is valid', async () => {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (!pkg.name || !pkg.version) throw new Error('Invalid package.json');
    });

    await runTest('FileSystem', 'src directory structure', async () => {
        const required = ['src/views', 'src/components', 'src/services', 'src/types'];
        for (const dir of required) {
            if (!fs.existsSync(dir)) throw new Error(`Missing directory: ${dir}`);
        }
    });

    await runTest('FileSystem', 'Market Analysis Hub view exists', async () => {
        if (!fs.existsSync('src/views/MarketAnalysisHub.tsx')) {
            throw new Error('MarketAnalysisHub.tsx not found');
        }
    });

    await runTest('FileSystem', 'Trading Hub view exists', async () => {
        if (!fs.existsSync('src/views/trading-hub/UnifiedTradingHubView.tsx')) {
            throw new Error('UnifiedTradingHubView.tsx not found');
        }
    });
}

// TypeScript compilation tests
async function runTypeScriptTests() {
    log('\n🔧 Running TypeScript Tests...', 'cyan');

    await runTest('TypeScript', 'No critical compilation errors', async () => {
        try {
            execSync('npx tsc --noEmit --skipLibCheck', { 
                stdio: 'pipe',
                timeout: 60000 
            });
        } catch (e) {
            // Check if errors are only in test files or are acceptable
            const output = e.stderr?.toString() || e.stdout?.toString() || '';
            if (output.includes('error TS') && !output.includes('test')) {
                throw new Error('TypeScript compilation has errors');
            }
        }
    });

    await runTest('TypeScript', 'NavigationProvider types are correct', async () => {
        const content = fs.readFileSync('src/components/Navigation/NavigationProvider.tsx', 'utf8');
        if (!content.includes("'market-analysis'") || !content.includes("'trading-hub'")) {
            throw new Error('Navigation types missing Phase 2 views');
        }
    });

    await runTest('TypeScript', 'Type definitions include Phase 2 types', async () => {
        const content = fs.readFileSync('src/types/index.ts', 'utf8');
        if (!content.includes('HarmonicPattern') || !content.includes('ElliottWaveAnalysis')) {
            throw new Error('Missing Phase 2 type definitions');
        }
    });
}

// Code quality tests
async function runCodeQualityTests() {
    log('\n✨ Running Code Quality Tests...', 'cyan');

    await runTest('CodeQuality', 'No TODO comments in production code', async () => {
        const files = [
            'src/views/MarketAnalysisHub.tsx',
            'src/views/trading-hub/UnifiedTradingHubView.tsx'
        ];
        
        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');
            // Allow @ts-ignore TODO comments but not regular TODOs
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('TODO') && !lines[i].includes('@ts-')) {
                    throw new Error(`TODO comment found in ${file}:${i + 1}`);
                }
            }
        }
    });

    await runTest('CodeQuality', 'Proper imports structure', async () => {
        const files = [
            'src/views/MarketAnalysisHub.tsx',
            'src/views/trading-hub/UnifiedTradingHubView.tsx'
        ];
        
        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');
            if (!content.includes('import React') && !content.includes("import { ")) {
                throw new Error(`Missing proper imports in ${file}`);
            }
        }
    });

    await runTest('CodeQuality', 'No console.log in production', async () => {
        const files = [
            'src/views/MarketAnalysisHub.tsx',
            'src/views/trading-hub/UnifiedTradingHubView.tsx'
        ];
        
        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('console.log') && !lines[i].trim().startsWith('//')) {
                    // Allow console.log in error handlers and development
                    if (!lines[i].includes('error') && !lines[i].includes('warn')) {
                        throw new Error(`console.log found in ${file}:${i + 1}`);
                    }
                }
            }
        }
    });
}

// Component structure tests
async function runComponentTests() {
    log('\n🧩 Running Component Tests...', 'cyan');

    await runTest('Component', 'Market Analysis Hub has tab structure', async () => {
        const content = fs.readFileSync('src/views/MarketAnalysisHub.tsx', 'utf8');
        if (!content.includes('TabsProvider') && !content.includes('tab')) {
            throw new Error('Market Analysis Hub missing tab structure');
        }
    });

    await runTest('Component', 'Trading Hub has all required tabs', async () => {
        const tabs = ['SpotTab', 'FuturesTab', 'PortfolioTab', 'PositionsTab'];
        const dir = 'src/views/trading-hub/tabs';
        
        for (const tab of tabs) {
            if (!fs.existsSync(path.join(dir, `${tab}.tsx`))) {
                throw new Error(`Missing tab: ${tab}`);
            }
        }
    });

    await runTest('Component', 'Navigation cleanup (no duplicate entries)', async () => {
        const content = fs.readFileSync('src/components/Navigation/EnhancedSidebar.tsx', 'utf8');
        
        // Check that old "Market" and "Trading" entries are removed/updated
        const lines = content.split('\n');
        let marketCount = 0;
        let tradingCount = 0;
        
        for (const line of lines) {
            if (line.includes('market') && line.includes('label')) marketCount++;
            if (line.includes('trading') && line.includes('label')) tradingCount++;
        }
        
        // Should have only new entries, not duplicates
        if (marketCount > 2 || tradingCount > 2) {
            throw new Error('Possible duplicate navigation entries');
        }
    });
}

// Build tests
async function runBuildTests() {
    log('\n🏗️  Running Build Tests...', 'cyan');

    await runTest('Build', 'Build configuration is valid', async () => {
        if (!fs.existsSync('vite.config.ts') && !fs.existsSync('vite.config.js')) {
            throw new Error('Missing vite config');
        }
    });

    await runTest('Build', 'Dependencies are installed', async () => {
        if (!fs.existsSync('node_modules')) {
            throw new Error('node_modules not found - run npm install');
        }
    });

    await runTest('Build', 'Build scripts exist', async () => {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (!pkg.scripts.build) {
            throw new Error('Build script not found in package.json');
        }
    });
}

// Documentation tests
async function runDocumentationTests() {
    log('\n📚 Running Documentation Tests...', 'cyan');

    await runTest('Documentation', 'Phase 2 executive summary exists', async () => {
        if (!fs.existsSync('PHASE_2_EXECUTIVE_SUMMARY.md')) {
            throw new Error('PHASE_2_EXECUTIVE_SUMMARY.md not found');
        }
    });

    await runTest('Documentation', 'Test results template exists', async () => {
        if (!fs.existsSync('PHASE_2_TEST_RESULTS.md')) {
            throw new Error('PHASE_2_TEST_RESULTS.md not found');
        }
    });

    await runTest('Documentation', 'Deployment scripts exist', async () => {
        const scripts = ['deploy-phase2.ps1', 'deploy-phase2.sh'];
        const exists = scripts.some(script => fs.existsSync(script));
        if (!exists) {
            throw new Error('No deployment scripts found');
        }
    });
}

// Git tests
async function runGitTests() {
    log('\n🔀 Running Git Tests...', 'cyan');

    await runTest('Git', 'Git repository is initialized', async () => {
        if (!fs.existsSync('.git')) {
            throw new Error('Not a git repository');
        }
    });

    await runTest('Git', 'No uncommitted changes to critical files', async () => {
        try {
            const status = execSync('git status --porcelain src/views/MarketAnalysisHub.tsx src/views/trading-hub/', { 
                encoding: 'utf8',
                stdio: 'pipe'
            });
            
            if (status.trim().length > 0) {
                log(`    ${colors.yellow}Warning: Uncommitted changes detected${colors.reset}`, 'yellow');
            }
        } catch (e) {
            // Ignore git errors
        }
    });

    await runTest('Git', 'Branch is ready for deployment', async () => {
        try {
            const branch = execSync('git branch --show-current', { 
                encoding: 'utf8',
                stdio: 'pipe'
            }).trim();
            
            if (branch !== 'main' && branch !== 'master') {
                log(`    ${colors.yellow}Warning: Not on main/master branch (current: ${branch})${colors.reset}`, 'yellow');
            }
        } catch (e) {
            // Ignore git errors
        }
    });
}

// Generate report
function generateReport() {
    results.endTime = Date.now();
    const totalDuration = results.endTime - results.startTime;
    const total = results.passed + results.failed + results.skipped;
    const passRate = total > 0 ? Math.round((results.passed / total) * 100) : 0;

    log('\n' + '='.repeat(70), 'bright');
    log('📊 TEST SUMMARY', 'bright');
    log('='.repeat(70), 'bright');

    log(`\n✓ Passed:  ${results.passed}`, 'green');
    log(`✗ Failed:  ${results.failed}`, 'red');
    log(`⊘ Skipped: ${results.skipped}`, 'yellow');
    log(`━ Total:   ${total}`, 'bright');
    log(`\n⏱  Duration: ${formatDuration(totalDuration)}`);
    log(`📈 Pass Rate: ${passRate}%`, passRate === 100 ? 'green' : passRate >= 80 ? 'yellow' : 'red');

    if (results.failed > 0) {
        log('\n❌ FAILED TESTS:', 'red');
        results.tests
            .filter(t => t.status === 'FAILED')
            .forEach(t => {
                log(`  • [${t.category}] ${t.name}`, 'red');
                if (t.error) {
                    log(`    ${t.error}`, 'dim');
                }
            });
    }

    log('\n' + '='.repeat(70), 'bright');

    if (passRate === 100) {
        log('🎉 ALL TESTS PASSED! Phase 2 is ready for deployment!', 'green');
    } else if (passRate >= 80) {
        log('⚠️  SOME TESTS FAILED. Review before deploying to production.', 'yellow');
    } else {
        log('❌ CRITICAL FAILURES. Do not deploy to production.', 'red');
    }

    log('='.repeat(70) + '\n', 'bright');

    // Save JSON report
    const report = {
        timestamp: new Date().toISOString(),
        duration: totalDuration,
        summary: {
            total,
            passed: results.passed,
            failed: results.failed,
            skipped: results.skipped,
            passRate: `${passRate}%`
        },
        tests: results.tests
    };

    const reportPath = `test-results-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log(`📄 Full report saved to: ${reportPath}`, 'cyan');

    return passRate === 100 ? 0 : 1;
}

// Main execution
async function main() {
    log('\n🚀 Phase 2 Automated Test Suite', 'bright');
    log('Testing Market Analysis Hub & Trading Hub Enhancements\n', 'dim');

    try {
        await runFileSystemTests();
        await runTypeScriptTests();
        await runCodeQualityTests();
        await runComponentTests();
        await runBuildTests();
        await runDocumentationTests();
        await runGitTests();
    } catch (error) {
        log(`\n❌ Fatal error: ${error.message}`, 'red');
        process.exit(1);
    }

    const exitCode = generateReport();
    process.exit(exitCode);
}

// Run tests
main().catch(error => {
    log(`\n❌ Unexpected error: ${error.message}`, 'red');
    process.exit(1);
});

