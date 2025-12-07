/**
 * LoadingSkeleton Component - Unified Loading States
 *
 * Provides consistent, animated loading skeletons across the application
 * with multiple variants for different use cases.
 *
 * @example
 * ```tsx
 * <LoadingSkeleton variant="card" count={3} />
 * <LoadingSkeleton variant="position" />
 * <LoadingSkeleton variant="chart" />
 * ```
 *
 * @version 2.0.0
 */

import React from 'react';
import { motion } from 'framer-motion';

export interface LoadingSkeletonProps {
    /**
     * Variant type determines the skeleton layout and styling
     */
    variant?: 'card' | 'chart' | 'table' | 'text' | 'position' | 'order' | 'button' | 'avatar' | 'list';

    /**
     * Number of skeleton items to render
     */
    count?: number;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Width override (accepts Tailwind classes or custom values)
     */
    width?: string;

    /**
     * Height override (accepts Tailwind classes or custom values)
     */
    height?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
    variant = 'card',
    count = 1,
    className = '',
    width,
    height
}) => {
    const variants = {
        card: 'h-32 rounded-xl',
        chart: 'h-64 rounded-xl',
        table: 'h-12 rounded-lg',
        text: 'h-4 rounded',
        button: 'h-10 w-32 rounded-lg',
        avatar: 'h-12 w-12 rounded-full',
        list: 'h-16 rounded-lg',
        // Trading-specific variants
        position: 'h-24 rounded-lg',
        order: 'h-20 rounded-lg'
    };

    // Apply width and height overrides if provided
    const sizeClass = `${width || ''} ${height || ''}`.trim();
    const finalClass = sizeClass || variants[variant];

    // Shimmer animation
    const shimmerAnimation = {
        backgroundPosition: ['-1000px 0', '1000px 0']
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    className={`
                        ${finalClass}
                        bg-gradient-to-r from-surface-muted via-surface-hover to-surface-muted
                        bg-[length:1000px_100%]
                        relative overflow-hidden
                    `}
                    animate={shimmerAnimation}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: i * 0.1
                    }}
                    style={{
                        backgroundSize: '1000px 100%'
                    }}
                >
                    {/* Shimmer overlay */}
                    <div
                        className="absolute inset-0 opacity-50"
                        style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                            animation: 'shimmer 2s infinite linear',
                            backgroundSize: '1000px 100%'
                        }}
                    />
                </motion.div>
            ))}
        </div>
    );
};

/**
 * Specialized skeleton for trading positions
 */
export const PositionSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => (
    <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-card p-4 rounded-lg border border-border animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-surface-muted rounded-lg" />
                        <div className="space-y-2">
                            <div className="w-24 h-4 bg-surface-muted rounded" />
                            <div className="w-32 h-3 bg-surface-muted rounded" />
                        </div>
                    </div>
                    <div className="text-right space-y-2">
                        <div className="w-20 h-4 bg-surface-muted rounded ml-auto" />
                        <div className="w-16 h-3 bg-surface-muted rounded ml-auto" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

/**
 * Specialized skeleton for charts
 */
export const ChartSkeleton: React.FC = () => (
    <div className="h-96 bg-card rounded-xl p-6 border border-border animate-pulse">
        <div className="flex items-center justify-between mb-6">
            <div className="w-32 h-6 bg-surface-muted rounded" />
            <div className="flex gap-2">
                <div className="w-16 h-8 bg-surface-muted rounded" />
                <div className="w-16 h-8 bg-surface-muted rounded" />
                <div className="w-16 h-8 bg-surface-muted rounded" />
            </div>
        </div>
        <div className="h-64 bg-surface-muted rounded-lg" />
    </div>
);

/**
 * Specialized skeleton for tables
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
    rows = 5,
    columns = 4
}) => (
    <div className="bg-card rounded-lg overflow-hidden border border-border">
        {/* Header */}
        <div className="bg-surface-muted p-4 flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
                <div key={i} className="flex-1 h-4 bg-surface-hover rounded animate-pulse" />
            ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
            <div key={rowIdx} className="p-4 flex gap-4 border-t border-border">
                {Array.from({ length: columns }).map((_, colIdx) => (
                    <div key={colIdx} className="flex-1 h-4 bg-surface-muted rounded animate-pulse" />
                ))}
            </div>
        ))}
    </div>
);

export default LoadingSkeleton;
