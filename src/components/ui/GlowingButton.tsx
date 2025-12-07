import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowingButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'success' | 'danger' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
}

export const GlowingButton: React.FC<GlowingButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
}) => {
    const variants = {
        primary: {
            bg: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            shadow: '0 0 20px rgba(139, 92, 246, 0.5)',
            hoverShadow: '0 0 30px rgba(139, 92, 246, 0.8)',
        },
        success: {
            bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            shadow: '0 0 20px rgba(34, 197, 94, 0.5)',
            hoverShadow: '0 0 30px rgba(34, 197, 94, 0.8)',
        },
        danger: {
            bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            shadow: '0 0 20px rgba(239, 68, 68, 0.5)',
            hoverShadow: '0 0 30px rgba(239, 68, 68, 0.8)',
        },
        secondary: {
            bg: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
            shadow: '0 0 20px rgba(100, 116, 139, 0.5)',
            hoverShadow: '0 0 30px rgba(100, 116, 139, 0.8)',
        },
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    const currentVariant = variants[variant];

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            className={`
        relative font-bold rounded-lg
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
            style={{
                background: currentVariant.bg,
                boxShadow: currentVariant.shadow,
            }}
            whileHover={
                !disabled
                    ? {
                        scale: 1.05,
                        boxShadow: currentVariant.hoverShadow,
                    }
                    : {}
            }
            whileTap={!disabled ? { scale: 0.95 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
            {children}
        </motion.button>
    );
};
