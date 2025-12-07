#!/usr/bin/env node
/**
 * Visual Improvement & Problem Analysis Script
 * 
 * This script analyzes the codebase to identify:
 * 1. Visual improvements needed
 * 2. Problems to solve
 * 3. Incomplete pages that need completion
 * 
 * Usage: node visual-improvement-analysis.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const report = {
    timestamp: new Date().toISOString(),
    visualImprovements: [],
    problems: [],
    incompletePages: [],
    typeSafetyIssues: [],
    summary: {}
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Analyze a file for issues
function analyzeFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(process.cwd(), filePath);
        const issues = [];

        // Check for TypeScript issues
        const tsIgnoreCount = (content.match(/@ts-ignore/g) || []).length;
        const anyTypeCount = (content.match(/:\s*any\b/g) || []).length;
        const unknownTypeCount = (content.match(/:\s*unknown\b/g) || []).length;

        if (tsIgnoreCount > 0 || anyTypeCount > 5) {
            issues.push({
                type: 'type-safety',
                severity: tsIgnoreCount > 0 ? 'high' : 'medium',
                message: `Type safety issues: ${tsIgnoreCount} @ts-ignore, ${anyTypeCount} any types`,
                file: relativePath
            });
        }

        // Check for TODO/FIXME comments
        const todoMatches = content.match(/TODO[^]*/gi) || [];
        const fixmeMatches = content.match(/FIXME[^]*/gi) || [];
        const incompleteMatches = content.match(/INCOMPLETE[^]*/gi) || [];
        const placeholderMatches = content.match(/PLACEHOLDER[^]*/gi) || [];

        if (todoMatches.length > 0 || fixmeMatches.length > 0 || incompleteMatches.length > 0) {
            issues.push({
                type: 'incomplete',
                severity: 'high',
                message: `Incomplete implementation: ${todoMatches.length} TODO, ${fixmeMatches.length} FIXME, ${incompleteMatches.length} INCOMPLETE`,
                file: relativePath,
                todos: [...todoMatches, ...fixmeMatches, ...incompleteMatches, ...placeholderMatches].slice(0, 5)
            });
        }

        // Check for visual issues
        const inlineStyleCount = (content.match(/style=\{[^}]*\}/g) || []).length;
        const hardcodedColors = (content.match(/#[0-9a-fA-F]{6}/g) || []).length;
        const missingResponsiveClasses = content.includes('className=') && !content.includes('sm:') && !content.includes('md:') && !content.includes('lg:');

        if (inlineStyleCount > 10 || hardcodedColors > 5) {
            issues.push({
                type: 'visual',
                severity: 'medium',
                message: `Visual consistency issues: ${inlineStyleCount} inline styles, ${hardcodedColors} hardcoded colors`,
                file: relativePath
            });
        }

        // Check for empty states without actions
        if (content.includes('No data available') && !content.includes('onClick') && !content.includes('button')) {
            issues.push({
                type: 'ux',
                severity: 'low',
                message: 'Empty state without action button',
                file: relativePath
            });
        }

        return issues;
    } catch (error) {
        return [];
    }
}

// Scan directory recursively
function scanDirectory(dir, fileList = []) {
    try {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);
            try {
                const stat = fs.statSync(filePath);

                if (stat.isDirectory()) {
                    // Skip node_modules, dist, build, etc.
                    if (!['node_modules', 'dist', 'build', '.git', 'archive', 'artifacts', 'reports', 'docs', 'cursor_reports', 'cursor_discovery'].includes(file)) {
                        scanDirectory(filePath, fileList);
                    }
                } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                    fileList.push(filePath);
                }
            } catch (err) {
                // Skip files that can't be accessed
            }
        });
    } catch (err) {
        // Skip directories that can't be accessed
    }

    return fileList;
}

