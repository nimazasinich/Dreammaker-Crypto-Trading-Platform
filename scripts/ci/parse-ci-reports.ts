#!/usr/bin/env tsx
/**
 * CI Reports Parser
 * 
 * Aggregates and analyzes all CI reports from artifacts.
 * Usage: tsx scripts/ci/parse-ci-reports.ts [artifacts-dir]
 */

import fs from 'fs';
import path from 'path';

interface AggregatedReport {
  timestamp: string;
  pipeline: {
    total_jobs: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  quality: {
    lint_errors: number;
    type_errors: number;
    complexity_warnings: number;
  };
  tests: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    coverage_percentage?: number;
  };
  builds: {
    client: {
      status: string;
      duration_seconds?: number;
      size_mb?: number;
    };
    server: {
      status: string;
      duration_seconds?: number;
    };
  };
  docker: {
    backend: {
      status: string;
      size_mb?: number;
    };
    frontend: {
      status: string;
      size_mb?: number;
    };
  };
  security: {
    vulnerabilities: {
      critical: number;
      high: number;
      moderate: number;
      low: number;
    };
    secrets_found: number;
  };
  performance: {
    total_build_time_seconds?: number;
    bundle_size_mb?: number;
  };
}

class CIReportsParser {
  private artifactsDir: string;
  private report: AggregatedReport;

  constructor(artifactsDir: string = 'all-reports') {
    this.artifactsDir = artifactsDir;
    this.report = this.initializeReport();
  }

