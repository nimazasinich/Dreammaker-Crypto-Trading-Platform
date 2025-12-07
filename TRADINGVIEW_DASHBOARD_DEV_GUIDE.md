# TradingView Dashboard - Developer Guide

## 🎯 Quick Reference for Developers

This guide is for developers who want to understand, extend, or customize the TradingView dashboard implementation.

---

## 📁 File Structure

```
src/
├── views/
│   └── TradingViewDashboard.tsx        # Main dashboard view
├── components/
│   └── tradingview/
│       ├── AdvancedChart.tsx           # Advanced chart widget
│       ├── TickerTape.tsx              # Ticker tape widget
│       ├── MarketOverview.tsx          # Market overview widget
│       ├── Screener.tsx                # Crypto screener widget
│       ├── SymbolInfo.tsx              # Symbol information widget
│       ├── TechnicalAnalysisWidget.tsx # Technical analysis widget
│       ├── MarketData.tsx              # Market data widget
│       └── CryptoHeatmap.tsx           # Crypto heatmap widget
└── components/Navigation/
    ├── NavigationProvider.tsx          # Updated with new view
    └── EnhancedSidebar.tsx             # Updated with menu item
```

---

## 🏗️ Architecture

### Component Hierarchy

```
TradingViewDashboard (Main Container)
├── Header
│   ├── Logo & Title
│   ├── Symbol Selector (Dropdown)
│   └── Toolbar Toggle Button
├── Main Content Area
│   ├── Tool Sidebar (Collapsible)
│   │   └── Tool Cards (8 widgets)
│   └── Widget Display Area
│       └── Grid of Active Widgets
│           ├── Widget Card
│           │   ├── Header (Title + Close Button)
│           │   └── Widget Component (Lazy Loaded)
│           └── ... more widgets
```

### State Management

```typescript
// Widget State
const [activeWidgets, setActiveWidgets] = useState<Widget[]>([])

// Widget Interface
interface Widget {
  id: string;          // Unique identifier
  type: WidgetType;    // Widget type enum
  symbol?: string;     // Trading symbol
  interval?: string;   // Timeframe
}

// Persisted to localStorage on change
useEffect(() => {
  localStorage.setItem('tv-dashboard-widgets', JSON.stringify(activeWidgets));
}, [activeWidgets]);
```

---

## 🔧 Adding a New Widget

### Step 1: Create Widget Component

```typescript
// src/components/tradingview/NewWidget.tsx
import React, { useEffect, useRef, memo } from 'react';

interface NewWidgetProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  // ... other props
}

const NewWidget: React.FC<NewWidgetProps> = ({
  symbol = 'BINANCE:BTCUSDT',
  theme = 'dark',
}) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    // Clear previous content
    container.current.innerHTML = '';

    // Create TradingView script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-[WIDGET-NAME].js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      colorTheme: theme,
      // ... widget configuration
    });

    container.current.appendChild(script);

    // Cleanup on unmount
    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, theme]); // Re-run when props change

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default memo(NewWidget);
```

### Step 2: Add to Widget Types

```typescript
// src/views/TradingViewDashboard.tsx

// Add to type definition
export type WidgetType = 
  | 'chart' 
  | 'ticker'
  // ... existing types
  | 'new-widget';  // ← Add this
```

### Step 3: Register in Tool List

```typescript
// src/views/TradingViewDashboard.tsx

const TOOLS: ToolItem[] = [
  // ... existing tools
  { 
    id: 'new-widget', 
    label: 'New Widget Name', 
    icon: YourIconComponent,  // From lucide-react
    description: 'Description of what this widget does'
  },
];
```

### Step 4: Import and Render

```typescript
// src/views/TradingViewDashboard.tsx

// Add lazy import
const NewWidget = lazy(() => import('../components/tradingview/NewWidget'));

// Add to renderWidget function
const renderWidget = (widget: Widget) => {
  const widgetTheme = isDark ? 'dark' : 'light';
  
  switch (widget.type) {
    // ... existing cases
    case 'new-widget':
      return <NewWidget symbol={widget.symbol || selectedSymbol} theme={widgetTheme} />;
    default:
      return <div>Unknown widget type</div>;
  }
};
```

---

## 🎨 Customizing Widget Appearance

### Theme Colors

Widgets automatically adapt to your theme, but you can customize further:

