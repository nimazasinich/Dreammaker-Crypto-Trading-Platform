import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Layers, Bell, Target, TrendingUp, Activity, BarChart3, LineChart, Waves, Gauge, Volume2, Zap, TrendingDown, Minus, Circle } from 'lucide-react';
import { DockablePanel, DockablePanelProps } from './DockablePanel';

interface Indicator {
    id: string;
    name: string;
    shortName: string; // نام خلاصه برای نمایش
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

interface DockableSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    panels: Array<DockablePanelProps & { id: string }>;
    className?: string;
    onPanelClick?: (panelId: string) => void; // برای باز کردن پنل خاص وقتی سایدبار بسته است
    onIndicatorClick?: (indicatorId: string) => void; // برای کلیک روی اندیکاتور
}

// اندیکاتورهای کاربردی - با رنگ‌های درخشان و جذاب
const INDICATORS: Indicator[] = [
    { id: 'rsi', name: 'RSI', shortName: 'RSI', icon: Activity, color: '#a855f7' }, // بنفش درخشان
    { id: 'macd', name: 'MACD', shortName: 'MACD', icon: BarChart3, color: '#0ea5e9' }, // آبی درخشان
    { id: 'bollinger', name: 'Bollinger Bands', shortName: 'BB', icon: LineChart, color: '#10b981' }, // سبز درخشان
    { id: 'sma', name: 'Moving Averages', shortName: 'MA', icon: TrendingUp, color: '#f59e0b' }, // نارنجی درخشان
    { id: 'stochastic', name: 'Stochastic', shortName: 'STO', icon: Waves, color: '#ec4899' }, // صورتی درخشان
    { id: 'atr', name: 'ATR', shortName: 'ATR', icon: Gauge, color: '#6366f1' }, // ایندیگو درخشان
    { id: 'volume', name: 'Volume', shortName: 'VOL', icon: Volume2, color: '#14b8a6' }, // تورکویز درخشان
    { id: 'fibonacci', name: 'Fibonacci', shortName: 'FIB', icon: Circle, color: '#f97316' }, // نارنجی-قرمز درخشان
];