// Main analysis
log('\n╔══════════════════════════════════════════════════════════╗', 'cyan');
log('║  Visual Improvement & Problem Analysis Script          ║', 'cyan');
log('╚══════════════════════════════════════════════════════════╝\n', 'cyan');

log('📁 Scanning codebase...', 'blue');

const cwd = process.cwd();
const srcDir = path.join(cwd, 'src');

let viewFiles = [];
let componentFiles = [];

if (fs.existsSync(srcDir)) {
    const viewsPath = path.join(srcDir, 'views');
    const componentsPath = path.join(srcDir, 'components');
    
    if (fs.existsSync(viewsPath)) {
        viewFiles = scanDirectory(viewsPath);
    }
    if (fs.existsSync(componentsPath)) {
        componentFiles = scanDirectory(componentsPath);
    }
}

log(`Found ${viewFiles.length} view files and ${componentFiles.length} component files\n`, 'green');

// Analyze all files
const allFiles = [...viewFiles, ...componentFiles];
let totalIssues = 0;

allFiles.forEach(file => {
    const issues = analyzeFile(file);
    issues.forEach(issue => {
        totalIssues++;
        
        switch (issue.type) {
            case 'type-safety':
                report.typeSafetyIssues.push(issue);
                break;
            case 'incomplete':
                report.incompletePages.push(issue);
                break;
            case 'visual':
                report.visualImprovements.push(issue);
                break;
            case 'ux':
                report.visualImprovements.push(issue);
                break;
            default:
                report.problems.push(issue);
        }
    });
});

// Generate summary
report.summary = {
    totalFilesAnalyzed: allFiles.length,
    totalIssuesFound: totalIssues,
    typeSafetyIssues: report.typeSafetyIssues.length,
    incompletePages: report.incompletePages.length,
    visualIssues: report.visualImprovements.length,
    problems: report.problems.length
};

// Print report
log('\n╔══════════════════════════════════════════════════════════╗', 'magenta');
log('║  ANALYSIS RESULTS                                         ║', 'magenta');
log('╚══════════════════════════════════════════════════════════╝\n', 'magenta');

log(`📊 Summary:`, 'yellow');
log(`   Total files analyzed: ${report.summary.totalFilesAnalyzed}`, 'reset');
log(`   Total issues found: ${report.summary.totalIssuesFound}`, 'reset');
log(`   Type safety issues: ${report.summary.typeSafetyIssues}`, report.summary.typeSafetyIssues > 0 ? 'red' : 'green');
log(`   Incomplete pages: ${report.summary.incompletePages}`, report.summary.incompletePages > 0 ? 'red' : 'green');
log(`   Visual issues: ${report.summary.visualIssues}`, report.summary.visualIssues > 0 ? 'yellow' : 'green');
log(`   Other problems: ${report.summary.problems}`, report.summary.problems > 0 ? 'yellow' : 'green');

// Detailed reports
if (report.typeSafetyIssues.length > 0) {
    log('\n🔴 TYPE SAFETY ISSUES:', 'red');
    report.typeSafetyIssues.slice(0, 10).forEach(issue => {
        log(`   • ${issue.file}: ${issue.message}`, 'red');
    });
    if (report.typeSafetyIssues.length > 10) {
        log(`   ... and ${report.typeSafetyIssues.length - 10} more`, 'yellow');
    }
}

if (report.incompletePages.length > 0) {
    log('\n⚠️  INCOMPLETE PAGES:', 'yellow');
    const uniqueFiles = [...new Set(report.incompletePages.map(i => i.file))];
    uniqueFiles.slice(0, 15).forEach(file => {
        const issues = report.incompletePages.filter(i => i.file === file);
        log(`   • ${file}`, 'yellow');
        if (issues[0].todos) {
            issues[0].todos.slice(0, 2).forEach(todo => {
                log(`     - ${todo.substring(0, 80)}...`, 'reset');
            });
        }
    });
    if (uniqueFiles.length > 15) {
        log(`   ... and ${uniqueFiles.length - 15} more files`, 'yellow');
    }
}