```typescript
// In widget component
script.innerHTML = JSON.stringify({
  colorTheme: theme,
  // Custom colors (if supported by widget)
  backgroundColor: isDark ? '#0a0a0f' : '#ffffff',
  textColor: isDark ? '#f8fafc' : '#0f172a',
  accentColor: '#8b5cf6', // Your brand color
});
```

### Widget Dimensions

```typescript
// Fixed size
<AdvancedChart width={800} height={500} />

// Responsive (percentage)
<AdvancedChart width="100%" height={500} />

// Dynamic based on container
const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
// Use ResizeObserver to track container size
```

---

## 💾 State Persistence

### How It Works

```typescript
// Save to localStorage
useEffect(() => {
  localStorage.setItem('tv-dashboard-widgets', JSON.stringify(activeWidgets));
}, [activeWidgets]);

// Load from localStorage
const [activeWidgets, setActiveWidgets] = useState<Widget[]>(() => {
  const saved = localStorage.getItem('tv-dashboard-widgets');
  return saved ? JSON.parse(saved) : defaultWidgets;
});
```

### What Gets Persisted

- ✅ Active widget list
- ✅ Widget order
- ✅ Selected symbol
- ❌ Widget internal state (handled by TradingView)
- ❌ Zoom level, drawings (handled by TradingView)

### Clearing Saved State

```javascript
// In browser console
localStorage.removeItem('tv-dashboard-widgets');
localStorage.removeItem('tv-dashboard-symbol');
```

---

## 🚀 Performance Optimization

### Current Optimizations

1. **Lazy Loading**: Widgets load only when rendered
   ```typescript
   const AdvancedChart = lazy(() => import('../components/tradingview/AdvancedChart'));
   ```

2. **React.memo**: Prevents unnecessary re-renders
   ```typescript
   export default memo(AdvancedChart);
   ```

3. **Script Cleanup**: Removes scripts on unmount
   ```typescript
   return () => {
     if (container.current) {
       container.current.innerHTML = '';
     }
   };
   ```

### Additional Optimizations (Future)

```typescript
// Virtualization for many widgets
import { FixedSizeGrid } from 'react-window';

// Intersection Observer for lazy visibility
const [isVisible, setIsVisible] = useState(false);
// Only load widget when in viewport

// Debounced symbol changes
import { useDebouncedValue } from './hooks';
const debouncedSymbol = useDebouncedValue(selectedSymbol, 500);
```

---

## 🔌 Integration with Existing Data

### Scenario: Display Your Backend Data

If you want to create a custom widget that uses your application's data instead of TradingView's:

```typescript
// src/components/tradingview/CustomDataWidget.tsx
import { useEffect, useState } from 'react';
import { realDataManager } from '../../services/RealDataManager';

const CustomDataWidget: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Use your existing data services
      const result = await realDataManager.getMarketData(symbol);
      setData(result);
    };
    
    fetchData();
    const interval = setInterval(fetchData, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <div>
      {/* Render your custom UI with your data */}
      <div>Price: {data?.price}</div>
      <div>Volume: {data?.volume}</div>
    </div>
  );
};
```

---

## 🎯 Widget Configuration Examples

### Advanced Chart with Custom Indicators

```typescript
script.innerHTML = JSON.stringify({
  symbol: symbol,
  interval: 'D',
  theme: theme,
  studies: [
    'STD;SMA',           // Simple Moving Average
    'STD;EMA',           // Exponential Moving Average  
    'STD;MACD',          // MACD
    'STD;RSI',           // Relative Strength Index
    'STD;BB',            // Bollinger Bands
    'STD;Stochastic',    // Stochastic
    'STD;Volume',        // Volume
  ],
  // Many more options available
});
```

### Screener with Custom Filters

```typescript
script.innerHTML = JSON.stringify({
  market: 'crypto',
  defaultColumn: 'overview',
  defaultScreen: 'general',
  // Pre-filter results
  showToolbar: true,
  colorTheme: theme,
});
```

---

## 📱 Responsive Design

### Current Breakpoints

```typescript
// Mobile: < 768px
- Single column layout
- Tool sidebar overlays content
- Compact header

// Tablet: 768px - 1024px  
- 1-2 column grid
- Collapsible sidebar
- Full features

// Desktop: > 1024px
- 2 column grid
- Persistent sidebar
- All features visible
```

### Adding Custom Breakpoints

```typescript
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkSize = () => {
    setIsMobile(window.innerWidth < 640);
  };
  
  checkSize();
  window.addEventListener('resize', checkSize);
  return () => window.removeEventListener('resize', checkSize);
}, []);

// Use in render
{isMobile ? <MobileLayout /> : <DesktopLayout />}
```

