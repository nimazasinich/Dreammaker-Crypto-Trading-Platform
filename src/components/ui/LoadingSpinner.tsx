import React from 'react';
import { motion } from 'framer-motion';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type SpinnerVariant = 'default' | 'dots' | 'pulse' | 'bars' | 'ring' | 'gradient';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  color?: string;
  className?: string;
  label?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const sizeStyles: Record<SpinnerSize, { container: string; element: string }> = {
  xs: { container: 'w-4 h-4', element: 'w-4 h-4' },
  sm: { container: 'w-6 h-6', element: 'w-6 h-6' },
  md: { container: 'w-8 h-8', element: 'w-8 h-8' },
  lg: { container: 'w-12 h-12', element: 'w-12 h-12' },
  xl: { container: 'w-16 h-16', element: 'w-16 h-16' },
};

// Default spinner (ring)
const DefaultSpinner: React.FC<{ size: SpinnerSize; color?: string }> = ({ size, color }) => (
  <div
    className={`${sizeStyles[size].element} rounded-full border-2 border-current border-t-transparent animate-spin`}
    style={{ borderColor: color ? `${color} transparent ${color} ${color}` : undefined }}
  />
);

// Dots spinner
const DotsSpinner: React.FC<{ size: SpinnerSize; color?: string }> = ({ size }) => {
  const dotSizes: Record<SpinnerSize, string> = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${dotSizes[size]} rounded-full bg-current`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Pulse spinner
const PulseSpinner: React.FC<{ size: SpinnerSize; color?: string }> = ({ size }) => (
  <div className={`${sizeStyles[size].element} relative`}>
    <motion.div
      className="absolute inset-0 rounded-full bg-current"
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.5, 0, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
    <motion.div
      className="absolute inset-0 rounded-full bg-current"
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.7, 0.2, 0.7],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeOut',
        delay: 0.3,
      }}
    />
    <div className="absolute inset-[25%] rounded-full bg-current" />
  </div>
);

// Bars spinner
const BarsSpinner: React.FC<{ size: SpinnerSize; color?: string }> = ({ size }) => {
  const barSizes: Record<SpinnerSize, { width: string; height: string }> = {
    xs: { width: 'w-0.5', height: 'h-3' },
    sm: { width: 'w-1', height: 'h-4' },
    md: { width: 'w-1', height: 'h-5' },
    lg: { width: 'w-1.5', height: 'h-8' },
    xl: { width: 'w-2', height: 'h-10' },
  };

  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={`${barSizes[size].width} ${barSizes[size].height} rounded-full bg-current`}
          animate={{
            scaleY: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Ring spinner (with gradient)
const RingSpinner: React.FC<{ size: SpinnerSize; color?: string }> = ({ size }) => {
  const ringWidths: Record<SpinnerSize, string> = {
    xs: 'border-2',
    sm: 'border-2',
    md: 'border-3',
    lg: 'border-4',
    xl: 'border-4',
  };

  return (
    <div className={`${sizeStyles[size].element} relative`}>
      {/* Background ring */}
      <div
        className={`absolute inset-0 rounded-full ${ringWidths[size]} border-current opacity-20`}
      />
      {/* Spinning arc */}
      <motion.div
        className={`absolute inset-0 rounded-full ${ringWidths[size]} border-transparent border-t-current border-r-current`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

// Gradient spinner
const GradientSpinner: React.FC<{ size: SpinnerSize; color?: string }> = ({ size }) => {
  const gradientId = `spinner-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <motion.svg
      className={sizeStyles[size].element}
      viewBox="0 0 50 50"
      animate={{ rotate: 360 }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="80 40"
      />
    </motion.svg>
  );
};

const spinnerVariants: Record<SpinnerVariant, React.FC<{ size: SpinnerSize; color?: string }>> = {
  default: DefaultSpinner,
  dots: DotsSpinner,
  pulse: PulseSpinner,
  bars: BarsSpinner,
  ring: RingSpinner,
  gradient: GradientSpinner,
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'gradient',
  color,
  className = '',
  label,
  fullScreen = false,
  overlay = false,
}) => {
  const SpinnerComponent = spinnerVariants[variant];

  const spinnerElement = (
    <div
      className={`
        inline-flex flex-col items-center justify-center gap-3
        ${color ? '' : 'text-purple-500'}
        ${className}
      `}
      style={color ? { color } : undefined}
      role="status"
      aria-label={label || 'Loading'}
    >
      <SpinnerComponent size={size} color={color} />
      {label && (
        <span className="text-sm font-medium text-[color:var(--text-secondary)]">
          {label}
        </span>
      )}
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  );

  if (fullScreen || overlay) {
    return (
      <div
        className={`
          ${fullScreen ? 'fixed' : 'absolute'} inset-0 z-50
          flex items-center justify-center
          ${overlay ? 'bg-black/50 backdrop-blur-sm' : 'bg-[color:var(--surface-page)]'}
        `}
      >
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

// Skeleton loading component
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'wave',
}) => {
  const variantStyles: Record<string, string> = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationStyles: Record<string, string> = {
    pulse: 'animate-pulse',
    wave: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
    none: '',
  };

  return (
    <div
      className={`
        bg-slate-700/50
        ${variantStyles[variant]}
        ${animationStyles[animation]}
        ${className}
      `}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      }}
    />
  );
};

// Loading overlay for sections
interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  spinner?: React.ReactNode;
  blur?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  children,
  spinner,
  blur = true,
}) => {
  return (
    <div className="relative">
      {children}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`
            absolute inset-0 z-10
            flex items-center justify-center
            bg-black/30
            ${blur ? 'backdrop-blur-sm' : ''}
          `}
        >
          {spinner || <LoadingSpinner variant="gradient" size="lg" />}
        </motion.div>
      )}
    </div>
  );
};

export default LoadingSpinner;
