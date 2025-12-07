/**
 * Comprehensive Design System & Theme Configuration
 * 
 * This file defines the complete design system including:
 * - Color palette (primary, secondary, accent, semantic colors)
 * - Typography (font sizes, weights, line heights)
 * - Spacing system
 * - Border radius values
 * - Shadows and effects
 * - Transitions and animations
 */

export const theme = {
  // ============================================================================
  // COLOR PALETTE
  // ============================================================================
  colors: {
    // Primary brand colors (Purple gradient theme)
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764',
    },

    // Secondary accent colors
    secondary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },

    // Semantic colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },

    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },

    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },

    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },

    // Neutral colors (grayscale)
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },

    // Dark theme specific colors
    dark: {
      bg: {
        primary: '#0a0a0f',
        secondary: '#0f0f18',
        tertiary: '#141420',
        card: '#1a1a28',
        elevated: '#1f1f2e',
      },
      border: {
        primary: 'rgba(139, 92, 246, 0.15)',
        secondary: 'rgba(255, 255, 255, 0.08)',
        strong: 'rgba(139, 92, 246, 0.3)',
      },
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        tertiary: '#94a3b8',
        muted: '#64748b',
      },
    },

    // Light theme specific colors
    light: {
      bg: {
        primary: '#ffffff',
        secondary: '#f8f9ff',
        tertiary: '#f1f5f9',
        card: '#ffffff',
        elevated: '#fafbff',
      },
      border: {
        primary: '#e5e7eb',
        secondary: '#f3f4f6',
        strong: '#d1d5db',
      },
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        muted: '#94a3b8',
      },
    },
  },

  // ============================================================================
  // TYPOGRAPHY
  // ============================================================================
  typography: {
    fontFamily: {
      sans: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
      display: "'Plus Jakarta Sans', 'Inter', sans-serif",
    },

    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
    },

    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },

    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // ============================================================================
  // SPACING SYSTEM (based on 4px grid)
  // ============================================================================
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },

  // ============================================================================
  // LAYOUT
  // ============================================================================
  layout: {
    sidebar: {
      width: {
        expanded: '280px',
        collapsed: '72px',
      },
      breakpoint: '1024px', // lg breakpoint
    },
    header: {
      height: '64px',
    },
    container: {
      maxWidth: '1600px',
      padding: '1.5rem',
    },
  },

  // ============================================================================
  // BORDER RADIUS
  // ============================================================================
  borderRadius: {
    none: '0',
    sm: '0.375rem',   // 6px
    base: '0.5rem',   // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    full: '9999px',
  },

  // ============================================================================
  // SHADOWS & ELEVATIONS
  // ============================================================================
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 2px 4px 0 rgba(0, 0, 0, 0.08)',
    base: '0 4px 8px 0 rgba(0, 0, 0, 0.12)',
    md: '0 8px 16px 0 rgba(0, 0, 0, 0.15)',
    lg: '0 12px 24px 0 rgba(0, 0, 0, 0.18)',
    xl: '0 16px 32px 0 rgba(0, 0, 0, 0.20)',
    '2xl': '0 24px 48px 0 rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    
    // Glow effects
    glowPrimary: '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)',
    glowSuccess: '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)',
    glowDanger: '0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2)',
    glowWarning: '0 0 20px rgba(245, 158, 11, 0.4), 0 0 40px rgba(245, 158, 11, 0.2)',
  },

  // ============================================================================
  // TRANSITIONS & ANIMATIONS
  // ============================================================================
  transitions: {
    duration: {
      fast: '150ms',
      base: '200ms',
      medium: '300ms',
      slow: '400ms',
      slower: '600ms',
    },
    timing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // ============================================================================
  // BREAKPOINTS (for responsive design)
  // ============================================================================
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // ============================================================================
  // Z-INDEX SCALE
  // ============================================================================
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

// ============================================================================
// GRADIENT PRESETS
// ============================================================================
export const gradients = {
  primary: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
  primarySubtle: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(126, 34, 206, 0.05) 100%)',
  secondary: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
  success: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
  danger: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
  
  // Background gradients
  bgDark: 'linear-gradient(135deg, #0a0a0f 0%, #0f0f18 50%, #141420 100%)',
  bgLight: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 50%, #f1f5f9 100%)',
  
  // Card gradients
  cardDark: 'linear-gradient(135deg, rgba(26, 26, 40, 0.95) 0%, rgba(31, 31, 46, 0.95) 100%)',
  cardLight: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 251, 255, 0.95) 100%)',
  
  // Glassmorphism
  glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  glassDark: 'linear-gradient(135deg, rgba(15, 15, 24, 0.8) 0%, rgba(20, 20, 30, 0.8) 100%)',
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get color with opacity
 */
export const withOpacity = (color: string, opacity: number): string => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

/**
 * Create responsive value
 */
export const responsive = <T,>(values: { xs?: T; sm?: T; md?: T; lg?: T; xl?: T; '2xl'?: T }) => values;

export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type Gradients = typeof gradients;

