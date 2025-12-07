import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    duration = 1,
    prefix = '',
    suffix = '',
    decimals = 2,
    className = '',
}) => {
    const spring = useSpring(0, { duration: duration * 1000 });
    const display = useTransform(spring, (current) =>
        `${prefix}${current.toFixed(decimals)}${suffix}`
    );

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    return (
        <motion.span className={className}>
            {display}
        </motion.span>
    );
};
