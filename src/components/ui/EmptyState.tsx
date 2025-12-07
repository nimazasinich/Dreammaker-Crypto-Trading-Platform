/**
 * EmptyState Component - Unified Empty State UI
 *
 * Provides a consistent, engaging empty state UI across the application
 * with optional action buttons to guide users.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<Wallet className="w-12 h-12" />}
 *   title="No positions"
 *   description="Open positions will appear here"
 *   action={{
 *     label: "Start Trading",
 *     onClick: () => navigateToTrading()
 *   }}
 * />
 * ```
 *
 * @version 1.0.0
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
}

export interface EmptyStateProps {
  /**
   * Icon to display (Lucide icon component)
   */
  icon?: React.ReactNode;

  /**
   * Main title text
   */
  title: string;

  /**
   * Optional description text
   */
  description?: string;

  /**
   * Primary action button
   */
  action?: EmptyStateAction;

  /**
   * Secondary action button
   */
  secondaryAction?: EmptyStateAction;

  /**
   * Custom className for container
   */
  className?: string;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: {
    container: 'p-6',
    iconSize: 'w-8 h-8',
    title: 'text-base',
    description: 'text-xs'
  },
  md: {
    container: 'p-12',
    iconSize: 'w-12 h-12',
    title: 'text-lg',
    description: 'text-sm'
  },
  lg: {
    container: 'p-16',
    iconSize: 'w-16 h-16',
    title: 'text-xl',
    description: 'text-base'
  }
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
  size = 'md'
}) => {
  const styles = sizeStyles[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-card rounded-xl text-center ${styles.container} ${className}`}
    >
      {/* Icon */}
      {icon && (
        <div className="flex justify-center mb-4">
          <div className={`text-muted-foreground opacity-50 ${styles.iconSize}`}>
            {icon}
          </div>
        </div>
      )}

      {/* Title */}
      <h3 className={`font-semibold text-foreground mb-2 ${styles.title}`}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={`text-muted-foreground ${styles.description} mb-6`}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center justify-center gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className={`
                px-6 py-2.5 rounded-lg font-medium text-sm
                transition-all duration-200 hover:scale-105
                flex items-center gap-2
                ${action.variant === 'secondary'
                  ? 'bg-surface-muted text-foreground hover:bg-surface-hover border border-border'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
                }
              `}
            >
              {action.icon}
              {action.label}
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className={`
                px-6 py-2.5 rounded-lg font-medium text-sm
                transition-all duration-200 hover:scale-105
                flex items-center gap-2
                ${secondaryAction.variant === 'primary'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
                  : 'bg-surface-muted text-foreground hover:bg-surface-hover border border-border'
                }
              `}
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

/**
 * Preset EmptyState variants for common use cases
 */
export const EmptyStatePresets = {
  NoData: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      title="No data available"
      description="Data will appear here when available"
      {...props}
    />
  ),

  NoResults: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      title="No results found"
      description="Try adjusting your search or filters"
      {...props}
    />
  ),

  Error: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      title="Something went wrong"
      description="Unable to load data. Please try again."
      action={{
        label: 'Retry',
        onClick: props.action?.onClick || (() => window.location.reload()),
      }}
      {...props}
    />
  )
};

export default EmptyState;