export const DockableSidebar: React.FC<DockableSidebarProps> = ({
    isOpen,
    onToggle,
    panels,
    className = '',
    onPanelClick,
    onIndicatorClick,
}) => {
    // Light theme colors
    const lightColors = {
        bg: '#ffffff',
        surface: '#f8fafc',
        border: '#e2e8f0',
        text: '#1e293b',
        textSecondary: '#64748b',
        accent: '#8b5cf6',
        accentLight: '#a78bfa',
        hover: '#f1f5f9',
        shadow: 'rgba(139, 92, 246, 0.1)',
    };

    const handleIconClick = (panelId: string) => {
        // اگر سایدبار بسته است، آن را باز کن
        if (!isOpen) {
            onToggle();
        }
        // پنل خاص را باز کن
        onPanelClick?.(panelId);
    };

    return (
        <>
            {/* Collapsed Sidebar with Icons - وقتی بسته است */}
            {!isOpen && (
                <motion.aside
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 64, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={`relative z-20 flex flex-col items-center py-3 ${className}`}
                    style={{
                        width: '64px',
                        minWidth: '64px',
                        height: '100vh', // تا پایین کشیده شود
                        background: `linear-gradient(180deg, ${lightColors.bg} 0%, ${lightColors.surface} 100%)`,
                        borderRight: `2px solid ${lightColors.border}`,
                        boxShadow: `4px 0 24px ${lightColors.shadow}, inset -1px 0 0 ${lightColors.border}`,
                    }}
                >
                    {/* Icon Buttons */}
                    <div className="flex flex-col items-center gap-4 w-full px-3 pt-4 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                        {/* Panels - فقط 4 پنل اصلی */}
                        {panels.slice(0, 4).map((panel, index) => {
                            const Icon = panel.icon;
                            if (!Icon) return null;

                            // رنگ‌های مختلف برای هر آیکون
                            const iconColors = [
                                { bg: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', hover: '#8b5cf6' }, // بنفش - Strategies
                                { bg: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', hover: '#06b6d4' }, // آبی - Signals
                                { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', hover: '#10b981' }, // سبز - Drawing Tools
                                { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', hover: '#f59e0b' }, // نارنجی - Quick Actions
                                { bg: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)', hover: '#ec4899' }, // صورتی - Indicators
                                { bg: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', hover: '#6366f1' }, // ایندیگو - Market Data
                                { bg: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', hover: '#ef4444' }, // قرمز - Alerts
                                { bg: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)', hover: '#14b8a6' }, // تورکویز - Portfolio
                                { bg: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', hover: '#8b5cf6' }, // بنفش - Risk Management
                                { bg: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)', hover: '#64748b' }, // خاکستری - Settings
                            ];
                            const colorScheme = iconColors[index % iconColors.length];

                            return (
                                <motion.button
                                    key={panel.id}
                                    onClick={() => handleIconClick(panel.id)}
                                    whileHover={{ scale: 1.1, y: -1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group relative w-9 h-9 rounded-xl transition-all duration-300 flex items-center justify-center"
                                    style={{
                                        background: colorScheme.bg,
                                        boxShadow: `
                                            0 2px 12px ${lightColors.shadow},
                                            0 0 0 1px ${colorScheme.hover}30,
                                            inset 0 1px 2px rgba(255, 255, 255, 0.3),
                                            inset 0 -1px 1px rgba(0, 0, 0, 0.1)
                                        `,
                                        padding: '6px',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = `
                                            0 6px 20px ${colorScheme.hover}60,
                                            0 0 0 2px ${colorScheme.hover}50,
                                            inset 0 1px 3px rgba(255, 255, 255, 0.4),
                                            inset 0 -1px 2px rgba(0, 0, 0, 0.15),
                                            0 0 20px ${colorScheme.hover}30
                                        `;
                                        e.currentTarget.style.transform = 'translateY(-1px) scale(1.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = `
                                            0 2px 12px ${lightColors.shadow},
                                            0 0 0 1px ${colorScheme.hover}30,
                                            inset 0 1px 2px rgba(255, 255, 255, 0.3),
                                            inset 0 -1px 1px rgba(0, 0, 0, 0.1)
                                        `;
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    }}
                                    title={panel.title}
                                >
                                    {/* Glow effect */}
                                    <motion.div
                                        animate={{
                                            opacity: [0.3, 0.5, 0.3],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 rounded-lg"
                                        style={{
                                            background: `radial-gradient(circle, ${colorScheme.hover}40 0%, transparent 70%)`,
                                            filter: 'blur(3px)',
                                        }}
                                    />

                                    <div className="relative z-10" style={{
                                        filter: `
                                            drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))
                                            drop-shadow(0 0 8px ${colorScheme.hover}60)
                                            brightness(1.15)
                                            contrast(1.3)
                                        `,
                                    }}>
                                        <Icon className="w-3.5 h-3.5 text-white" />
                                    </div>

                                    {/* Tooltip */}
                                    <div
                                        className="absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
                                        style={{
                                            background: `linear-gradient(135deg, ${lightColors.text} 0%, ${lightColors.textSecondary} 100%)`,
                                            boxShadow: `0 4px 12px ${lightColors.shadow}`,
                                        }}
                                    >
                                        {panel.title}
                                        <div
                                            className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent"
                                            style={{
                                                borderRightColor: lightColors.text,
                                            }}
                                        />
                                    </div>
                                </motion.button>
                            );
                        })}

                        {/* Separator */}
                        <div className="w-10 h-px my-3" style={{ background: lightColors.border }} />

                        {/* Indicators Section - شیک و فشرده */}
                        <div className="w-full">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-center mb-3 px-1" style={{ color: lightColors.textSecondary, letterSpacing: '0.1em' }}>
                                Indicators
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                {INDICATORS.map((indicator, idx) => {
                                    const IndicatorIcon = indicator.icon;
                                    return (
                                        <motion.button
                                            key={indicator.id}
                                            onClick={() => {
                                                if (!isOpen) {
                                                    onToggle();
                                                }
                                                onIndicatorClick?.(indicator.id);
                                            }}
                                            whileHover={{ scale: 1.08, y: -1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="group relative w-8 h-8 rounded-lg transition-all duration-300 flex flex-col items-center justify-center"
                                            style={{
                                                background: `linear-gradient(135deg, ${indicator.color} 0%, ${indicator.color}ff 50%, ${indicator.color}dd 100%)`,
                                                boxShadow: `
                                                    0 2px 12px ${indicator.color}40,
                                                    0 0 0 1px ${indicator.color}30,
                                                    inset 0 1px 2px rgba(255, 255, 255, 0.3),
                                                    inset 0 -1px 1px rgba(0, 0, 0, 0.1)
                                                `,
                                                padding: '5px 4px',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.boxShadow = `
                                                    0 6px 20px ${indicator.color}60,
                                                    0 0 0 2px ${indicator.color}50,
                                                    inset 0 1px 3px rgba(255, 255, 255, 0.4),
                                                    inset 0 -1px 2px rgba(0, 0, 0, 0.15),
                                                    0 0 20px ${indicator.color}30
                                                `;
                                                e.currentTarget.style.transform = 'translateY(-1px) scale(1.05)';
                                                e.currentTarget.style.background = `linear-gradient(135deg, ${indicator.color} 0%, ${indicator.color}ff 60%, ${indicator.color}ee 100%)`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = `
                                                    0 2px 12px ${indicator.color}40,
                                                    0 0 0 1px ${indicator.color}30,
                                                    inset 0 1px 2px rgba(255, 255, 255, 0.3),
                                                    inset 0 -1px 1px rgba(0, 0, 0, 0.1)
                                                `;
                                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                                e.currentTarget.style.background = `linear-gradient(135deg, ${indicator.color} 0%, ${indicator.color}ff 50%, ${indicator.color}dd 100%)`;
                                            }}
                                            title={indicator.name}
                                        >
                                            {/* Enhanced glow effect - درخشندگی بیشتر */}
                                            <motion.div
                                                animate={{
                                                    opacity: [0.3, 0.6, 0.3],
                                                    scale: [1, 1.1, 1],
                                                }}
                                                transition={{ duration: 2.5, repeat: Infinity }}
                                                className="absolute inset-0 rounded-lg"
                                                style={{
                                                    background: `radial-gradient(circle, ${indicator.color}50 0%, ${indicator.color}30 40%, transparent 70%)`,
                                                    filter: 'blur(3px)',
                                                }}
                                            />

                                            {/* Additional outer glow */}
                                            <motion.div
                                                animate={{
                                                    opacity: [0.15, 0.3, 0.15],
                                                }}
                                                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                                                className="absolute -inset-1 rounded-lg"
                                                style={{
                                                    background: `radial-gradient(circle, ${indicator.color}40 0%, transparent 60%)`,
                                                    filter: 'blur(4px)',
                                                    zIndex: -1,
                                                }}
                                            />

                                            <div className="relative z-10 mb-0.5" style={{
                                                filter: `
                                                    drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))
                                                    drop-shadow(0 0 8px ${indicator.color}80)
                                                    brightness(1.15)
                                                    contrast(1.3)
                                                `,
                                            }}>
                                                <IndicatorIcon className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-[8px] font-extrabold text-white leading-tight relative z-10" style={{
                                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.7), 0 0 2px rgba(0, 0, 0, 0.5), 0 1px 1px rgba(255, 255, 255, 0.1)',
                                                letterSpacing: '0.05em',
                                                WebkitTextStroke: '0.3px rgba(0, 0, 0, 0.3)',
                                                fontWeight: 900,
                                            }}>
                                                {indicator.shortName}
                                            </span>

                                            {/* Tooltip */}
                                            <div
                                                className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50"
                                                style={{
                                                    background: `linear-gradient(135deg, ${lightColors.text} 0%, ${lightColors.textSecondary} 100%)`,
                                                    boxShadow: `0 4px 12px ${lightColors.shadow}`,
                                                }}
                                            >
                                                {indicator.name}
                                                <div
                                                    className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-3 border-b-3 border-r-3 border-transparent"
                                                    style={{
                                                        borderRightColor: lightColors.text,
                                                    }}
                                                />
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Expand Button */}
                    <motion.button
                        onClick={onToggle}
                        whileHover={{ scale: 1.1, rotate: -180 }}
                        whileTap={{ scale: 0.9 }}
                        className="mt-auto mb-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{
                            background: lightColors.surface,
                            border: `1px solid ${lightColors.border}`,
                            color: lightColors.textSecondary,
                            boxShadow: `0 2px 4px ${lightColors.shadow}`,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = `linear-gradient(135deg, ${lightColors.hover} 0%, ${lightColors.surface} 100%)`;
                            e.currentTarget.style.color = lightColors.accent;
                            e.currentTarget.style.borderColor = lightColors.accent + '40';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = lightColors.surface;
                            e.currentTarget.style.color = lightColors.textSecondary;
                            e.currentTarget.style.borderColor = lightColors.border;
                        }}
                        title="Expand Sidebar"
                    >
                        <ChevronRight className="w-3.5 h-3.5" style={{ strokeWidth: 2.5 }} />
                    </motion.button>
                </motion.aside>
            )}

            {/* Expanded Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        initial={{ x: -320, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -320, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className={`relative z-20 flex flex-col ${className}`}
                        style={{
                            width: '320px',
                            minWidth: '320px',
                            background: lightColors.bg,
                            borderRight: `2px solid ${lightColors.border}`, // افزایش ضخامت border
                            boxShadow: `4px 0 24px ${lightColors.shadow}, inset -1px 0 0 ${lightColors.border}`,
                        }}
                    >
                        {/* Enhanced Header with Gradient and Shadow */}
                        <div
                            className="flex items-center justify-between px-5 py-5 border-b relative overflow-hidden"
                            style={{
                                background: `linear-gradient(135deg, ${lightColors.surface} 0%, ${lightColors.bg} 50%, ${lightColors.surface} 100%)`,
                                borderColor: lightColors.border,
                                boxShadow: `0 2px 8px ${lightColors.shadow}`,
                            }}
                        >
                            {/* Decorative gradient overlay */}
                            <div
                                className="absolute inset-0 opacity-50"
                                style={{
                                    background: `radial-gradient(circle at top left, ${lightColors.accent}15 0%, transparent 50%)`,
                                }}
                            />

                            <div className="flex items-center gap-3 relative z-10">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="p-2.5 rounded-xl shadow-lg"
                                    style={{
                                        background: `linear-gradient(135deg, ${lightColors.accent} 0%, ${lightColors.accentLight} 100%)`,
                                        boxShadow: `0 4px 16px ${lightColors.shadow}`,
                                    }}
                                >
                                    <Layers className="w-5 h-5 text-white" />
                                </motion.div>
                                <div>
                                    <h2
                                        className="font-black text-lg mb-0.5"
                                        style={{
                                            color: lightColors.text,
                                            textShadow: `0 1px 2px ${lightColors.shadow}`,
                                        }}
                                    >
                                        Panels
                                    </h2>
                                    <p
                                        className="text-xs font-medium"
                                        style={{
                                            color: lightColors.textSecondary,
                                            letterSpacing: '0.05em',
                                        }}
                                    >
                                        Dock & organize
                                    </p>
                                </div>
                            </div>
                            <motion.button
                                onClick={onToggle}
                                whileHover={{ scale: 1.15, rotate: 180 }}
                                whileTap={{ scale: 0.85 }}
                                className="p-2.5 rounded-xl transition-all relative z-10"
                                style={{
                                    background: lightColors.surface,
                                    border: `1px solid ${lightColors.border}`,
                                    color: lightColors.textSecondary,
                                    boxShadow: `0 2px 4px ${lightColors.shadow}`,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = `linear-gradient(135deg, ${lightColors.hover} 0%, ${lightColors.surface} 100%)`;
                                    e.currentTarget.style.color = lightColors.accent;
                                    e.currentTarget.style.borderColor = lightColors.accent + '40';
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${lightColors.shadow}`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = lightColors.surface;
                                    e.currentTarget.style.color = lightColors.textSecondary;
                                    e.currentTarget.style.borderColor = lightColors.border;
                                    e.currentTarget.style.boxShadow = `0 2px 4px ${lightColors.shadow}`;
                                }}
                                title="Collapse Sidebar"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </motion.button>
                        </div>

                        {/* Enhanced Panels Container with Gradient Background */}
                        <div
                            className="flex-1 overflow-y-auto px-5 py-5 space-y-3 relative"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: `${lightColors.accent}40 ${lightColors.surface}`,
                                background: `linear-gradient(180deg, ${lightColors.bg} 0%, ${lightColors.surface} 100%)`,
                            }}
                        >
                            {/* Subtle pattern overlay */}
                            <div
                                className="absolute inset-0 opacity-30 pointer-events-none"
                                style={{
                                    backgroundImage: `
                    linear-gradient(${lightColors.accent}08 1px, transparent 1px),
                    linear-gradient(90deg, ${lightColors.accent}08 1px, transparent 1px)
                  `,
                                    backgroundSize: '20px 20px',
                                }}
                            />
                            <style>{`
                .dockable-sidebar::-webkit-scrollbar {
                  width: 6px;
                }
                .dockable-sidebar::-webkit-scrollbar-track {
                  background: ${lightColors.surface};
                }
                .dockable-sidebar::-webkit-scrollbar-thumb {
                  background: ${lightColors.accent}40;
                  border-radius: 3px;
                }
                .dockable-sidebar::-webkit-scrollbar-thumb:hover {
                  background: ${lightColors.accent}60;
                }
              `}</style>
                            <div className="dockable-sidebar relative z-10">
                                {panels.map((panel) => (
                                    <DockablePanel key={panel.id} {...panel} />
                                ))}
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* دکمه مینیاتوری حذف شد - حالا در header قرار دارد */}
        </>
    );
};

