---
title: Crypto Intelligence Hub
emoji: 📊
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
---

# Crypto Intelligence Hub

Advanced cryptocurrency data analysis platform with AI-powered insights and real-time market intelligence.

## Features

- 📊 Real-time cryptocurrency market data
- 🤖 AI-powered sentiment analysis
- 📈 Advanced technical analysis
- 🔔 Custom alerts and notifications
- 📉 Trading signals and predictions
- 🌐 Multi-exchange support (Binance, KuCoin)
- 💹 Futures trading analytics

## Deployment

This application is deployed on Hugging Face Spaces using Docker.

### Configuration

- **SDK**: Docker
- **Port**: 7860
- **Backend**: Node.js + Express
- **Frontend**: React + Vite
- **Proxy**: Nginx

### Architecture

```
[User] → [Nginx:7860] → [Node.js Backend:8000]
                      ↓
              [Static Files: /app/dist]
```

## API Documentation

Available endpoints:
- `/api/health` - System health check
- `/api/models/status` - AI models status
- `/api/market-data/prices` - Market prices
- `/api/system/health` - System information

## Development

See the full repository for local development instructions.

## Archived Files

**Two cleanup phases have been completed to optimize the codebase:**

### Phase 1: Legacy UI Components (Dec 4, 2025)
- **Archive**: `legacy-ui-20251204.zip` (54 KB)
- **Contents**: 
  - Legacy `DashboardView.tsx` (superseded by EnhancedDashboardView)
  - Legacy `Sidebar.tsx` (superseded by EnhancedSidebar)
  - Backup files from `__backup__/` directory
- **Total**: ~3,200 lines archived

### Phase 2: Test & Legacy View Files (Dec 4, 2025)
- **Archive**: `legacy-views-20251204.zip` (~25 KB)
- **Contents**:
  - Test servers (`server-simple.ts`, `quick-test.ts`)
  - Test script (`test-data-sources.ts`)
  - Legacy strategy lab views
- **Total**: ~1,658 lines removed

### Combined Impact
- ✅ **15 files removed** from active codebase
- ✅ **~4,858 lines cleaned up**
- ✅ **Full restoration available** via ZIP archives or git history
- ✅ **No functionality lost** - only duplicates and test files removed

### Restoration
```bash
# Extract archives if needed
unzip legacy-ui-20251204.zip
unzip legacy-views-20251204.zip

# Or restore from git history
git checkout <commit-hash>^ -- path/to/file
```

**Documentation**: See `CHANGELOG.md` and `COMPREHENSIVE_CODE_ANALYSIS_REPORT.md` for complete details.

## License

Unlicense
