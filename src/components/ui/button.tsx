import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger' | 'warning' | 'gradient' | 'destructive';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
  glow?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 
    text-white font-semibold
    shadow-lg shadow-purple-500/25
    hover:shadow-xl hover:shadow-purple-500/30
    hover:from-purple-500 hover:via-purple-400 hover:to-purple-500
    active:from-purple-700 active:via-purple-600 active:to-purple-700
    border border-purple-400/20
  `,
  secondary: `
    bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700
    text-white font-medium
    shadow-md shadow-slate-900/20
    hover:from-slate-600 hover:via-slate-500 hover:to-slate-600
    active:from-slate-800 active:via-slate-700 active:to-slate-800
    border border-slate-500/20
  `,
  outline: `
    bg-transparent
    text-purple-400 font-medium
    border-2 border-purple-500/50
    hover:bg-purple-500/10 hover:border-purple-400
    active:bg-purple-500/20
  `,
  ghost: `
    bg-transparent
    text-slate-300 font-medium
    hover:bg-white/10 hover:text-white
    active:bg-white/5
  `,
  success: `
    bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600
    text-white font-semibold
    shadow-lg shadow-emerald-500/25
    hover:shadow-xl hover:shadow-emerald-500/30
    hover:from-emerald-500 hover:via-emerald-400 hover:to-emerald-500
    active:from-emerald-700 active:via-emerald-600 active:to-emerald-700
    border border-emerald-400/20
  `,
  danger: `
    bg-gradient-to-r from-red-600 via-red-500 to-red-600
    text-white font-semibold
    shadow-lg shadow-red-500/25
    hover:shadow-xl hover:shadow-red-500/30
    hover:from-red-500 hover:via-red-400 hover:to-red-500
    active:from-red-700 active:via-red-600 active:to-red-700
    border border-red-400/20
  `,
  warning: `
    bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600
    text-white font-semibold
    shadow-lg shadow-amber-500/25
    hover:shadow-xl hover:shadow-amber-500/30
    hover:from-amber-500 hover:via-amber-400 hover:to-amber-500
    active:from-amber-700 active:via-amber-600 active:to-amber-700
    border border-amber-400/20
  `,
  destructive: `
    bg-gradient-to-r from-red-600 via-red-500 to-red-600
    text-white font-semibold
    shadow-lg shadow-red-500/25
    hover:shadow-xl hover:shadow-red-500/30
    hover:from-red-500 hover:via-red-400 hover:to-red-500
    active:from-red-700 active:via-red-600 active:to-red-700
    border border-red-400/20
  `,
  gradient: `
    bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-500
    text-white font-semibold
    shadow-lg shadow-purple-500/20
    hover:shadow-xl hover:shadow-blue-500/25
    hover:from-purple-500 hover:via-blue-400 hover:to-cyan-400
    active:from-purple-700 active:via-blue-600 active:to-cyan-600
    border border-white/10
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-md',
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
  xl: 'h-14 px-8 text-lg gap-3 rounded-xl',
  icon: 'h-10 w-10 rounded-lg',
};

const LoadingSpinner: React.FC<{ size: ButtonSize }> = ({ size }) => {
  const spinnerSizes: Record<ButtonSize, string> = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
    icon: 'w-4 h-4',
  };

  return (
    <svg
      className={`animate-spin ${spinnerSizes[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      rounded = false,
      glow = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseStyles = `
      inline-flex items-center justify-center
      transition-all duration-200 ease-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      select-none
    `;

    const glowStyles = glow ? 'animate-glow' : '';
    const fullWidthStyles = fullWidth ? 'w-full' : '';
    const roundedStyles = rounded ? '!rounded-full' : '';

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${glowStyles}
          ${fullWidthStyles}
          ${roundedStyles}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        whileHover={!isDisabled ? { scale: 1.02, y: -1 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        {...props}
      >
        {/* Shimmer effect overlay */}
        <span className="absolute inset-0 overflow-hidden rounded-[inherit]">
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer" />
        </span>

        {/* Content */}
        <span className="relative flex items-center justify-center gap-inherit">
          {loading ? (
            <LoadingSpinner size={size} />
          ) : (
            <>
              {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
              {children}
              {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
            </>
          )}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// Icon Button variant
interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children' | 'size'> {
  icon: React.ReactNode;
  size?: ButtonSize;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', ...props }, ref) => {
    return (
      <Button ref={ref} size={size} {...props}>
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Button Group component
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  attached?: boolean;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = '',
  attached = false,
}) => {
  return (
    <div
      className={`
        inline-flex
        ${attached ? '[&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg [&>button:not(:last-child)]:border-r-0' : 'gap-2'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Button;
