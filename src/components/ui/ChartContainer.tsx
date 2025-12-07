import React, { useEffect, useLayoutEffect, useRef, useState, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Download, 
  Settings,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

// ============================================================================
// Types
// ============================================================================

interface ChartContainerProps {
  minHeight?: number;
  maxHeight?: number;
  className?: string;
  children: (ready: boolean, dims: { w: number; h: number }) => ReactNode;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onFullscreen?: () => void;
  onDownload?: () => void;
  onSettings?: () => void;
  showToolbar?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
  variant?: 'default' | 'glass' | 'minimal';
}

// ============================================================================
// Chart Container Component
// ============================================================================

export default function ChartContainer({
  minHeight = 260,
  maxHeight,
  className = '',
  children,
  title,
  subtitle,
  loading = false,
  error = null,
  onRefresh,
  onFullscreen,
  onDownload,
  onSettings,
  showToolbar = true,
  trend,
  trendValue,
  headerContent,
  footerContent,
  variant = 'glass',
}: ChartContainerProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Resize observer for responsive charts
  useLayoutEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const updateDimensions = () => {
      const rect = el.getBoundingClientRect();
      setDims({
        w: Math.floor(rect.width),
        h: Math.max(minHeight, Math.floor(rect.height))
      });
    };

    const ro = new ResizeObserver(updateDimensions);
    ro.observe(el);
    updateDimensions();

    return () => ro.disconnect();
  }, [minHeight]);

  const ready = dims.w > 0 && dims.h >= minHeight;

  // Handle refresh with animation
  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [onRefresh, isRefreshing]);

  // Handle fullscreen toggle
  const handleFullscreen = useCallback(() => {
    if (onFullscreen) {
      onFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  }, [onFullscreen, isFullscreen]);

  // Variant styles
  const variantStyles = {
    default: 'bg-[color:var(--surface-elevated)] border border-[color:var(--border-default)]',
    glass: 'bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-purple-500/20',
    minimal: 'bg-transparent',
  };

  // Trend indicator
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-purple-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        relative overflow-hidden rounded-xl
        ${variantStyles[variant]}
        ${isFullscreen ? 'fixed inset-4 z-50' : ''}
        ${className}
      `}
      style={{
        minHeight: `${minHeight}px`,
        maxHeight: maxHeight ? `${maxHeight}px` : undefined,
      }}
    >
      {/* Header */}
      {(title || showToolbar) && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-[color:var(--border-default)]">
          {/* Title section */}
          <div className="flex items-center gap-3 min-w-0">
            {title && (
              <div className="min-w-0">
                <h3 className="font-semibold text-[color:var(--text-primary)] truncate">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-[color:var(--text-muted)] truncate mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            
            {/* Trend indicator */}
            {trend && trendValue && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-current/10 ${trendColor}`}>
                <TrendIcon className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">{trendValue}</span>
              </div>
            )}

            {headerContent}
          </div>

          {/* Toolbar */}
          {showToolbar && (
            <div className="flex items-center gap-1">
              {onRefresh && (
                <ToolbarButton
                  icon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
                  onClick={handleRefresh}
                  tooltip="Refresh"
                  disabled={isRefreshing}
                />
              )}
              {onDownload && (
                <ToolbarButton
                  icon={<Download className="w-4 h-4" />}
                  onClick={onDownload}
                  tooltip="Download"
                />
              )}
              {onSettings && (
                <ToolbarButton
                  icon={<Settings className="w-4 h-4" />}
                  onClick={onSettings}
                  tooltip="Settings"
                />
              )}
              {onFullscreen && (
                <ToolbarButton
                  icon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  onClick={handleFullscreen}
                  tooltip={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Chart content area */}
      <div
        ref={ref}
        className="relative"
        style={{ 
          minHeight: `${minHeight - (title || showToolbar ? 60 : 0)}px`,
        }}
      >
        <AnimatePresence mode="wait">
          {/* Loading state */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            >
              <LoadingSpinner variant="gradient" size="lg" label="Loading chart data..." />
            </motion.div>
          )}

          {/* Error state */}
          {error && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 p-6"
            >
              <div className="p-4 rounded-full bg-red-500/10">
                <Activity className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-[color:var(--text-primary)]">
                  Unable to load chart
                </p>
                <p className="text-sm text-[color:var(--text-muted)] mt-1 max-w-xs">
                  {error}
                </p>
              </div>
              {onRefresh && (
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors"
                >
                  Try again
                </button>
              )}
            </motion.div>
          )}

          {/* Chart content */}
          {!error && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: loading ? 0.5 : 1 }}
              className="h-full"
            >
              {children(ready && !loading, dims)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {footerContent && (
        <div className="px-4 py-2 border-t border-[color:var(--border-default)]">
          {footerContent}
        </div>
      )}

      {/* Fullscreen overlay backdrop */}
      {isFullscreen && (
        <div
          className="fixed inset-0 -z-10 bg-black/80 backdrop-blur-md"
          onClick={handleFullscreen}
        />
      )}
    </motion.div>
  );
}

// ============================================================================
// Toolbar Button Component
// ============================================================================

interface ToolbarButtonProps {
  icon: ReactNode;
  onClick: () => void;
  tooltip?: string;
  disabled?: boolean;
  active?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  onClick,
  tooltip,
  disabled = false,
  active = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={tooltip}
    className={`
      p-2 rounded-lg transition-all duration-200
      ${active 
        ? 'bg-purple-500/20 text-purple-400' 
        : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] hover:bg-white/5'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `}
  >
    {icon}
  </button>
);

// ============================================================================
// Mini Chart Component (for inline sparklines)
// ============================================================================

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  gradient?: boolean;
  showArea?: boolean;
  className?: string;
}

export const MiniChart: React.FC<MiniChartProps> = ({
  data,
  width = 100,
  height = 32,
  color = '#8b5cf6',
  gradient = true,
  showArea = true,
  className = '',
}) => {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;
  const gradientId = `mini-chart-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      {gradient && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      
      {showArea && (
        <path
          d={areaD}
          fill={gradient ? `url(#${gradientId})` : `${color}20`}
        />
      )}
      
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ============================================================================
// Chart Legend Component
// ============================================================================

interface LegendItem {
  label: string;
  color: string;
  value?: string | number;
  active?: boolean;
}

interface ChartLegendProps {
  items: LegendItem[];
  onToggle?: (index: number) => void;
  className?: string;
}

export const ChartLegend: React.FC<ChartLegendProps> = ({
  items,
  onToggle,
  className = '',
}) => (
  <div className={`flex flex-wrap items-center gap-4 ${className}`}>
    {items.map((item, index) => (
      <button
        key={index}
        onClick={() => onToggle?.(index)}
        className={`
          flex items-center gap-2 text-sm transition-opacity
          ${item.active === false ? 'opacity-40' : 'opacity-100'}
          ${onToggle ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
        `}
      >
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="text-[color:var(--text-secondary)]">{item.label}</span>
        {item.value !== undefined && (
          <span className="font-medium text-[color:var(--text-primary)]">
            {item.value}
          </span>
        )}
      </button>
    ))}
  </div>
);

export { ChartContainer };
