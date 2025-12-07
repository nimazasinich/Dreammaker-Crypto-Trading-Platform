/**
 * Design System Constants
 * Centralized design tokens for consistent UI/UX
 */

export const COLORS = {
  // Brand Colors
  primary: {
    DEFAULT: '#8b5cf6', // violet-500
    light: '#a78bfa',   // violet-400
    dark: '#7c3aed',    // violet-600
    darker: '#6d28d9',  // violet-700
    darkest: '#5b21b6', // violet-800
  },
  secondary: {
    DEFAULT: '#0ea5e9', // sky-500
    light: '#38bdf8',   // sky-400
    dark: '#0284c7',    // sky-600
    darker: '#0369a1',  // sky-700
    darkest: '#075985', // sky-800
  },
  accent: {
    DEFAULT: '#14b8a6', // teal-500
    light: '#2dd4bf',   // teal-400
    dark: '#0d9488',    // teal-600
  },

  // Status Colors
  success: {
    DEFAULT: '#22c55e', // green-500
    light: '#4ade80',   // green-400
    dark: '#16a34a',    // green-600
    darker: '#15803d',  // green-700
    darkest: '#166534', // green-800
    bg: 'rgba(34, 197, 94, 0.1)',
    bgDark: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.25)',
    glow: 'rgba(34, 197, 94, 0.3)',
  },
  error: {
    DEFAULT: '#ef4444', // red-500
    light: '#f87171',   // red-400
    dark: '#dc2626',    // red-600
    darker: '#b91c1c',  // red-700
    darkest: '#991b1b', // red-800
    bg: 'rgba(239, 68, 68, 0.1)',
    bgDark: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.25)',
    glow: 'rgba(239, 68, 68, 0.3)',
  },
  warning: {
    DEFAULT: '#f59e0b', // amber-500
    light: '#fbbf24',   // amber-400
    dark: '#d97706',    // amber-600
    bg: 'rgba(245, 158, 11, 0.1)',
    bgDark: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.25)',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  info: {
    DEFAULT: '#3b82f6', // blue-500
    light: '#60a5fa',   // blue-400
    dark: '#2563eb',    // blue-600
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.25)',
    glow: 'rgba(59, 130, 246, 0.3)',
  },

  // Chart Colors
  chart: {
    green: '#10b981',   // emerald-500 (Buy/Long)
    red: '#ef4444',     // red-500 (Sell/Short)
    blue: '#3b82f6',    // blue-500 (Info)
    purple: '#8b5cf6',  // violet-500 (Primary)
    orange: '#f97316',  // orange-500 (Alert)
    yellow: '#eab308',  // yellow-500 (Warning)
    pink: '#ec4899',    // pink-500 (Special)
    teal: '#14b8a6',    // teal-500 (Accent)
  },
};

export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 40%, #6d28d9 80%, #5b21b6 100%)',
  primaryHover: 'linear-gradient(135deg, #9333ea 0%, #8b5cf6 40%, #7c3aed 80%, #6d28d9 100%)',
  secondary: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 40%, #0369a1 80%, #075985 100%)',
  secondaryHover: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 40%, #0284c7 80%, #0369a1 100%)',
  success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 40%, #15803d 80%, #166534 100%)',
  successHover: 'linear-gradient(135deg, #4ade80 0%, #22c55e 40%, #16a34a 80%, #15803d 100%)',
  danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 40%, #b91c1c 80%, #991b1b 100%)',
  dangerHover: 'linear-gradient(135deg, #f87171 0%, #ef4444 40%, #dc2626 80%, #b91c1c 100%)',
  rainbow: 'linear-gradient(90deg, #8b5cf6 0%, #0ea5e9 25%, #14b8a6 50%, #22c55e 75%, #eab308 100%)',
  dark: 'linear-gradient(135deg, rgba(15, 15, 24, 0.95) 0%, rgba(20, 20, 30, 0.95) 100%)',
  darkCard: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(31, 31, 56, 0.8) 50%, rgba(36, 36, 66, 0.8) 100%)',
  lightCard: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 251, 255, 0.9) 50%, rgba(245, 247, 255, 0.9) 100%)',
};

export const SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
  glow: {
    primary: '0 10px 40px rgba(139, 92, 246, 0.6)',
    success: '0 10px 40px rgba(34, 197, 94, 0.6)',
    danger: '0 10px 40px rgba(239, 68, 68, 0.6)',
    warning: '0 10px 40px rgba(245, 158, 11, 0.6)',
  },
};

export const BORDERS = {
  primary: 'rgba(139, 92, 246, 0.25)',
  primaryLight: 'rgba(139, 92, 246, 0.15)',
  success: 'rgba(34, 197, 94, 0.25)',
  error: 'rgba(239, 68, 68, 0.25)',
  warning: 'rgba(245, 158, 11, 0.25)',
  neutral: 'rgba(148, 163, 184, 0.2)',
};

export const BREAKPOINTS = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Tablet landscape / Small desktop
  xl: '1280px',  // Desktop
  '2xl': '1536px', // Large desktop
};

export const SPACING = {
  xs: 'p-2',   // 8px
  sm: 'p-3',   // 12px
  md: 'p-4',   // 16px
  lg: 'p-6',   // 24px
  xl: 'p-8',   // 32px
  '2xl': 'p-12', // 48px
};

export const GAP = {
  xs: 'gap-2',  // 8px
  sm: 'gap-3',  // 12px
  md: 'gap-4',  // 16px
  lg: 'gap-6',  // 24px
  xl: 'gap-8',  // 32px
};

export const BUTTON = {
  base: 'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  primary: 'px-4 py-2 rounded-lg font-medium bg-violet-600 hover:bg-violet-700 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2',
  secondary: 'px-4 py-2 rounded-lg font-medium bg-slate-700 hover:bg-slate-600 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2',
  success: 'px-4 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
  danger: 'px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
  ghost: 'px-4 py-2 rounded-lg font-medium bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-200',
  icon: 'p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-200',
  small: 'px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200',
  large: 'px-6 py-3 text-lg rounded-xl font-medium transition-all duration-200',
};

export const CARD = {
  base: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-md',
  interactive: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer',
  elevated: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl',
  compact: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm',
};

export const INPUT = {
  base: 'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all',
  error: 'w-full px-3 py-2 rounded-lg border-2 border-red-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all',
  success: 'w-full px-3 py-2 rounded-lg border-2 border-green-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all',
};

export const BADGE = {
  default: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200',
  primary: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200',
  success: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  danger: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  warning: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
  info: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
};

// Helper function to get gradient by variant
export const getGradient = (variant: 'primary' | 'secondary' | 'success' | 'danger', hover = false) => {
  const gradients = {
    primary: hover ? GRADIENTS.primaryHover : GRADIENTS.primary,
    secondary: hover ? GRADIENTS.secondaryHover : GRADIENTS.secondary,
    success: hover ? GRADIENTS.successHover : GRADIENTS.success,
    danger: hover ? GRADIENTS.dangerHover : GRADIENTS.danger,
  };
  return gradients[variant];
};

// Helper function to get glow color by variant
export const getGlowColor = (variant: 'primary' | 'success' | 'danger' | 'warning') => {
  const glows = {
    primary: COLORS.primary.DEFAULT,
    success: COLORS.success.glow,
    danger: COLORS.error.glow,
    warning: COLORS.warning.glow,
  };
  return glows[variant];
};
