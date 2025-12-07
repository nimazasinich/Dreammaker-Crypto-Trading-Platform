import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient' | 'interactive';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  glow?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: `
    bg-[color:var(--surface-elevated)]
    border border-[color:var(--border-default)]
    shadow-sm
  `,
  elevated: `
    bg-[color:var(--surface-elevated)]
    border border-[color:var(--border-default)]
    shadow-lg
  `,
  outlined: `
    bg-transparent
    border-2 border-[color:var(--border-strong)]
  `,
  glass: `
    bg-white/5
    backdrop-blur-xl
    border border-white/10
    shadow-xl
  `,
  gradient: `
    bg-gradient-to-br from-purple-900/20 via-slate-900/40 to-blue-900/20
    backdrop-blur-xl
    border border-purple-500/20
    shadow-xl shadow-purple-500/5
  `,
  interactive: `
    bg-[color:var(--surface-elevated)]
    border border-[color:var(--border-default)]
    shadow-md
    cursor-pointer
    transition-all duration-300
    hover:border-purple-500/40
    hover:shadow-lg hover:shadow-purple-500/10
    hover:-translate-y-1
  `,
};

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverable = false,
      glow = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-xl overflow-hidden';
    const hoverStyles = hoverable && variant !== 'interactive'
      ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1'
      : '';
    const glowStyles = glow ? 'shadow-glow-primary animate-glow' : '';

    return (
      <motion.div
        ref={ref}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${hoverStyles}
          ${glowStyles}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  className = '',
  children,
  action,
}) => (
  <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
    <div className="flex-1 min-w-0">{children}</div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

// Card Title
interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  gradient?: boolean;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  className = '',
  children,
  as: Component = 'h3',
  gradient = false,
}) => {
  const gradientStyles = gradient
    ? 'bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent'
    : 'text-[color:var(--text-primary)]';

  return (
    <Component
      className={`text-lg font-bold leading-tight tracking-tight ${gradientStyles} ${className}`}
    >
      {children}
    </Component>
  );
};

// Card Description
interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  className = '',
  children,
}) => (
  <p className={`text-sm text-[color:var(--text-secondary)] mt-1 ${className}`}>
    {children}
  </p>
);

// Card Content
interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  className = '',
  children,
}) => (
  <div className={className}>{children}</div>
);

// Card Footer
interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
  border?: boolean;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  className = '',
  children,
  border = false,
}) => (
  <div
    className={`
      mt-4 flex items-center gap-3
      ${border ? 'pt-4 border-t border-[color:var(--border-default)]' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

// Stat Card - Specialized card for displaying statistics
interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  trend?: number[];
  className?: string;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  trend,
  className = '',
  loading = false,
}) => {
  const changeColors = {
    positive: 'text-emerald-400 bg-emerald-500/10',
    negative: 'text-red-400 bg-red-500/10',
    neutral: 'text-purple-400 bg-purple-500/10',
  };

  if (loading) {
    return (
      <Card variant="glass" className={className}>
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-20 bg-slate-700/50 rounded" />
          <div className="h-8 w-32 bg-slate-700/50 rounded" />
          <div className="h-3 w-16 bg-slate-700/50 rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" hoverable className={`group ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)] mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-[color:var(--text-primary)] tabular-nums">
            {value}
          </p>
          {change && (
            <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${changeColors[changeType]}`}>
              {changeType === 'positive' && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              )}
              {changeType === 'negative' && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7L17 17M17 17H7M17 17V7" />
                </svg>
              )}
              {change}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        )}
      </div>

      {/* Mini trend chart */}
      {trend && trend.length > 0 && (
        <div className="mt-4 h-8">
          <svg className="w-full h-full" viewBox="0 0 100 32" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`trend-gradient-${title.replace(/\s/g, '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={changeType === 'positive' ? '#10b981' : changeType === 'negative' ? '#ef4444' : '#8b5cf6'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={changeType === 'positive' ? '#10b981' : changeType === 'negative' ? '#ef4444' : '#8b5cf6'} stopOpacity="1" />
              </linearGradient>
              <linearGradient id={`trend-fill-${title.replace(/\s/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={changeType === 'positive' ? '#10b981' : changeType === 'negative' ? '#ef4444' : '#8b5cf6'} stopOpacity="0.2" />
                <stop offset="100%" stopColor={changeType === 'positive' ? '#10b981' : changeType === 'negative' ? '#ef4444' : '#8b5cf6'} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#trend-fill-${title.replace(/\s/g, '')})`}
              d={`M 0,32 L ${trend.map((v, i) => `${(i / (trend.length - 1)) * 100},${32 - v * 32}`).join(' L ')} L 100,32 Z`}
            />
            <polyline
              fill="none"
              stroke={`url(#trend-gradient-${title.replace(/\s/g, '')})`}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={trend.map((v, i) => `${(i / (trend.length - 1)) * 100},${32 - v * 32}`).join(' ')}
            />
          </svg>
        </div>
      )}
    </Card>
  );
};

// Feature Card - Card with icon and description
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  onClick?: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className = '',
  onClick,
}) => (
  <Card
    variant={onClick ? 'interactive' : 'glass'}
    className={`group ${className}`}
    onClick={onClick}
  >
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-[color:var(--text-primary)] mb-1 group-hover:text-purple-400 transition-colors">
          {title}
        </h4>
        <p className="text-sm text-[color:var(--text-secondary)] line-clamp-2">
          {description}
        </p>
      </div>
      {onClick && (
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  </Card>
);

export default Card;
