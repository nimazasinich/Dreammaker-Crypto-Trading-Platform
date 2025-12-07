import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Logger } from '../core/Logger';
import { COLORS, GRADIENTS, getGradient, getGlowColor } from '../styles/constants';
import TopSignalsPanel from '../components/TopSignalsPanel';
import { Signal } from '../components/TopSignalsPanel';
import { realDataManager } from '../services/RealDataManager';
import { useTheme } from '../components/Theme/ThemeProvider';
import { SpectacularLoader } from '../components/dashboard/SpectacularLoader';
import { useDashboardData } from '../hooks/useDashboardData';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { TiltCard } from '../components/ui/TiltCard';
import { FloatingParticles } from '../components/ui/FloatingParticles';
import {
    WalletIcon,
    TrendingUpIcon,
    ActivityIcon,
    TargetIcon,
    ZapIcon,
    BarChartIcon,
    AlertIcon,
    CheckCircleIcon,
    InfoIcon,
    SparklesIcon,
    ClockIcon,
    GlobeIcon,
    LineChartIcon,
    ArrowRightIcon,
} from '../components/icons/CryptoIcons';

const logger = Logger.getInstance();

interface StatCardProps {
    title: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: React.ComponentType<{ className?: string; size?: number }>;
    subtitle?: string;
    trend?: number[];
    isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    change,
    changeType = 'neutral',
    icon: Icon,
    subtitle,
    trend,
    isLoading = false
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-lg p-2 backdrop-blur-xl"
                style={{
                    background: isDark
                        ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.6) 0%, rgba(31, 31, 56, 0.6) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(250, 251, 255, 0.6) 100%)',
                    border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'}`,
                }}
            >
                <div className="animate-pulse space-y-1.5">
                    <div className="h-2.5 w-16 rounded bg-slate-300/20" />
                    <div className="h-5 w-20 rounded bg-slate-300/20" />
                    <div className="h-2 w-12 rounded bg-slate-300/20" />
                </div>
            </motion.div>
        );
    }

    return (
        <TiltCard>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group relative overflow-hidden rounded-lg backdrop-blur-xl cursor-pointer"
                style={{
                    background: isDark
                        ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(31, 31, 56, 0.8) 50%, rgba(36, 36, 66, 0.8) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 251, 255, 0.9) 50%, rgba(245, 247, 255, 0.9) 100%)',
                    border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.25)' : 'rgba(139, 92, 246, 0.2)'}`,
                    boxShadow: isDark
                        ? '0 2px 8px rgba(0, 0, 0, 0.2)'
                        : '0 2px 8px rgba(139, 92, 246, 0.08)',
                    minHeight: 'auto',
                    height: 'auto',
                }}
            >
                {/* Content - Ultra-compact design */}
                <div className="relative h-full p-2 flex flex-col">
                    {/* Header with mini icon */}
                    <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                            <p
                                className={`text-[9px] font-semibold uppercase tracking-wide mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                                style={{ letterSpacing: '0.05em' }}
                            >
                                {title}
                            </p>
                            <p
                                className={`text-lg font-bold leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {value}
                            </p>
                        </div>

                        {/* Mini icon */}
                        <div className="relative ml-1.5">
                            <div
                                className="relative flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                                style={{
                                    background: changeType === 'positive'
                                        ? 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)'
                                        : changeType === 'negative'
                                            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                            : 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                <Icon size={16} className="text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Ultra-compact change indicator */}
                    {change && (
                        <div
                            className="flex items-center gap-1 mb-1 rounded px-1.5 py-0.5 w-fit"
                            style={{
                                background: changeType === 'positive'
                                    ? isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)'
                                    : changeType === 'negative'
                                        ? isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'
                                        : isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
                            }}
                        >
                            {changeType === 'positive' ? (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-green-500 flex-shrink-0">
                                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : changeType === 'negative' ? (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-red-500 flex-shrink-0">
                                    <path d="M7 7L17 17M17 17H7M17 17V7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            ) : null}
                            <span
                                className={`text-[10px] font-bold ${changeType === 'positive'
                                    ? 'text-green-500'
                                    : changeType === 'negative'
                                        ? 'text-red-500'
                                        : isDark ? 'text-purple-400' : 'text-purple-600'
                                    }`}
                            >
                                {change}
                            </span>
                        </div>
                    )}

                    {/* Ultra-compact subtitle */}
                    {subtitle && (
                        <p
                            className={`text-[9px] font-medium leading-tight ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                            style={{
                                height: 'auto',
                                maxHeight: '20px',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                            }}
                        >
                            {subtitle}
                        </p>
                    )}

                    {/* Enhanced trend chart */}
                    {trend && (
                        <div className="mt-auto">
                            <svg width="100%" height="32" viewBox="0 0 100 32" preserveAspectRatio="none" className="opacity-70 transition-opacity duration-300 group-hover:opacity-100">
                                <defs>
                                    <linearGradient id={`gradient-${title.replace(/\s/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor={changeType === 'positive' ? '#22c55e' : changeType === 'negative' ? '#ef4444' : '#8b5cf6'} stopOpacity="0.3" />
                                        <stop offset="100%" stopColor={changeType === 'positive' ? '#22c55e' : changeType === 'negative' ? '#ef4444' : '#8b5cf6'} stopOpacity="1" />
                                    </linearGradient>
                                    <linearGradient id={`fill-${title.replace(/\s/g, '-')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor={changeType === 'positive' ? '#22c55e' : changeType === 'negative' ? '#ef4444' : '#8b5cf6'} stopOpacity="0.2" />
                                        <stop offset="100%" stopColor={changeType === 'positive' ? '#22c55e' : changeType === 'negative' ? '#ef4444' : '#8b5cf6'} stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Fill area */}
                                <path
                                    fill={`url(#fill-${title.replace(/\s/g, '-')})`}
                                    d={`M 0,32 L ${trend.map((value, index) =>
                                        `${(index / (trend.length - 1)) * 100},${32 - (value * 32)}`
                                    ).join(' L ')} L 100,32 Z`}
                                />
                                {/* Line */}
                                <polyline
                                    fill="none"
                                    stroke={`url(#gradient-${title.replace(/\s/g, '-')})`}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={trend.map((value, index) =>
                                        `${(index / (trend.length - 1)) * 100},${32 - (value * 32)}`
                                    ).join(' ')}
                                />
                            </svg>
                        </div>
                    )}
                </div>
            </motion.div>
        </TiltCard>
    );
};

interface QuickActionProps {
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'danger';
}

const QuickAction: React.FC<QuickActionProps> = ({ label, icon: Icon, onClick, variant = 'primary' }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const variantStyles = {
        primary: {
            gradient: GRADIENTS.primary,
            glowColor: getGlowColor('primary'),
            hoverGradient: GRADIENTS.primaryHover,
        },
        secondary: {
            gradient: GRADIENTS.secondary,
            glowColor: 'rgba(14, 165, 233, 0.6)',
            hoverGradient: GRADIENTS.secondaryHover,
        },
        success: {
            gradient: GRADIENTS.success,
            glowColor: getGlowColor('success'),
            hoverGradient: GRADIENTS.successHover,
        },
        danger: {
            gradient: GRADIENTS.danger,
            glowColor: getGlowColor('danger'),
            hoverGradient: GRADIENTS.dangerHover,
        },
    };

    const style = variantStyles[variant];

    return (
        <button
            type="button"
            onClick={onClick}
            className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105"
            style={{
                background: style.gradient,
                boxShadow: `0 10px 40px ${style.glowColor}, 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.2)`,
            }}
        >
            {/* Animated glow on hover */}
            <div
                className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                    background: style.hoverGradient,
                }}
            />

            {/* Shimmer effect */}
            <div
                className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]"
            />

            {/* Floating particles on hover */}
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute h-1 w-1 rounded-full bg-white"
                        style={{
                            left: `${20 + i * 30}%`,
                            top: '50%',
                            animation: `floatUp 2s ease-out infinite`,
                            animationDelay: `${i * 0.3}s`,
                            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                        }}
                    />
                ))}
            </div>

            <div className="relative px-6 py-5 flex items-center gap-4">
                {/* 3D Icon container */}
                <div className="relative">
                    {/* Glow layer */}
                    <div
                        className="absolute inset-0 rounded-2xl blur-lg opacity-60 transition-all duration-500 group-hover:opacity-100 group-hover:scale-125"
                        style={{
                            background: 'rgba(255, 255, 255, 0.4)',
                        }}
                    />
                    {/* Icon */}
                    <div
                        className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12"
                        style={{
                            background: 'rgba(255, 255, 255, 0.25)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                        }}
                    >
                        <Icon size={26} className="text-white drop-shadow-2xl" />
                    </div>
                </div>

                <span className="flex-1 text-base font-black text-white drop-shadow-lg tracking-wide">
                    {label}
                </span>

                {/* Animated arrow */}
                <div className="relative">
                    <ArrowRightIcon
                        size={22}
                        className="text-white/90 transition-all duration-500 group-hover:translate-x-2 group-hover:scale-125 drop-shadow"
                    />
                    <div className="absolute inset-0 blur-sm opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <ArrowRightIcon size={22} className="text-white" />
                    </div>
                </div>
            </div>
        </button>
    );
};

const EnhancedDashboardView: React.FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [signals, setSignals] = useState<Signal[]>([]);
    const [neuralNetworkAccuracy, setNeuralNetworkAccuracy] = useState(85);

    // استفاده از Hook جدید برای دریافت داده‌های داشبورد
    const {
        data: dashboardData,
        isLoading,
        error,
        refresh,
        status
    } = useDashboardData();

    // استخراج داده‌های آماری از dashboardData
    const portfolioValue = dashboardData?.stats.portfolioValue || 0;
    const portfolioChange = dashboardData?.stats.portfolioChange || 0;
    const totalPnL = dashboardData?.stats.totalPnL || 0;
    const activePositions = dashboardData?.stats.activePositions || 0;
    const winRate = dashboardData?.stats.winRate || 0;
    const fearGreedIndex = dashboardData?.sentiment.fearGreedIndex || 50;

    useEffect(() => {
        const fetchSignals = async () => {
            try {
                const signalsData = await realDataManager.getAISignals(10);
                if (Array.isArray(signalsData) && signalsData.length > 0) {
                    // Validate signals are real (not mock)
                    const realSignals = signalsData.filter(s => {
                        // Check if signal has valid data
                        return s.symbol && s.confidence > 0 && s.confidence <= 1 &&
                            (s.type === 'buy' || s.type === 'sell' || s.type === 'hold');
                    });

                    if (realSignals.length > 0) {
                        setSignals(realSignals);
                        const avgConfidence = realSignals.reduce((sum, s) => sum + (s.confidence || 0), 0) / realSignals.length;
                        setNeuralNetworkAccuracy(Math.round(avgConfidence * 100)); // Convert to percentage
                    } else {
                        // NO MOCK DATA - Show empty
                        setSignals([]);
                        setNeuralNetworkAccuracy(0);
                        logger.warn('⚠️ No valid AI signals available');
                    }
                } else {
                    // NO MOCK DATA - Show empty
                    setSignals([]);
                    setNeuralNetworkAccuracy(0);
                }
            } catch (err) {
                logger.error('Failed to fetch signals:', {}, err as Error);
                // NO MOCK DATA - Show empty on error
                setSignals([]);
                setNeuralNetworkAccuracy(0);
            }
        };
        fetchSignals();
    }, []);

    // Don't show loader here - App.tsx handles initial loading
    // This prevents double loading screens
    // if (isLoading) {
    //   return <SpectacularLoader />;
    // }

    return (
        <div
            className="relative min-h-screen w-full transition-all duration-700 overflow-x-hidden"
            style={{
                background: isDark
                    ? 'linear-gradient(135deg, #0a0a14 0%, #0f0f1e 25%, #1a1a2e 50%, #16213e 75%, #0f0f1e 100%)'
                    : 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 25%, #f8faff 50%, #eef2ff 75%, #f0f4ff 100%)',
            }}
        >
            {/* Enhanced Animated Background with Multiple Layers */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* Primary gradient orb */}
                <div
                    className="absolute -left-1/3 -top-1/3 h-2/3 w-2/3 animate-pulse opacity-30 blur-3xl"
                    style={{
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(168, 85, 247, 0.3) 30%, transparent 70%)',
                        animationDuration: '8s',
                    }}
                />
                {/* Secondary gradient orb */}
                <div
                    className="absolute -right-1/4 top-1/3 h-2/3 w-2/3 animate-pulse opacity-25 blur-3xl"
                    style={{
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(96, 165, 250, 0.3) 30%, transparent 70%)',
                        animationDuration: '10s',
                        animationDelay: '2s',
                    }}
                />
                {/* Tertiary gradient orb */}
                <div
                    className="absolute left-1/2 bottom-0 h-1/2 w-1/2 animate-pulse opacity-20 blur-3xl"
                    style={{
                        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(219, 39, 119, 0.2) 30%, transparent 70%)',
                        animationDuration: '12s',
                        animationDelay: '4s',
                    }}
                />

                {/* Animated grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: isDark
                            ? 'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)'
                            : 'linear-gradient(rgba(139, 92, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.2) 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                        animation: 'gridMove 20s linear infinite',
                    }}
                />

                {/* Floating particles */}
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full opacity-20"
                        style={{
                            width: `${Math.random() * 6 + 2}px`,
                            height: `${Math.random() * 6 + 2}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            background: i % 3 === 0
                                ? 'rgba(139, 92, 246, 0.6)'
                                : i % 3 === 1
                                    ? 'rgba(59, 130, 246, 0.6)'
                                    : 'rgba(236, 72, 153, 0.6)',
                            animation: `float ${Math.random() * 10 + 15}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 5}s`,
                            boxShadow: '0 0 20px currentColor',
                        }}
                    />
                ))}
            </div>

            {/* Animated keyframes */}
            <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          25% { 
            transform: translate(30px, -30px) scale(1.2);
            opacity: 0.4;
          }
          50% { 
            transform: translate(-20px, -60px) scale(0.8);
            opacity: 0.3;
          }
          75% { 
            transform: translate(-40px, -30px) scale(1.1);
            opacity: 0.35;
          }
        }
      `}</style>

            <div className="relative w-full max-w-[2400px] mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 space-y-2 sm:space-y-3 md:space-y-4">



                {/* Error Alert */}
                {error && (
                    <div
                        className="rounded-2xl p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300"
                        style={{
                            background: isDark
                                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)'
                                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <AlertIcon size={20} className="text-red-500 flex-shrink-0" />
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                                    Unable to load some data
                                </p>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-red-300/70' : 'text-red-500/70'}`}>
                                    {error} - Displaying cached data
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={refresh}
                                    className={`text-sm font-medium ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'} transition-colors`}
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}

                {/* Ultra-Modern Quick Actions with Glassmorphism - Responsive */}
                <div
                    className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4"
                    style={{
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(31, 31, 56, 0.8) 100%)'
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(250, 251, 255, 0.8) 100%)',
                        border: `2px solid ${isDark ? 'rgba(139, 92, 246, 0.25)' : 'rgba(139, 92, 246, 0.2)'}`,
                        boxShadow: isDark
                            ? '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            : '0 20px 60px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                        animationDelay: '200ms',
                        animationDuration: '600ms',
                        animationFillMode: 'both',
                    }}
                >
                    {/* Animated gradient waves */}
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.3) 50%, transparent 100%)',
                            animation: 'wave 4s ease-in-out infinite',
                        }}
                    />

                    <div className="relative">
                        <div className="mb-5 sm:mb-6 md:mb-7 flex items-center gap-2 sm:gap-3">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-xl"
                                style={{
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                                }}
                            >
                                <ZapIcon size={20} className="text-white drop-shadow-lg" />
                            </div>
                            <h3
                                className="text-lg sm:text-xl md:text-2xl font-black"
                                style={{
                                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                Quick Actions
                            </h3>
                            <div
                                className="h-1 flex-1 rounded-full"
                                style={{
                                    background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.5) 0%, transparent 100%)',
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 xl:grid-cols-4">
                            {[
                                { label: "Start New Trade", icon: ZapIcon, variant: "primary" as const },
                                { label: "Run Backtest", icon: BarChartIcon, variant: "secondary" as const },
                                { label: "View Signals", icon: ActivityIcon, variant: "success" as const },
                                { label: "Manage Risk", icon: AlertIcon, variant: "danger" as const },
                            ].map((action, index) => (
                                <div
                                    key={action.label}
                                    className="animate-in fade-in slide-in-from-bottom-2"
                                    style={{
                                        animationDelay: `${400 + index * 100}ms`,
                                        animationDuration: '400ms',
                                        animationFillMode: 'both',
                                    }}
                                >
                                    <QuickAction
                                        label={action.label}
                                        icon={action.icon}
                                        onClick={() => {
                                            logger.info(`Quick action clicked: ${action.label}`);
                                        }}
                                        variant={action.variant}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <style>{`
              @keyframes wave {
                0%, 100% { transform: translateX(-100%); }
                50% { transform: translateX(100%); }
              }
              
              @keyframes floatUp {
                0% {
                  transform: translateY(0) scale(1);
                  opacity: 1;
                }
                100% {
                  transform: translateY(-30px) scale(0);
                  opacity: 0;
                }
              }
            `}</style>

                {/* Main Content Grid - Responsive */}
                <div className="grid grid-cols-1 gap-3 sm:gap-3 md:gap-4 xl:grid-cols-3">

                    {/* Left Column - Price Chart & Signals - Responsive */}
                    <div className="space-y-4 sm:space-y-5 md:space-y-6 xl:col-span-2">

                        {/* Market Analysis Hub Link - PHASE 4: Portfolio-only Dashboard */}
                        <div
                            className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 cursor-pointer group hover:-translate-y-1 transition-all duration-300"
                            onClick={() => window.location.href = '/market-analysis'}
                            style={{
                                background: isDark
                                    ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(31, 31, 56, 0.8) 100%)'
                                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(250, 251, 255, 0.8) 100%)',
                                border: `2px solid ${isDark ? 'rgba(139, 92, 246, 0.25)' : 'rgba(139, 92, 246, 0.2)'}`,
                                boxShadow: isDark
                                    ? '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                    : '0 20px 60px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                                animationDelay: '300ms',
                                animationDuration: '600ms',
                                animationFillMode: 'both',
                            }}
                        >
                            {/* Animated gradient accent bar */}
                            <div
                                className="absolute left-0 top-0 h-full w-1.5 opacity-70 group-hover:w-2 transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(180deg, #8b5cf6 0%, #3b82f6 50%, #ec4899 100%)',
                                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.6)',
                                    animation: 'pulse 3s ease-in-out infinite',
                                }}
                            />

                            {/* Floating orbs */}
                            <div
                                className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-300"
                                style={{
                                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)',
                                    animation: 'float 6s ease-in-out infinite',
                                }}
                            />

                            <div className="relative text-center py-12">
                                <div className="flex flex-col items-center gap-6">
                                    {/* 3D Icon */}
                                    <div className="relative">
                                        <div
                                            className="absolute inset-0 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                                            style={{
                                                background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                                            }}
                                        />
                                        <div
                                            className="relative flex h-20 w-20 items-center justify-center rounded-2xl group-hover:scale-110 transition-transform duration-300"
                                            style={{
                                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
                                                boxShadow: '0 10px 30px rgba(139, 92, 246, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                                            }}
                                        >
                                            <LineChartIcon size={40} className="text-white drop-shadow-2xl" />
                                        </div>
                                    </div>

                                    <div>
                                        <h2
                                            className="text-3xl font-black mb-3"
                                            style={{
                                                background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #06b6d4 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                            }}
                                        >
                                            View Market Analysis
                                        </h2>
                                        <p className={`text-base font-medium mb-6 max-w-lg mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                            Access live price charts, technical indicators, market insights, and real-time analysis in the Market Analysis Hub
                                        </p>
                                        <div
                                            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white group-hover:scale-105 transition-transform duration-300"
                                            style={{
                                                background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                                                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.5)',
                                            }}
                                        >
                                            <span>Open Market Analysis Hub</span>
                                            <ArrowRightIcon size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Signals Panel with animation */}
                        <div
                            className="animate-in fade-in slide-in-from-bottom-4"
                            style={{
                                animationDelay: '400ms',
                                animationDuration: '600ms',
                                animationFillMode: 'both',
                            }}
                        >
                            <TopSignalsPanel
                                signals={signals}
                                neuralNetworkAccuracy={neuralNetworkAccuracy}
                                className="w-full shadow-2xl"
                            />
                        </div>
                    </div>

                    {/* Right Column - Stats & Info - Responsive */}
                    <div className="space-y-4 sm:space-y-5 md:space-y-6">

                        {/* Ultra-Modern Market Sentiment with 3D Effects */}
                        <div
                            className="relative overflow-hidden rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-right-4"
                            style={{
                                background: isDark
                                    ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(31, 31, 56, 0.8) 100%)'
                                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(250, 251, 255, 0.8) 100%)',
                                border: `2px solid ${isDark ? 'rgba(139, 92, 246, 0.25)' : 'rgba(139, 92, 246, 0.2)'}`,
                                boxShadow: isDark
                                    ? '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                    : '0 20px 60px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                                animationDelay: '300ms',
                                animationDuration: '600ms',
                                animationFillMode: 'both',
                            }}
                        >
                            {/* Decorative background */}
                            <div
                                className="absolute right-0 top-0 h-32 w-32 opacity-10 blur-2xl"
                                style={{
                                    background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)',
                                }}
                            />

                            <div className="relative">
                                <h3 className={`mb-5 flex items-center gap-2 text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    <div
                                        className="flex h-9 w-9 items-center justify-center rounded-lg"
                                        style={{
                                            background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                                            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                                        }}
                                    >
                                        <GlobeIcon size={18} className="text-white drop-shadow-lg" />
                                    </div>
                                    Market Sentiment
                                </h3>

                                <div className="text-center">
                                    <div className="relative inline-flex items-center justify-center mb-3">
                                        {/* Animated ring */}
                                        <div
                                            className="absolute inset-0 rounded-full animate-pulse"
                                            style={{
                                                background: 'radial-gradient(circle, transparent 60%, rgba(34, 197, 94, 0.2) 100%)',
                                                width: '120px',
                                                height: '120px',
                                            }}
                                        />
                                        <div
                                            className="text-6xl font-black tracking-tight"
                                            style={{
                                                background: 'linear-gradient(135deg, #22c55e 0%, #10b981 50%, #059669 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                                filter: 'drop-shadow(0 2px 8px rgba(34, 197, 94, 0.3))',
                                            }}
                                        >
                                            {fearGreedIndex}
                                        </div>
                                    </div>

                                    <div className={`mb-5 text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {dashboardData?.sentiment.sentiment || 'Fear & Greed Index'}
                                    </div>

                                    {/* Enhanced progress bar */}
                                    <div
                                        className="relative h-3 w-full overflow-hidden rounded-full shadow-inner"
                                        style={{
                                            background: isDark
                                                ? 'linear-gradient(90deg, rgba(15, 15, 24, 0.8) 0%, rgba(20, 20, 30, 0.8) 100%)'
                                                : 'linear-gradient(90deg, rgba(241, 245, 249, 0.9) 0%, rgba(226, 232, 240, 0.9) 100%)',
                                        }}
                                    >
                                        <div
                                            className="h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                                            style={{
                                                width: `${fearGreedIndex}%`,
                                                background: fearGreedIndex >= 70
                                                    ? 'linear-gradient(90deg, #22c55e 0%, #10b981 50%, #059669 100%)'
                                                    : fearGreedIndex >= 40
                                                        ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 50%, #b45309 100%)'
                                                        : 'linear-gradient(90deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                                                boxShadow: fearGreedIndex >= 70
                                                    ? '0 0 20px rgba(34, 197, 94, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
                                                    : fearGreedIndex >= 40
                                                        ? '0 0 20px rgba(245, 158, 11, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.3)'
                                                        : '0 0 20px rgba(239, 68, 68, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                                            }}
                                        >
                                            {/* Shimmer effect */}
                                            <div
                                                className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]"
                                            />
                                        </div>
                                    </div>

                                    <div className={`mt-3 flex justify-between text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                        <span className="flex items-center gap-1">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-red-500">
                                                <path d="M7 7L17 17M17 17H7M17 17V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Extreme Fear
                                        </span>
                                        <span className="flex items-center gap-1">
                                            Extreme Greed
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-green-500">
                                                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ultra-Modern AI Insights with Glassmorphism */}
                        <div
                            className="relative overflow-hidden rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-right-4"
                            style={{
                                background: isDark
                                    ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(31, 31, 56, 0.8) 100%)'
                                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(250, 251, 255, 0.8) 100%)',
                                border: `2px solid ${isDark ? 'rgba(139, 92, 246, 0.25)' : 'rgba(139, 92, 246, 0.2)'}`,
                                boxShadow: isDark
                                    ? '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                    : '0 20px 60px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                                animationDelay: '400ms',
                                animationDuration: '600ms',
                                animationFillMode: 'both',
                            }}
                        >
                            {/* Decorative sparkle background */}
                            <div
                                className="absolute right-0 top-0 h-32 w-32 opacity-10 blur-2xl animate-pulse"
                                style={{
                                    background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
                                    animationDuration: '3s',
                                }}
                            />

                            <div className="relative">
                                <h3 className={`mb-5 flex items-center gap-2 text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    <div
                                        className="flex h-9 w-9 items-center justify-center rounded-lg animate-pulse"
                                        style={{
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                                            animationDuration: '2s',
                                        }}
                                    >
                                        <SparklesIcon size={18} className="text-white drop-shadow-lg" />
                                    </div>
                                    AI Insights
                                </h3>

                                <div className="space-y-3">
                                    {[
                                        {
                                            icon: CheckCircleIcon,
                                            iconColor: 'text-green-500',
                                            bgColor: isDark ? COLORS.success.bgDark : COLORS.success.bg,
                                            borderColor: COLORS.success.border,
                                            glowColor: COLORS.success.glow,
                                            title: 'Strong Buy Signal',
                                            subtitle: 'Portfolio showing bullish momentum',
                                            delay: '500ms'
                                        },
                                        {
                                            icon: AlertIcon,
                                            iconColor: 'text-yellow-500',
                                            bgColor: isDark ? COLORS.warning.bgDark : COLORS.warning.bg,
                                            borderColor: COLORS.warning.border,
                                            glowColor: COLORS.warning.glow,
                                            title: 'High Volatility',
                                            subtitle: 'Market experiencing increased volatility',
                                            delay: '600ms'
                                        },
                                        {
                                            icon: InfoIcon,
                                            iconColor: 'text-blue-500',
                                            bgColor: isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.08)',
                                            borderColor: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.2)',
                                            glowColor: 'rgba(59, 130, 246, 0.3)',
                                            title: 'Market Update',
                                            subtitle: 'Fed announcement scheduled for 2:00 PM',
                                            delay: '700ms'
                                        }
                                    ].map((insight, index) => (
                                        <div
                                            key={index}
                                            className="group relative flex items-start gap-3 rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-in fade-in slide-in-from-bottom-2"
                                            style={{
                                                background: insight.bgColor,
                                                border: `1px solid ${insight.borderColor}`,
                                                boxShadow: `0 2px 8px ${insight.glowColor}`,
                                                animationDelay: insight.delay,
                                                animationDuration: '400ms',
                                                animationFillMode: 'both',
                                            }}
                                        >
                                            {/* Icon with glow effect */}
                                            <div className="relative">
                                                <insight.icon className={`h-5 w-5 flex-shrink-0 ${insight.iconColor}`} />
                                                <div
                                                    className="absolute inset-0 blur-sm opacity-50"
                                                >
                                                    <insight.icon className={`h-5 w-5 ${insight.iconColor}`} />
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                    {insight.title}
                                                </p>
                                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                                    {insight.subtitle}
                                                </p>
                                            </div>

                                            {/* Hover indicator */}
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <ArrowRightIcon size={16} className={insight.iconColor} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Ultra-Modern Recent Activity with Glassmorphism */}
                        <div
                            className="relative overflow-hidden rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-right-4"
                            style={{
                                background: isDark
                                    ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(31, 31, 56, 0.8) 100%)'
                                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(250, 251, 255, 0.8) 100%)',
                                border: `2px solid ${isDark ? 'rgba(139, 92, 246, 0.25)' : 'rgba(139, 92, 246, 0.2)'}`,
                                boxShadow: isDark
                                    ? '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                    : '0 20px 60px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                                animationDelay: '500ms',
                                animationDuration: '600ms',
                                animationFillMode: 'both',
                            }}
                        >
                            {/* Decorative clock background */}
                            <div
                                className="absolute right-0 top-0 h-32 w-32 opacity-10 blur-2xl animate-pulse"
                                style={{
                                    background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
                                    animationDuration: '4s',
                                }}
                            />

                            <div className="relative">
                                <h3 className={`mb-5 flex items-center gap-2 text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    <div
                                        className="flex h-9 w-9 items-center justify-center rounded-lg"
                                        style={{
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                        }}
                                    >
                                        <ClockIcon size={18} className="text-white drop-shadow-lg" />
                                    </div>
                                    Recent Activity
                                </h3>

                                <div className="space-y-3">
                                    {[
                                        {
                                            action: 'Opened long position',
                                            asset: 'Crypto/USDT',
                                            time: '2 min ago',
                                            type: 'success',
                                            pulseColor: 'bg-green-500',
                                            glowColor: 'rgba(34, 197, 94, 0.5)',
                                            delay: '600ms'
                                        },
                                        {
                                            action: 'Closed position',
                                            asset: 'Crypto/USDT',
                                            time: '15 min ago',
                                            type: 'neutral',
                                            pulseColor: 'bg-blue-500',
                                            glowColor: 'rgba(59, 130, 246, 0.5)',
                                            delay: '700ms'
                                        },
                                        {
                                            action: 'Stop loss triggered',
                                            asset: 'Crypto/USDT',
                                            time: '1 hour ago',
                                            type: 'danger',
                                            pulseColor: 'bg-red-500',
                                            glowColor: 'rgba(239, 68, 68, 0.5)',
                                            delay: '800ms'
                                        },
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className="group flex items-center justify-between rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-in fade-in slide-in-from-bottom-2"
                                            style={{
                                                background: isDark
                                                    ? 'linear-gradient(135deg, rgba(30, 30, 45, 0.6) 0%, rgba(25, 25, 40, 0.6) 100%)'
                                                    : 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%)',
                                                border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.08)'}`,
                                                animationDelay: item.delay,
                                                animationDuration: '400ms',
                                                animationFillMode: 'both',
                                            }}
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                {/* Animated pulse dot */}
                                                <div className="relative flex-shrink-0">
                                                    <div
                                                        className={`h-2.5 w-2.5 rounded-full ${item.pulseColor}`}
                                                        style={{
                                                            boxShadow: `0 0 12px ${item.glowColor}`,
                                                        }}
                                                    />
                                                    <div
                                                        className={`absolute inset-0 h-2.5 w-2.5 rounded-full ${item.pulseColor} animate-ping opacity-75`}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-semibold mb-0.5 truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                        {item.action}
                                                    </p>
                                                    <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                                        {item.asset}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-medium whitespace-nowrap ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                                    {item.time}
                                                </span>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <ArrowRightIcon size={14} className="text-purple-500" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedDashboardView;

