import React, { useState, useRef, useEffect } from 'react';
import {
  TrendingUp,
  Activity,
  BarChart2,
  Layers,
  Target,
  Zap,
  ChevronRight,
  ChevronLeft,
  Move,
  X,
  Settings,
  LineChart,
  Waves,
  Hexagon,
  Volume2,
} from 'lucide-react';
import { useTheme } from '../Theme/ThemeProvider';

export type ToolType = 
  | 'trendline'
  | 'fibonacci'
  | 'support-resistance'
  | 'elliott-wave'
  | 'harmonic'
  | 'volume-profile'
  | 'rsi'
  | 'macd'
  | 'bollinger';

interface Tool {
  id: ToolType;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  category: 'drawing' | 'indicator' | 'pattern';
}

interface FloatingToolbarProps {
  onToolSelect: (tool: ToolType) => void;
  activeTool: ToolType | null;
  onClose?: () => void;
}

const TOOLS: Tool[] = [
  // Drawing Tools
  {
    id: 'trendline',
    label: 'Trendline',
    icon: TrendingUp,
    description: 'Draw trend lines to identify support/resistance',
    category: 'drawing'
  },
  {
    id: 'fibonacci',
    label: 'Fibonacci',
    icon: Target,
    description: 'Fibonacci retracement and extension levels',
    category: 'drawing'
  },
  {
    id: 'support-resistance',
    label: 'S/R Levels',
    icon: Layers,
    description: 'Mark support and resistance zones',
    category: 'drawing'
  },
  // Pattern Detection
  {
    id: 'elliott-wave',
    label: 'Elliott Wave',
    icon: Waves,
    description: 'Elliott Wave pattern detection',
    category: 'pattern'
  },
  {
    id: 'harmonic',
    label: 'Harmonic',
    icon: Hexagon,
    description: 'Harmonic pattern detection (Gartley, Bat, etc.)',
    category: 'pattern'
  },
  {
    id: 'volume-profile',
    label: 'Volume',
    icon: Volume2,
    description: 'Volume profile analysis',
    category: 'pattern'
  },
  // Indicators
  {
    id: 'rsi',
    label: 'RSI',
    icon: Activity,
    description: 'Relative Strength Index',
    category: 'indicator'
  },
  {
    id: 'macd',
    label: 'MACD',
    icon: BarChart2,
    description: 'Moving Average Convergence Divergence',
    category: 'indicator'
  },
  {
    id: 'bollinger',
    label: 'Bollinger',
    icon: LineChart,
    description: 'Bollinger Bands',
    category: 'indicator'
  },
];

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  onToolSelect,
  activeTool,
  onClose
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'drawing' | 'indicator' | 'pattern'>('drawing');
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  // Handle drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      setPosition({
        x: Math.max(0, dragRef.current.initialX + deltaX),
        y: Math.max(0, dragRef.current.initialY + deltaY)
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const filteredTools = TOOLS.filter(t => t.category === activeCategory);

  const categories = [
    { id: 'drawing' as const, label: 'Draw', icon: TrendingUp },
    { id: 'pattern' as const, label: 'Patterns', icon: Hexagon },
    { id: 'indicator' as const, label: 'Indicators', icon: Activity },
  ];

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 select-none"
      style={{
        left: position.x,
        top: position.y,
        transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
      }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: isDark
            ? 'rgba(26, 26, 40, 0.98)'
            : 'rgba(255, 255, 255, 0.98)',
          border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
          boxShadow: isDark
            ? '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.1)'
            : '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.1)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header with drag handle */}
        <div
          className="flex items-center justify-between px-3 py-2 cursor-move"
          style={{
            background: isDark
              ? 'rgba(139, 92, 246, 0.15)'
              : 'rgba(139, 92, 246, 0.1)',
            borderBottom: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'}`,
          }}
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4 text-purple-400" />
            <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Tools
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg hover:bg-purple-500/20 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-purple-400" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-purple-400" />
              )}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <X className="h-4 w-4 text-red-400" />
              </button>
            )}
          </div>
        </div>

        {!isCollapsed && (
          <>
            {/* Category tabs */}
            <div className="flex border-b" style={{ borderColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }}>
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? 'text-purple-400 bg-purple-500/10'
                        : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-white/5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tools grid */}
            <div className="p-2 grid grid-cols-3 gap-1.5" style={{ minWidth: 180 }}>
              {filteredTools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => onToolSelect(tool.id)}
                    className={`group flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                        : isDark
                        ? 'hover:bg-white/10 text-slate-300 hover:text-white'
                        : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                    title={tool.description}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                        isActive
                          ? 'bg-white/20'
                          : isDark
                          ? 'bg-white/5 group-hover:bg-white/10'
                          : 'bg-slate-100 group-hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-medium text-center leading-tight">
                      {tool.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Collapsed state - show icons only */}
        {isCollapsed && (
          <div className="p-1.5 flex flex-col gap-1">
            {TOOLS.slice(0, 6).map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => onToolSelect(tool.id)}
                  className={`p-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-purple-500 text-white'
                      : isDark
                      ? 'hover:bg-white/10 text-slate-400 hover:text-white'
                      : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                  }`}
                  title={tool.label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingToolbar;