  private initializeReport(): AggregatedReport {
    return {
      timestamp: new Date().toISOString(),
      pipeline: {
        total_jobs: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      },
      quality: {
        lint_errors: 0,
        type_errors: 0,
        complexity_warnings: 0
      },
      tests: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      },
      builds: {
        client: {
          status: 'not_run'
        },
        server: {
          status: 'not_run'
        }
      },
      docker: {
        backend: {
          status: 'not_run'
        },
        frontend: {
          status: 'not_run'
        }
      },
      security: {
        vulnerabilities: {
          critical: 0,
          high: 0,
          moderate: 0,
          low: 0
        },
        secrets_found: 0
      },
      performance: {}
    };
  }

  async parse(): Promise<AggregatedReport> {
    console.log('📊 Parsing CI Reports...\n');

    if (!fs.existsSync(this.artifactsDir)) {
      console.error(`❌ Artifacts directory not found: ${this.artifactsDir}`);
      console.log('💡 Run this script after downloading CI artifacts.');
      return this.report;
    }

    this.parseQualityReports();
    this.parseTestReports();
    this.parseBuildReports();
    this.parseDockerReports();
    this.parseSecurityReports();
    this.parsePerformanceReports();

    return this.report;
  }

  private parseQualityReports(): void {
    console.log('📝 Parsing quality reports...');
    
    const qualityDir = path.join(this.artifactsDir, 'quality-reports');
    
    if (!fs.existsSync(qualityDir)) {
      console.log('  ⚠️  Quality reports not found');
      return;
    }

    // Parse ESLint report
    const eslintPath = path.join(qualityDir, 'eslint-report.json');
    if (fs.existsSync(eslintPath)) {
      try {
        const eslintReport = JSON.parse(fs.readFileSync(eslintPath, 'utf8'));
        
        if (Array.isArray(eslintReport)) {
          this.report.quality.lint_errors = eslintReport.reduce(
            (sum, file) => sum + (file.errorCount || 0),
            0
          );
          console.log(`  ✓ ESLint: ${this.report.quality.lint_errors} errors found`);
        }
      } catch (error) {
        console.log(`  ⚠️  Error parsing ESLint report: ${error}`);
      }
    }

    // Parse TypeScript report
    const typecheckPath = path.join(qualityDir, 'typecheck-report.json');
    if (fs.existsSync(typecheckPath)) {
      try {
        const typecheckReport = JSON.parse(fs.readFileSync(typecheckPath, 'utf8'));
        
        if (typecheckReport.status === 'failed') {
          this.report.quality.type_errors = 1; // Simplified
        }
        console.log(`  ✓ TypeScript: ${typecheckReport.status}`);
      } catch (error) {
        console.log(`  ⚠️  Error parsing TypeScript report: ${error}`);
      }
    }

    // Parse complexity report
    const complexityPath = path.join(qualityDir, 'complexity-report.json');
    if (fs.existsSync(complexityPath)) {
      try {
        const complexityReport = JSON.parse(fs.readFileSync(complexityPath, 'utf8'));
        
        this.report.quality.complexity_warnings = 
          complexityReport.warnings?.large_files_count || 0;
        console.log(`  ✓ Complexity: ${this.report.quality.complexity_warnings} large files`);
      } catch (error) {
        console.log(`  ⚠️  Error parsing complexity report: ${error}`);
      }
    }
    
    console.log('');
  }

  private parseTestReports(): void {
    console.log('🧪 Parsing test reports...');
    
    const testDir = path.join(this.artifactsDir, 'unit-test-results');
    
    if (!fs.existsSync(testDir)) {
      console.log('  ⚠️  Test reports not found');
      return;
    }

    const summaryPath = path.join(testDir, 'summary.json');
    if (fs.existsSync(summaryPath)) {
      try {
        const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
        console.log(`  ✓ Test summary: ${summary.status}`);
      } catch (error) {
        console.log(`  ⚠️  Error parsing test summary: ${error}`);
      }
    }

    // Parse Vitest results
    const vitestPath = path.join(testDir, 'vitest-results.json');
    if (fs.existsSync(vitestPath)) {
      try {
        const vitestReport = JSON.parse(fs.readFileSync(vitestPath, 'utf8'));
        
        if (vitestReport.testResults) {
          vitestReport.testResults.forEach((test: any) => {
            this.report.tests.total++;
            
            if (test.status === 'passed') {
              this.report.tests.passed++;
            } else if (test.status === 'failed') {
              this.report.tests.failed++;
            } else if (test.status === 'skipped') {
              this.report.tests.skipped++;
            }
          });
          
          console.log(`  ✓ Tests: ${this.report.tests.passed}/${this.report.tests.total} passed`);
        }
      } catch (error) {
        console.log(`  ⚠️  Error parsing Vitest report: ${error}`);
      }
    }

    // Parse coverage
    const coveragePath = path.join(testDir, 'coverage', 'coverage-summary.json');
    if (fs.existsSync(coveragePath)) {
      try {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
        
        if (coverage.total) {
          this.report.tests.coverage_percentage = coverage.total.lines?.pct || 0;
          console.log(`  ✓ Coverage: ${this.report.tests.coverage_percentage}%`);
        }
      } catch (error) {
        console.log(`  ⚠️  Error parsing coverage: ${error}`);
      }
    }
    
    console.log('');
  }

  private parseBuildReports(): void {
    console.log('🏗️  Parsing build reports...');
    
    const buildDir = path.join(this.artifactsDir, 'build-reports-client');
    const serverBuildDir = path.join(this.artifactsDir, 'build-reports-server');
    
    // Client build
    if (fs.existsSync(buildDir)) {
      const reportPath = path.join(buildDir, 'client-report.json');
      if (fs.existsSync(reportPath)) {
        try {
          const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
          
          this.report.builds.client.status = report.status;
          this.report.builds.client.duration_seconds = report.duration_seconds;
          
          if (report.build_size) {
            // Parse size string like "15.2M" to MB
            const match = report.build_size.match(/(\d+\.?\d*)([KMG])/);
            if (match) {
              const value = parseFloat(match[1]);
              const unit = match[2];
              
              this.report.builds.client.size_mb = 
                unit === 'M' ? value :
                unit === 'G' ? value * 1024 :
                value / 1024;
            }
          }
          
          console.log(`  ✓ Client build: ${report.status} (${report.duration_seconds}s, ${report.build_size})`);
        } catch (error) {
          console.log(`  ⚠️  Error parsing client build report: ${error}`);
        }
      }
    }
    
    // Server build
    if (fs.existsSync(serverBuildDir)) {
      const reportPath = path.join(serverBuildDir, 'server-report.json');
      if (fs.existsSync(reportPath)) {
        try {
          const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
          
          this.report.builds.server.status = report.status;
          this.report.builds.server.duration_seconds = report.duration_seconds;
          
          console.log(`  ✓ Server build: ${report.status} (${report.duration_seconds}s)`);
        } catch (error) {
          console.log(`  ⚠️  Error parsing server build report: ${error}`);
        }
      }
    }
    
    console.log('');
  }

  private parseDockerReports(): void {
    console.log('🐳 Parsing Docker reports...');
    
    const backendDir = path.join(this.artifactsDir, 'docker-reports-backend');
    const frontendDir = path.join(this.artifactsDir, 'docker-reports-frontend');
    
    // Backend image
    if (fs.existsSync(backendDir)) {
      const reportPath = path.join(backendDir, 'backend-report.json');
      if (fs.existsSync(reportPath)) {
        try {
          const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
          
          this.report.docker.backend.status = 'success';
          this.report.docker.backend.size_mb = report.size_mb;
          
          console.log(`  ✓ Backend image: ${report.size_mb}MB`);
        } catch (error) {
          console.log(`  ⚠️  Error parsing backend Docker report: ${error}`);
        }
      }
    }
    
    // Frontend image
    if (fs.existsSync(frontendDir)) {
      const reportPath = path.join(frontendDir, 'frontend-report.json');
      if (fs.existsSync(reportPath)) {
        try {
          const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
          
          this.report.docker.frontend.status = 'success';
          this.report.docker.frontend.size_mb = report.size_mb;
          
          console.log(`  ✓ Frontend image: ${report.size_mb}MB`);
        } catch (error) {
          console.log(`  ⚠️  Error parsing frontend Docker report: ${error}`);
        }
      }
    }
    
    console.log('');
  }

  private parseSecurityReports(): void {
    console.log('🔒 Parsing security reports...');
    
    const securityDir = path.join(this.artifactsDir, 'security-reports');
    
    if (!fs.existsSync(securityDir)) {
      console.log('  ⚠️  Security reports not found');
      return;
    }

    // Parse npm audit
    const auditPath = path.join(securityDir, 'npm-audit.json');
    if (fs.existsSync(auditPath)) {
      try {
        const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
        
        if (audit.metadata?.vulnerabilities) {
          const vulns = audit.metadata.vulnerabilities;
          
          this.report.security.vulnerabilities.critical = vulns.critical || 0;
          this.report.security.vulnerabilities.high = vulns.high || 0;
          this.report.security.vulnerabilities.moderate = vulns.moderate || 0;
          this.report.security.vulnerabilities.low = vulns.low || 0;
          
          const total = Object.values(this.report.security.vulnerabilities).reduce(
            (sum: number, val) => sum + val,
            0
          );
          
          console.log(`  ✓ NPM Audit: ${total} vulnerabilities found`);
        }
      } catch (error) {
        console.log(`  ⚠️  Error parsing npm audit: ${error}`);
      }
    }

    // Parse secrets scan
    const secretsPath = path.join(securityDir, 'secrets-scan.json');
    if (fs.existsSync(secretsPath)) {
      try {
        const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
        
        this.report.security.secrets_found = secrets.findings_count || 0;
        console.log(`  ✓ Secrets scan: ${secrets.status}`);
      } catch (error) {
        console.log(`  ⚠️  Error parsing secrets scan: ${error}`);
      }
    }
    
    console.log('');
  }

  private parsePerformanceReports(): void {
    console.log('⚡ Parsing performance reports...');
    
    const perfDir = path.join(this.artifactsDir, 'performance-reports');
    
    if (!fs.existsSync(perfDir)) {
      console.log('  ⚠️  Performance reports not found');
      return;
    }

    const benchmarksPath = path.join(perfDir, 'benchmarks.json');
    if (fs.existsSync(benchmarksPath)) {
      try {
        const benchmarks = JSON.parse(fs.readFileSync(benchmarksPath, 'utf8'));
        
        if (benchmarks.build_times) {
          this.report.performance.total_build_time_seconds = 
            benchmarks.build_times.total_seconds;
          console.log(`  ✓ Total build time: ${benchmarks.build_times.total_seconds}s`);
        }
        
        if (benchmarks.bundle_sizes) {
          this.report.performance.bundle_size_mb = benchmarks.bundle_sizes.total_mb;
          console.log(`  ✓ Bundle size: ${benchmarks.bundle_sizes.total_mb}MB`);
        }
      } catch (error) {
        console.log(`  ⚠️  Error parsing benchmarks: ${error}`);
      }
    }
    
    console.log('');
  }

  printSummary(): void {
    console.log('\n📊 Aggregated CI Report\n');
    console.log('='.repeat(60));
    
    console.log('\n🎯 PIPELINE SUMMARY:');
    console.log(`  Total Jobs: ${this.report.pipeline.total_jobs}`);
    console.log(`  Passed: ${this.report.pipeline.passed}`);
    console.log(`  Failed: ${this.report.pipeline.failed}`);
    console.log(`  Warnings: ${this.report.pipeline.warnings}`);
    
    console.log('\n📝 CODE QUALITY:');
    console.log(`  Lint Errors: ${this.report.quality.lint_errors}`);
    console.log(`  Type Errors: ${this.report.quality.type_errors}`);
    console.log(`  Complexity Warnings: ${this.report.quality.complexity_warnings}`);
    
    console.log('\n🧪 TESTS:');
    console.log(`  Total: ${this.report.tests.total}`);
    console.log(`  Passed: ${this.report.tests.passed}`);
    console.log(`  Failed: ${this.report.tests.failed}`);
    console.log(`  Skipped: ${this.report.tests.skipped}`);
    if (this.report.tests.coverage_percentage !== undefined) {
      console.log(`  Coverage: ${this.report.tests.coverage_percentage}%`);
    }
    
    console.log('\n🏗️  BUILDS:');
    console.log(`  Client: ${this.report.builds.client.status}`);
    if (this.report.builds.client.duration_seconds) {
      console.log(`    Duration: ${this.report.builds.client.duration_seconds}s`);
    }
    if (this.report.builds.client.size_mb) {
      console.log(`    Size: ${this.report.builds.client.size_mb.toFixed(2)}MB`);
    }
    console.log(`  Server: ${this.report.builds.server.status}`);
    if (this.report.builds.server.duration_seconds) {
      console.log(`    Duration: ${this.report.builds.server.duration_seconds}s`);
    }
    
    console.log('\n🐳 DOCKER:');
    console.log(`  Backend: ${this.report.docker.backend.status}`);
    if (this.report.docker.backend.size_mb) {
      console.log(`    Size: ${this.report.docker.backend.size_mb}MB`);
    }
    console.log(`  Frontend: ${this.report.docker.frontend.status}`);
    if (this.report.docker.frontend.size_mb) {
      console.log(`    Size: ${this.report.docker.frontend.size_mb}MB`);
    }
    
    console.log('\n🔒 SECURITY:');
    const totalVulns = 
      this.report.security.vulnerabilities.critical +
      this.report.security.vulnerabilities.high +
      this.report.security.vulnerabilities.moderate +
      this.report.security.vulnerabilities.low;
    console.log(`  Total Vulnerabilities: ${totalVulns}`);
    console.log(`    Critical: ${this.report.security.vulnerabilities.critical}`);
    console.log(`    High: ${this.report.security.vulnerabilities.high}`);
    console.log(`    Moderate: ${this.report.security.vulnerabilities.moderate}`);
    console.log(`    Low: ${this.report.security.vulnerabilities.low}`);
    console.log(`  Secrets Found: ${this.report.security.secrets_found}`);
    
    console.log('\n⚡ PERFORMANCE:');
    if (this.report.performance.total_build_time_seconds) {
      console.log(`  Total Build Time: ${this.report.performance.total_build_time_seconds}s`);
    }
    if (this.report.performance.bundle_size_mb) {
      console.log(`  Bundle Size: ${this.report.performance.bundle_size_mb}MB`);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }

  saveReport(): void {
    const outputDir = 'ci-reports/aggregated';
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const reportPath = path.join(outputDir, 'aggregated-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
    
    console.log(`📄 Aggregated report saved: ${reportPath}\n`);
  }
}

// Main execution
async function main() {
  const artifactsDir = process.argv[2] || 'all-reports';
  
  const parser = new CIReportsParser(artifactsDir);
  await parser.parse();
  parser.printSummary();
  parser.saveReport();
}

main();
