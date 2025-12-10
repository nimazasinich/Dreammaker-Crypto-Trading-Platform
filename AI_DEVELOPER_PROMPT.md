# AI Developer Prompt: Dreammaker Crypto Trading Platform

## 🎯 MISSION

You are building a **professional-grade cryptocurrency trading platform** with real-time data, AI-powered analysis, and comprehensive trading features. The platform uses **HuggingFace Space** as its primary data source and must NEVER use mock data in production.

---

## 📋 PROJECT OVERVIEW

### Technology Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Data Source:** HuggingFace Space API (https://really-amin-datasourceforcryptocurrency-2.hf.space)
- **Real-time:** WebSocket for live updates
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Deployment:** Docker + HuggingFace Spaces

### Core Principles
1. **Real Data Only** - No mock/fake data in production
2. **Type Safety** - Strict TypeScript throughout
3. **Performance First** - Sub-3-second page loads
4. **Security** - API keys on backend only
5. **Accessibility** - WCAG 2.1 AA compliance

---

## 🏗️ ARCHITECTURE

### Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base components (Button, Card, Modal)
│   ├── charts/         # Chart components (Candlestick, Line)
│   ├── trading/        # Trading-specific components
│   └── Navigation/     # Navigation components
├── views/              # Page-level components
│   ├── trading-hub/    # Trading Hub (Spot, Futures, Portfolio)
│   ├── ai-lab/         # AI Lab (Scanner, Signals, Backtest)
│   ├── admin/          # Admin Hub (Health, Monitoring)
│   └── [ViewName].tsx  # Individual views
├── services/           # API and data services
│   ├── HFDataEngineClient.ts    # HuggingFace HTTP client
│   ├── HFDataEngineAdapter.ts   # Data transformation
│   └── [Service]Service.ts      # Domain services
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── config/             # Configuration files
│   ├── apiConfig.ts    # API endpoints
│   ├── dataPolicy.ts   # Data policy enforcement
│   └── env.ts          # Environment variables
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── server.ts           # Express backend server
```

### Data Flow Architecture
```
[React Components]
        ↓
[Context Providers] ←→ [Custom Hooks]
        ↓
[Service Layer (Adapters)]
        ↓
[HTTP Client (Axios)]
        ↓
[HuggingFace API]
```

---

## 🔌 API INTEGRATION

### Base Configuration
```typescript
// src/config/apiConfig.ts
export const HUGGINGFACE_API_BASE = 'https://really-amin-datasourceforcryptocurrency-2.hf.space';

export const API_ENDPOINTS = {
  // Market Data
  topCoins: '/api/coins/top',
  marketTickers: '/api/market/tickers',
  
  // OHLCV Data
  ohlcv: '/api/ohlcv',           // GET ?symbol=BTC&timeframe=1h&limit=200
  
  // Sentiment & AI
  globalSentiment: '/api/sentiment/global',
  assetSentiment: '/api/sentiment/asset',  // + /{symbol}
  aiSignals: '/api/ai/signals',
  aiDecision: '/api/ai/decision',
  
  // News
  news: '/api/news',
  newsLatest: '/api/news/latest',
  
  // Technical Analysis
  quickTA: '/api/technical/quick',           // + /{symbol}
  comprehensiveTA: '/api/technical/comprehensive',
  
  // System
  health: '/api/health',
  status: '/api/status',
};
```

### API Response Format
```typescript
// Standard success response
interface ApiResponse<T> {
  success: true;
  data: T;
  timestamp: string;
  source?: string;
}