---

## 🐛 Debugging

### Common Issues

#### 1. Widget Not Loading

**Check**:
- Browser console for errors
- Network tab for script loading
- Container ref is valid
- Script src URL is correct

**Debug**:
```typescript
useEffect(() => {
  console.log('Container:', container.current);
  console.log('Widget type:', widget.type);
  
  if (!container.current) {
    console.error('Container ref is null');
    return;
  }
  
  // ... rest of code
}, []);
```

#### 2. State Not Persisting

**Check**:
```typescript
// Add logging
useEffect(() => {
  console.log('Saving widgets:', activeWidgets);
  localStorage.setItem('tv-dashboard-widgets', JSON.stringify(activeWidgets));
}, [activeWidgets]);

// Verify in browser console
console.log(localStorage.getItem('tv-dashboard-widgets'));
```

#### 3. Performance Issues

**Check**:
```typescript
// Count active widgets
console.log('Active widgets:', activeWidgets.length);

// Monitor renders
useEffect(() => {
  console.log('Dashboard rendered');
});
```

---

## 🧪 Testing

### Unit Tests (Example)

```typescript
// TradingViewDashboard.test.tsx
import { render, screen } from '@testing-library/react';
import TradingViewDashboard from './TradingViewDashboard';

test('renders dashboard title', () => {
  render(<TradingViewDashboard />);
  expect(screen.getByText('TradingView Dashboard')).toBeInTheDocument();
});

test('adds widget when tool is clicked', () => {
  const { getByText } = render(<TradingViewDashboard />);
  fireEvent.click(getByText('Advanced Chart'));
  expect(screen.getByText('Advanced Chart')).toBeInTheDocument();
});
```

### Integration Tests

```typescript
// Test localStorage persistence
test('persists widgets to localStorage', () => {
  const { rerender } = render(<TradingViewDashboard />);
  // Add widget
  // Unmount and remount
  rerender(<TradingViewDashboard />);
  // Verify widget still exists
});
```

---

## 📦 Build & Deploy

### Production Build

```bash
npm run build
```

**Optimizations Applied**:
- Tree shaking (unused widget code removed if not imported)
- Code splitting (each widget in separate chunk)
- Minification
- Gzip compression

### Bundle Analysis

```bash
# Analyze bundle size
npm run build -- --analyze

# Check widget chunk sizes
ls -lh dist/assets/
```

**Expected Sizes**:
- TradingViewDashboard: ~15-20KB (gzipped)
- Each widget component: ~2-5KB (gzipped)
- TradingView scripts: Loaded from CDN (not in bundle)

---

## 🔐 Security Considerations

### Content Security Policy

If using CSP, allow TradingView scripts:

```html
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self' https://s3.tradingview.com;">
```

### XSS Prevention

- ✅ No user input rendered without sanitization
- ✅ TradingView scripts loaded from official CDN
- ✅ No `dangerouslySetInnerHTML` used
- ✅ Widget configuration is JSON stringified (safe)

---

## 📚 Additional Resources

### TradingView Widget Documentation
- **All Widgets**: https://www.tradingview.com/widget/
- **Advanced Chart**: https://www.tradingview.com/widget/advanced-chart/
- **Widget Customization**: https://www.tradingview.com/widget-docs/

### React Best Practices
- **Lazy Loading**: https://react.dev/reference/react/lazy
- **useEffect**: https://react.dev/reference/react/useEffect
- **Refs**: https://react.dev/reference/react/useRef

### TypeScript
- **Interfaces**: https://www.typescriptlang.org/docs/handbook/interfaces.html
- **Generics**: https://www.typescriptlang.org/docs/handbook/2/generics.html

---

## 🤝 Contributing

### Adding New Features

1. Create feature branch: `git checkout -b feature/new-widget`
2. Implement widget component
3. Add to dashboard
4. Test thoroughly
5. Update this guide
6. Create pull request

### Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments for complex functions
- Use meaningful variable names
- Keep components focused (single responsibility)

---

## 📞 Support

**Need Help?**
- Check START_HERE.md for user documentation
- Review this guide for technical details
- Check browser console for errors
- Review TradingView widget documentation
- Open GitHub issue for bugs

---

**Developer Guide Version**: 1.0  
**Last Updated**: December 4, 2025  
**Maintainer**: Development Team