if (report.visualImprovements.length > 0) {
    log('\n🎨 VISUAL IMPROVEMENTS NEEDED:', 'cyan');
    const uniqueFiles = [...new Set(report.visualImprovements.map(i => i.file))];
    uniqueFiles.slice(0, 10).forEach(file => {
        const issues = report.visualImprovements.filter(i => i.file === file);
        log(`   • ${file}: ${issues[0].message}`, 'cyan');
    });
    if (uniqueFiles.length > 10) {
        log(`   ... and ${uniqueFiles.length - 10} more files`, 'yellow');
    }
}

// Known issues from codebase analysis
log('\n📋 KNOWN ISSUES FROM CODEBASE:', 'blue');

const knownIssues = [
    {
        category: 'Type Safety',
        issues: [
            'PositionsTab.tsx: @ts-ignore for Modal component type',
            'PortfolioTab.tsx: Multiple @ts-ignore for Modal and connector types',
            'Multiple views use `any` type instead of proper TypeScript types',
            'FuturesTab.tsx: Uses `any[]` for positions, orders, balance, orderbook',
            'MarketView.tsx: Analysis data uses `any` type'
        ]
    },
    {
        category: 'Incomplete Pages',
        issues: [
            'Positions API returns empty array (placeholder) - needs real implementation',
            'Backtesting returns mock data - needs real backtest engine',
            'AI model uses placeholder logic - needs real ML integration',
            'No persistent storage - settings are in-memory only',
            'No authentication/authorization system',
            'Disk usage monitoring not implemented (HealthView)',
            'Tab state not persisted (resets on refresh)'
        ]
    },
    {
        category: 'Visual Improvements',
        issues: [
            'Inconsistent border radius (rounded-xl vs rounded-2xl)',
            'Inconsistent card padding (p-4 vs p-6)',
            'Mixed loading states (custom skeletons vs LoadingSpinner)',
            'Empty states without action buttons',
            'Some buttons have shadows, others do not',
            'Text color variables inconsistent (text-slate-400 vs CSS variables)',
            'Responsive design needs testing on mobile/tablet',
            'Accessibility (WCAG) compliance not fully verified'
        ]
    },
    {
        category: 'Functional Problems',
        issues: [
            'Trading buttons throw JavaScript errors (needs error boundaries)',
            'API integration failures with rate limiting',
            'Data loading problems in some views',
            'Some interactive elements broken',
            'Weight validation missing (can save invalid configurations)',
            'No error shown if weight total ≠ 100%'
        ]
    }
];

knownIssues.forEach(category => {
    log(`\n   ${category.category}:`, 'yellow');
    category.issues.forEach(issue => {
        log(`   • ${issue}`, 'reset');
    });
});

// Priority recommendations
log('\n🎯 PRIORITY RECOMMENDATIONS:', 'green');
log('   1. Fix TypeScript type safety issues (remove @ts-ignore, replace any types)', 'green');
log('   2. Implement persistent storage for settings and tab state', 'green');
log('   3. Add error boundaries to prevent crashes from trading buttons', 'green');
log('   4. Standardize visual components (loading states, empty states, buttons)', 'green');
log('   5. Complete incomplete features (Positions API, Backtesting, AI model)', 'green');
log('   6. Add validation for user inputs (weight totals, form fields)', 'green');
log('   7. Improve responsive design and mobile experience', 'green');
log('   8. Add accessibility features (ARIA labels, keyboard navigation)', 'green');

// Save report to file
const reportPath = path.join(process.cwd(), 'visual-improvement-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
log(`\n✅ Report saved to: ${reportPath}`, 'green');

log('\n╔══════════════════════════════════════════════════════════╗', 'cyan');
log('║  Analysis Complete!                                      ║', 'cyan');
log('╚══════════════════════════════════════════════════════════╝\n', 'cyan');

