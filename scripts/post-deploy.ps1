###############################################################################
# Post-Deployment Health Check Script (PowerShell)
#
# این اسکریپت بعد از هر deployment اجرا می‌شود تا سلامت سیستم را تایید کند.
#
# استفاده:
#   powershell -ExecutionPolicy Bypass -File scripts\post-deploy.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\post-deploy.ps1 -Environment production
#   powershell -ExecutionPolicy Bypass -File scripts\post-deploy.ps1 -Environment staging -Verbose
#
# پارامترها:
#   -Environment: محیط اجرا (development, staging, production)
#   -Verbose: نمایش خروجی کامل
#   -SkipArchive: آرشیو نکردن گزارش‌ها
#
# نویسنده: Dreammaker Team
# تاریخ: 2025-12-03
###############################################################################

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('development', 'staging', 'production')]
    [string]$Environment = 'development',

    [Parameter(Mandatory=$false)]
    [switch]$Verbose,

    [Parameter(Mandatory=$false)]
    [switch]$SkipArchive
)

# تنظیمات
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# رنگ‌ها
$ColorReset = "`e[0m"
$ColorRed = "`e[31m"
$ColorGreen = "`e[32m"
$ColorYellow = "`e[33m"
$ColorBlue = "`e[34m"
$ColorCyan = "`e[36m"

# توابع کمکی
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Write-Host "${ColorCyan}[$timestamp]${ColorReset} $Message"
}

function Write-Success {
    param([string]$Message)
    Write-Host "${ColorGreen}✅ $Message${ColorReset}"
}

function Write-Error-Message {
    param([string]$Message)
    Write-Host "${ColorRed}❌ $Message${ColorReset}"
}

function Write-Warning-Message {
    param([string]$Message)
    Write-Host "${ColorYellow}⚠️  $Message${ColorReset}"
}

function Write-Info {
    param([string]$Message)
    Write-Host "${ColorBlue}ℹ️  $Message${ColorReset}"
}

###############################################################################
# Main Script
###############################################################################

Write-Log "🚀 Post-Deployment Health Check Starting..."
Write-Log "Environment: $Environment"
Write-Log "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

# متغیرها
$ReportDir = ".\reports"
$ArchiveDir = "$ReportDir\archive"
$Timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'

# بررسی Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js version: $nodeVersion"
} catch {
    Write-Error-Message "Node.js not found. Please install Node.js >= 18.0.0"
    exit 1
}

# بررسی npm
try {
    $npmVersion = npm --version
    Write-Success "npm version: $npmVersion"
} catch {
    Write-Error-Message "npm not found. Please install npm >= 9.0.0"
    exit 1
}

Write-Host ""

# ایجاد دایرکتوری گزارش‌ها
if (-not (Test-Path $ReportDir)) {
    New-Item -ItemType Directory -Path $ReportDir -Force | Out-Null
}

if (-not (Test-Path $ArchiveDir)) {
    New-Item -ItemType Directory -Path $ArchiveDir -Force | Out-Null
}

# اجرای health check
Write-Log "🏥 Running health checks..."
Write-Host ""

$healthCheckCmd = "npm run health:check -- --env $Environment --parallel --fail-on-error"

if ($Verbose) {
    $healthCheckCmd += " --format console"
}

# اجرا و ذخیره exit code
$healthCheckExitCode = 0
try {
    Invoke-Expression $healthCheckCmd
} catch {
    $healthCheckExitCode = 1
}

Write-Host ""

# تولید گزارش JSON
Write-Log "📊 Generating JSON report..."
$jsonReportPath = "$ReportDir\health-check-$Environment.json"

try {
    npm run health:check -- `
        --env $Environment `
        --parallel `
        --format json `
        --output $jsonReportPath

    Write-Success "Report saved to $jsonReportPath"

    # آرشیو گزارش
    if (-not $SkipArchive) {
        $archivePath = "$ArchiveDir\health-$Environment-$Timestamp.json"
        Copy-Item -Path $jsonReportPath -Destination $archivePath
        Write-Info "Archived to $archivePath"
    }
} catch {
    Write-Warning-Message "Failed to generate JSON report: $_"
}

Write-Host ""

# تولید گزارش Markdown (برای production و staging)
if ($Environment -eq 'production' -or $Environment -eq 'staging') {
    Write-Log "📝 Generating Markdown report..."
    $mdReportPath = "$ReportDir\health-check-$Environment.md"

    try {
        npm run health:check -- `
            --env $Environment `
            --parallel `
            --format markdown `
            --output $mdReportPath

        Write-Success "Markdown report saved to $mdReportPath"
    } catch {
        Write-Warning-Message "Failed to generate Markdown report: $_"
    }

    Write-Host ""
}

# خلاصه نتایج
Write-Log "📋 Summary:"
Write-Host ""

if (Test-Path $jsonReportPath) {
    try {
        $report = Get-Content $jsonReportPath | ConvertFrom-Json

        Write-Host "  Total Tests:  $($report.total)"
        Write-Host "  Passed:       $($report.passed)"
        Write-Host "  Failed:       $($report.failed)"
        Write-Host "  Pass Rate:    $($report.passRate)%"
        Write-Host "  Duration:     $($report.duration)ms"
        Write-Host ""

        # نتیجه نهایی
        if ($healthCheckExitCode -eq 0 -and $report.failed -eq 0) {
            Write-Success "All health checks passed!"
            Write-Success "Deployment to $Environment verified successfully"
            Write-Host ""

            Write-Info "Next steps:"
            Write-Info "1. Review the report: type $ReportDir\health-check-$Environment.md"
            Write-Info "2. Monitor the application for the next 15 minutes"
            Write-Info "3. Check error logs"
            Write-Host ""

            exit 0
        } else {
            Write-Error-Message "Health checks failed!"
            Write-Error-Message "Deployment to $Environment has issues"
            Write-Host ""

            Write-Warning-Message "Recommended actions:"
            Write-Warning-Message "1. Review failed tests in report"
            Write-Warning-Message "2. Check application logs"
            Write-Warning-Message "3. Consider rollback if critical issues found"
            Write-Host ""

            # نمایش تست‌های ناموفق
            $failedTests = $report.results | Where-Object { $_.passed -eq $false }
            if ($failedTests) {
                Write-Error-Message "Failed tests:"
                foreach ($test in $failedTests) {
                    Write-Host "  - $($test.name): $($test.error)" -ForegroundColor Red
                }
                Write-Host ""
            }

            exit 1
        }
    } catch {
        Write-Warning-Message "Failed to parse report: $_"
        exit 1
    }
} else {
    Write-Error-Message "Report file not found: $jsonReportPath"
    exit 1
}
