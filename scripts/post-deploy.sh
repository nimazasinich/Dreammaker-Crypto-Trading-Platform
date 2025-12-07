#!/bin/bash
###############################################################################
# Post-Deployment Health Check Script
#
# این اسکریپت بعد از هر deployment اجرا می‌شود تا سلامت سیستم را تایید کند.
#
# استفاده:
#   bash scripts/post-deploy.sh
#   bash scripts/post-deploy.sh production
#   bash scripts/post-deploy.sh staging --verbose
#
# خروجی:
#   Exit code 0: همه تست‌ها موفق
#   Exit code 1: برخی تست‌ها ناموفق
#
# نویسنده: Dreammaker Team
# تاریخ: 2025-12-03
###############################################################################

set -e  # خروج در صورت error

# رنگ‌ها برای terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# تابع لاگ
log() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# پارامترهای ورودی
ENVIRONMENT="${1:-development}"
VERBOSE="${2:-}"

# متغیرهای پیش‌فرض
REPORT_DIR="./reports"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
HEALTH_CHECK_SCRIPT="scripts/health-check-production.ts"

###############################################################################
# Main Script
###############################################################################

log "🚀 Post-Deployment Health Check Starting..."
log "Environment: ${ENVIRONMENT}"
log "Timestamp: ${TIMESTAMP}"
echo ""

# بررسی وجود dependencies
if ! command -v node &> /dev/null; then
    log_error "Node.js not found. Please install Node.js >= 18.0.0"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm not found. Please install npm >= 9.0.0"
    exit 1
fi

log_success "Dependencies check passed"
echo ""

# ایجاد دایرکتوری گزارش‌ها
mkdir -p "${REPORT_DIR}/archive"

# اجرای health check
log "🏥 Running health checks..."
echo ""

HEALTH_CHECK_CMD="npm run health:check -- --env ${ENVIRONMENT} --parallel --fail-on-error"

if [ "$VERBOSE" = "--verbose" ] || [ "$VERBOSE" = "-v" ]; then
    HEALTH_CHECK_CMD="${HEALTH_CHECK_CMD} --format console"
fi

# اجرا و ذخیره exit code
set +e  # موقتا error handling را غیرفعال می‌کنیم
${HEALTH_CHECK_CMD}
HEALTH_CHECK_EXIT_CODE=$?
set -e

echo ""

# تولید گزارش JSON
log "📊 Generating JSON report..."
npm run health:check -- \
    --env "${ENVIRONMENT}" \
    --parallel \
    --format json \
    --output "${REPORT_DIR}/health-check-${ENVIRONMENT}.json"

# آرشیو گزارش
cp "${REPORT_DIR}/health-check-${ENVIRONMENT}.json" \
   "${REPORT_DIR}/archive/health-${ENVIRONMENT}-${TIMESTAMP}.json"

log_success "Report saved to ${REPORT_DIR}/health-check-${ENVIRONMENT}.json"
log_info "Archived to ${REPORT_DIR}/archive/health-${ENVIRONMENT}-${TIMESTAMP}.json"
echo ""

# تولید گزارش Markdown (اختیاری)
if [ "${ENVIRONMENT}" = "production" ] || [ "${ENVIRONMENT}" = "staging" ]; then
    log "📝 Generating Markdown report..."
    npm run health:check -- \
        --env "${ENVIRONMENT}" \
        --parallel \
        --format markdown \
        --output "${REPORT_DIR}/health-check-${ENVIRONMENT}.md"

    log_success "Markdown report saved to ${REPORT_DIR}/health-check-${ENVIRONMENT}.md"
    echo ""
fi

# خلاصه نتایج
log "📋 Summary:"
echo ""

if [ -f "${REPORT_DIR}/health-check-${ENVIRONMENT}.json" ]; then
    # استخراج اطلاعات از گزارش JSON
    if command -v jq &> /dev/null; then
        TOTAL=$(jq -r '.total' "${REPORT_DIR}/health-check-${ENVIRONMENT}.json")
        PASSED=$(jq -r '.passed' "${REPORT_DIR}/health-check-${ENVIRONMENT}.json")
        FAILED=$(jq -r '.failed' "${REPORT_DIR}/health-check-${ENVIRONMENT}.json")
        PASS_RATE=$(jq -r '.passRate' "${REPORT_DIR}/health-check-${ENVIRONMENT}.json")
        DURATION=$(jq -r '.duration' "${REPORT_DIR}/health-check-${ENVIRONMENT}.json")

        echo "  Total Tests:  ${TOTAL}"
        echo "  Passed:       ${PASSED}"
        echo "  Failed:       ${FAILED}"
        echo "  Pass Rate:    ${PASS_RATE}%"
        echo "  Duration:     ${DURATION}ms"
        echo ""
    else
        log_warning "jq not installed - install for detailed summary"
    fi
fi

# نتیجه نهایی
if [ ${HEALTH_CHECK_EXIT_CODE} -eq 0 ]; then
    log_success "All health checks passed!"
    log_success "Deployment to ${ENVIRONMENT} verified successfully"
    echo ""
    log_info "Next steps:"
    log_info "1. Review the report: cat ${REPORT_DIR}/health-check-${ENVIRONMENT}.md"
    log_info "2. Monitor the application for the next 15 minutes"
    log_info "3. Check error logs: tail -f /var/log/app.log"
    echo ""
    exit 0
else
    log_error "Health checks failed!"
    log_error "Deployment to ${ENVIRONMENT} has issues"
    echo ""
    log_warning "Recommended actions:"
    log_warning "1. Review failed tests in report"
    log_warning "2. Check application logs"
    log_warning "3. Consider rollback if critical issues found"
    echo ""

    # نمایش تست‌های ناموفق
    if command -v jq &> /dev/null && [ -f "${REPORT_DIR}/health-check-${ENVIRONMENT}.json" ]; then
        log_error "Failed tests:"
        jq -r '.results[] | select(.passed == false) | "  - \(.name): \(.error)"' \
            "${REPORT_DIR}/health-check-${ENVIRONMENT}.json"
        echo ""
    fi

    exit 1
fi
