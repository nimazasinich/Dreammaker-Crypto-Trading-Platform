/**
 * Enhanced Chart Wrapper - Premium Trading Chart Experience
 * Features: Floating toolbars, keyboard shortcuts, gestures, animations
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Minus, Circle, Square, Triangle, Type, Trash2,
  ZoomIn, ZoomOut, Maximize2, Settings, Bell, Clock, Activity,
  BarChart3, Crosshair, Move, Undo2, Redo2, Save, Download,
  Eye, EyeOff, Lock, Unlock, Grid3x3, Layers
} from 'lucide-react';
import AdvancedChart from './AdvancedChart';
import SignalMarkerOverlay from './SignalMarkerOverlay';
import { ExtremePoint } from '../../services/ExtremePointsDetector';

interface EnhancedChartWrapperProps {
  symbol: string;
  theme: 'light' | 'dark';
  width?: string;
  height?: string;
  signals?: ExtremePoint[];
  onSignalClick?: (signal: ExtremePoint) => void;
}

type DrawingTool = 'trendline' | 'horizontal' | 'vertical' | 'rectangle' | 'circle' | 'text' | 'crosshair' | null;
type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W';

const EnhancedChartWrapper: React.FC<EnhancedChartWrapperProps> = ({
  symbol,
  theme = 'light', // FORCE LIGHT THEME
  width = '100%',
  height = '100%',
  signals = [],
  onSignalClick
}) => {
  const [activeTool, setActiveTool] = useState<DrawingTool>(null);
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('1h');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDrawingTools, setShowDrawingTools] = useState(false); // غیرفعال به صورت پیش‌فرض
  const [showQuickActions, setShowQuickActions] = useState(false); // غیرفعال به صورت پیش‌فرض
  const [showInfoBar, setShowInfoBar] = useState(true);
  const [isChartLocked, setIsChartLocked] = useState(true); // به صورت پیش‌فرض قفل است
  const [drawings, setDrawings] = useState<any[]>([]);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent default for our shortcuts
      if (['f', 't', 'c', 'h', 'v', 'r', 'Delete'].includes(e.key) || (e.ctrlKey && ['z', 'y'].includes(e.key))) {
        e.preventDefault();
      }

      if (e.key === 'f') {
        toggleFullscreen();
      } else if (e.key === 't') {
        setActiveTool('trendline');
        showNotification('Trendline tool activated');
      } else if (e.key === 'c') {
        setActiveTool('crosshair');
        showNotification('Crosshair activated');
      } else if (e.key === 'h') {
        setActiveTool('horizontal');
        showNotification('Horizontal line tool activated');
      } else if (e.key === 'v') {
        setActiveTool('vertical');
        showNotification('Vertical line tool activated');
      } else if (e.key === 'r') {
        setActiveTool('rectangle');
        showNotification('Rectangle tool activated');
      } else if (e.key === 'Escape') {
        setActiveTool(null);
        showNotification('Tool deactivated');
      } else if (e.key === 'z' && e.ctrlKey) {
        handleUndo();
      } else if (e.key === 'y' && e.ctrlKey) {
        handleRedo();
      } else if (e.key === 'Delete') {
        handleDeleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [drawings, undoStack]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const showNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 3000);
  };

  const handleUndo = () => {
    if (drawings.length > 0) {
      const lastDrawing = drawings[drawings.length - 1];
      setUndoStack(prev => [...prev, lastDrawing]);
      setDrawings(prev => prev.slice(0, -1));
      showNotification('Undo');
    }
  };

  const handleRedo = () => {
    if (undoStack.length > 0) {
      const lastUndo = undoStack[undoStack.length - 1];
      setDrawings(prev => [...prev, lastUndo]);
      setUndoStack(prev => prev.slice(0, -1));
      showNotification('Redo');
    }
  };

  const handleDeleteSelected = () => {
    showNotification('Delete selected drawing');
  };

  const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1D', '1W'];

  const drawingTools = [
    { id: 'trendline', icon: TrendingUp, label: 'Trendline', key: 'T' },
    { id: 'horizontal', icon: Minus, label: 'Horizontal', key: 'H' },
    { id: 'vertical', icon: Minus, label: 'Vertical', key: 'V', rotate: 90 },
    { id: 'rectangle', icon: Square, label: 'Rectangle', key: 'R' },
    { id: 'circle', icon: Circle, label: 'Circle', key: 'O' },
    { id: 'text', icon: Type, label: 'Text', key: 'A' },
  ];

  const quickActions = [
    { id: 'undo', icon: Undo2, label: 'Undo', action: handleUndo },
    { id: 'redo', icon: Redo2, label: 'Redo', action: handleRedo },
    { id: 'delete', icon: Trash2, label: 'Delete', action: handleDeleteSelected },
    { id: 'save', icon: Save, label: 'Save', action: () => showNotification('Layout saved') },
    { id: 'download', icon: Download, label: 'Export', action: () => showNotification('Exporting chart...') },
  ];

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Glowing Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"
      />

      {/* Top Toolbar - Light Theme */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 border-b"
        style={{
          background: '#ffffff',
          borderColor: '#e2e8f0',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Timeframe Selector - Shifted Forward */}
        <div className="flex items-center gap-2" style={{ marginLeft: '8px' }}>
          {timeframes.map(tf => (
            <motion.button
              key={tf}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTimeframe(tf);
                showNotification(`Timeframe: ${tf}`);
              }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300
                         ${activeTimeframe === tf
                           ? 'text-white shadow-lg'
                           : 'hover:bg-gray-100'
                         }`}
              style={activeTimeframe === tf ? {
                background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              } : {
                background: 'transparent',
                color: '#64748b'
              }}
            >
              {tf}
            </motion.button>
          ))}
        </div>

        {/* Center Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTool('crosshair')}
            className={`p-2 rounded-lg transition-all ${
              activeTool === 'crosshair'
                ? 'text-white shadow-lg'
                : 'hover:bg-gray-100'
            }`}
            style={activeTool === 'crosshair' ? {
              background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
            } : {
              background: 'transparent',
              color: '#64748b'
            }}
          >
            <Crosshair className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg text-white font-semibold shadow-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}
          >
            📊 Indicators
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="p-2 rounded-lg transition-all hover:bg-gray-100"
            style={{ color: '#64748b' }}
          >
            <Maximize2 className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
      {/* Drawing tools toggle removed - now in sidebar */}
          {/* دکمه قفل چارت */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsChartLocked(!isChartLocked);
              showNotification(isChartLocked ? 'Chart unlocked' : 'Chart locked');
            }}
            className="p-2 rounded-lg transition-all"
            style={isChartLocked ? {
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            } : {
              background: 'transparent',
              color: '#64748b',
              border: '1px solid #e2e8f0'
            }}
            title={isChartLocked ? 'Unlock Chart (Enable Zoom & Pan)' : 'Lock Chart (Disable Zoom & Pan)'}
          >
            {isChartLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="p-2 rounded-lg transition-all hover:bg-gray-100"
            style={{ color: '#64748b' }}
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Floating toolbars removed - now in left sidebar */}

      {/* Bottom Info Bar */}
      <AnimatePresence>
        {showInfoBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 z-20 border-t px-6 py-3"
            style={{
              background: '#ffffff',
              borderColor: '#e2e8f0',
              boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span style={{ color: '#64748b' }}>Live</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: '#06b6d4' }} />
                  <span className="font-medium" style={{ color: '#1e293b' }}>{activeTimeframe}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                  <span className="font-medium" style={{ color: '#1e293b' }}>{symbol.split(':')[1]}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: '#64748b' }}>
                <span>Press <kbd className="px-2 py-1 rounded" style={{ background: '#f1f5f9' }}>T</kbd> for Trendline</span>
                <span>Press <kbd className="px-2 py-1 rounded" style={{ background: '#f1f5f9' }}>C</kbd> for Crosshair</span>
                <span>Press <kbd className="px-2 py-1 rounded" style={{ background: '#f1f5f9' }}>F</kbd> for Fullscreen</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <div className="absolute top-24 right-4 z-30 space-y-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notification, i) => (
            <motion.div
              key={i}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="px-4 py-2 rounded-xl shadow-lg font-medium text-sm text-white"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              }}
            >
              {notification}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Chart Container */}
      <div className="relative z-10 w-full h-full">
        <AdvancedChart
          symbol={symbol}
          theme={theme}
          interval={activeTimeframe}
          width={width}
          height={height}
          isLocked={isChartLocked}
        />
        {/* Signal Markers Overlay */}
        {signals.length > 0 && (
          <SignalMarkerOverlay
            signals={signals}
            onSignalClick={onSignalClick}
            chartHeight={typeof height === 'number' ? height : 600}
            chartWidth={typeof width === 'number' ? width : 1200}
          />
        )}
      </div>
    </div>
  );
};

export default EnhancedChartWrapper;