// Standard error response
interface ApiErrorResponse {
  success: false;
  error: string;
  code?: number;
  details?: unknown;
}
```

### HTTP Client Pattern
```typescript
// src/services/HFDataEngineClient.ts
class HFDataEngineClient {
  private baseUrl: string;
  private timeout: number = 30000;
  
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response = await axios.get(`${this.baseUrl}${endpoint}`, {
      params,
      timeout: this.timeout,
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }
  
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await axios.post(`${this.baseUrl}${endpoint}`, data, {
      timeout: this.timeout,
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }
}
```

---

## 📊 CORE FEATURES

### 1. Dashboard View
**Purpose:** Overview of market status, portfolio, and key metrics

**Components Required:**
- MarketOverviewCard (top coins, gainers/losers)
- PortfolioSummary (total value, P&L)
- SentimentGauge (Fear & Greed Index)
- RecentSignals (latest AI signals)
- NewsWidget (trending news)
- QuickActions (buy/sell shortcuts)

**Data Requirements:**
- GET /api/coins/top?limit=20
- GET /api/sentiment/global
- GET /api/news/latest?limit=5
- GET /api/ai/signals?limit=10

### 2. Trading Hub
**Purpose:** Complete trading interface with multiple modes

**Tabs:**
- **Charts** - TradingView-style candlestick charts
- **Spot Trading** - Buy/sell with order book
- **Futures Trading** - Leverage trading
- **Positions** - Open positions management
- **Portfolio** - Holdings and allocation

**Key Components:**
```typescript
// Chart component with real-time updates
interface ChartProps {
  symbol: string;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  indicators?: ('MA' | 'RSI' | 'MACD' | 'BB')[];
}

// Order form
interface OrderFormProps {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  onSubmit: (order: OrderData) => void;
}
```

### 3. AI Lab
**Purpose:** AI-powered analysis and strategy tools

**Tabs:**
- **Scanner** - Market scanning with AI filters
- **Signals** - Buy/sell signal generation
- **Training** - Model training interface
- **Backtest** - Strategy backtesting
- **Builder** - Custom strategy builder

**AI Integration:**
```typescript
// Get AI trading decision
async function getAIDecision(symbol: string): Promise<AIDecision> {
  const response = await client.post('/api/ai/decision', {
    symbol,
    timeframe: '1h',
    include_reasoning: true
  });
  return response.data;
}

interface AIDecision {
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;      // 0-100
  reasoning: string[];
  entry_price?: number;
  stop_loss?: number;
  take_profit?: number;
}
```

### 4. Market Analysis
**Purpose:** Comprehensive market analysis tools

**Features:**
- Technical Analysis (indicators, patterns)
- Sentiment Analysis (social, news)
- On-chain Analysis (whale movements)
- Correlation Matrix
- Market Heatmap

### 5. Risk Management
**Purpose:** Portfolio risk assessment and management

**Features:**
- Risk Score Calculator
- Position Sizing Tool
- Drawdown Analysis
- Exposure Limits
- Alert Configuration

### 6. Admin Hub
**Purpose:** System monitoring and configuration

**Tabs:**
- **Health** - API status, service health
- **Monitoring** - Performance metrics
- **Diagnostics** - Error logs, debugging
- **Settings** - System configuration

---

## 🎨 UI/UX GUIDELINES

### Design System
```typescript
// Color palette
const colors = {
  primary: '#8b5cf6',      // Purple
  success: '#10b981',      // Green (profit)
  danger: '#ef4444',       // Red (loss)
  warning: '#f59e0b',      // Orange
  background: {
    dark: '#0f172a',
    card: '#1e293b',
    hover: '#334155'
  },
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8',
    muted: '#64748b'
  }
};

// Typography
const typography = {
  fontFamily: 'Inter, system-ui, sans-serif',
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem'
  }
};
```

### Component Standards
```tsx
// Standard card component
interface CardProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

// Loading state pattern
function DataCard({ loading, error, data }) {
  if (loading) return <Skeleton />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <EmptyState />;
  return <Content data={data} />;
}
```

### Responsive Design
- Mobile-first approach
- Breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
- Sidebar collapses on mobile
- Touch-friendly interactions

---

## 🔒 DATA POLICY

### Production Enforcement
```typescript
// src/config/dataPolicy.ts
export function validateProductionDataPolicy(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // No mock data allowed
    if (process.env.VITE_USE_MOCK_DATA === 'true') {
      throw new Error('PRODUCTION ERROR: Mock data is not allowed');
    }
    
    // Must be online mode
    if (process.env.VITE_APP_MODE !== 'online') {
      throw new Error('PRODUCTION ERROR: Only online mode allowed');
    }
    
    // Strict real data required
    if (process.env.VITE_STRICT_REAL_DATA !== 'true') {
      throw new Error('PRODUCTION ERROR: Strict real data mode required');
    }
  }
}
```

### Environment Configuration
```env
# Production settings
NODE_ENV=production
VITE_APP_MODE=online
VITE_STRICT_REAL_DATA=true
VITE_USE_MOCK_DATA=false
VITE_ALLOW_FAKE_DATA=false

# API Configuration
HF_ENGINE_BASE_URL=https://really-amin-datasourceforcryptocurrency-2.hf.space
HF_ENGINE_ENABLED=true
PRIMARY_DATA_SOURCE=huggingface
```

---

## ⚡ PERFORMANCE REQUIREMENTS

### Target Metrics
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Largest Contentful Paint:** < 2.5s
- **Bundle Size:** < 500KB (gzipped)

### Optimization Strategies
```typescript
// 1. Lazy loading views
const TradingHub = lazy(() => import('./views/trading-hub/UnifiedTradingHubView'));

// 2. Memoization
const MemoizedChart = memo(CandlestickChart, (prev, next) => 
  prev.symbol === next.symbol && prev.timeframe === next.timeframe
);

// 3. Virtual scrolling for large lists
import { VirtualList } from './components/ui/VirtualList';

// 4. Debounced API calls
const debouncedSearch = useMemo(
  () => debounce((query) => searchCoins(query), 300),
  []
);

// 5. Data caching
const CACHE_TTL = {
  market: 60_000,      // 1 minute
  sentiment: 300_000,  // 5 minutes
  news: 120_000,       // 2 minutes
};
```

---

## 🧪 TESTING REQUIREMENTS

### Unit Tests
```typescript
// Example: Service test
describe('HFDataEngineClient', () => {
  it('should fetch market data successfully', async () => {
    const client = new HFDataEngineClient();
    const data = await client.getMarketData({ limit: 10 });
    
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(10);
    expect(data.data[0]).toHaveProperty('symbol');
    expect(data.data[0]).toHaveProperty('price');
  });
  
  it('should handle API errors gracefully', async () => {
    const client = new HFDataEngineClient();
    const result = await client.get('/api/invalid-endpoint');
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### E2E Tests
```typescript
// Example: Trading flow test
test('user can place a market order', async ({ page }) => {
  await page.goto('/trading?tab=spot');
  
  // Select trading pair
  await page.click('[data-testid="pair-selector"]');
  await page.click('text=BTC/USDT');
  
  // Enter amount
  await page.fill('[data-testid="amount-input"]', '0.01');
  
  // Click buy button
  await page.click('[data-testid="buy-button"]');
  
  // Verify confirmation
  await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
});
```

---

## 📝 CODE STANDARDS

### TypeScript Rules
```typescript
// ✅ DO: Use explicit types
function calculatePnL(entry: number, current: number, quantity: number): number {
  return (current - entry) * quantity;
}

// ❌ DON'T: Use 'any'
function processData(data: any): any { } // Bad

// ✅ DO: Use interfaces for objects
interface TradeOrder {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  quantity: number;
  price?: number;
}

// ✅ DO: Handle errors properly
async function fetchData(): Promise<Result<Data, Error>> {
  try {
    const response = await api.get('/data');
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

### React Patterns
```tsx
// ✅ DO: Use functional components with hooks
function TradingCard({ symbol }: { symbol: string }) {
  const { data, loading, error } = useMarketData(symbol);
  
  if (loading) return <Skeleton />;
  if (error) return <ErrorCard error={error} />;
  
  return <Card data={data} />;
}

// ✅ DO: Proper dependency arrays
useEffect(() => {
  fetchData(symbol);
}, [symbol]); // Include all dependencies

// ✅ DO: Memoize callbacks
const handleSubmit = useCallback((data: FormData) => {
  submitOrder(data);
}, [submitOrder]);
```

---

## 🚀 DEPLOYMENT

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 7860
CMD ["node", "dist/server.js"]
```

### Health Check Endpoint
```typescript
// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    services: {
      database: 'connected',
      huggingface: 'connected',
      websocket: 'active'
    }
  });
});
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Core Infrastructure
- [ ] Project setup (Vite + React + TypeScript)
- [ ] API client implementation
- [ ] Data policy enforcement
- [ ] Environment configuration
- [ ] Error handling system
- [ ] Logging infrastructure

### Phase 2: UI Foundation
- [ ] Design system components
- [ ] Navigation system
- [ ] Theme provider (dark mode)
- [ ] Loading/error states
- [ ] Responsive layout

### Phase 3: Core Features
- [ ] Dashboard view
- [ ] Market data display
- [ ] Chart components
- [ ] Trading interface
- [ ] Portfolio management

### Phase 4: Advanced Features
- [ ] AI signals integration
- [ ] Backtesting engine
- [ ] Risk management tools
- [ ] Alert system
- [ ] WebSocket real-time updates

### Phase 5: Polish & Deploy
- [ ] Performance optimization
- [ ] Testing (unit + E2E)
- [ ] Security audit
- [ ] Documentation
- [ ] Production deployment

---

## 🔧 TROUBLESHOOTING

### Common Issues

**1. API Connection Failed**
```typescript
// Check: Is the URL correct (lowercase)?
const url = 'https://really-amin-datasourceforcryptocurrency-2.hf.space';

// Check: Is the endpoint available?
curl ${url}/api/health
```

**2. CORS Errors**
```typescript
// Backend: Add CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN,
  credentials: true
}));
```

**3. WebSocket Disconnection**
```typescript
// Implement reconnection logic
const ws = new WebSocket(url);
ws.onclose = () => {
  setTimeout(() => reconnect(), 5000);
};
```

---

## 📚 RESOURCES

- **HuggingFace API Docs:** /api/docs (Swagger UI)
- **React Documentation:** https://react.dev
- **TypeScript Handbook:** https://www.typescriptlang.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Lightweight Charts:** https://tradingview.github.io/lightweight-charts

---

**Remember:** This is a PRODUCTION application. Always prioritize:
1. Real data integrity
2. Security best practices
3. Error handling
4. User experience
5. Performance optimization

**Good luck building! 🚀**
