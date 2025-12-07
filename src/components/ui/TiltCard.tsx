import { motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface TiltCardProps {
    children: ReactNode;
    className?: string;
    tiltDegree?: number;
}

export const TiltCard: React.FC<TiltCardProps> = ({
    children,
    className = '',
    tiltDegree = 10,
}) => {
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateXValue = ((y - centerY) / centerY) * tiltDegree;
        const rotateYValue = ((x - centerX) / centerX) * tiltDegree;

        setRotateX(-rotateXValue);
        setRotateY(rotateYValue);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    return (
        <motion.div
            className={`transform-gpu ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{
                rotateX,
                rotateY,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
                transformStyle: 'preserve-3d',
            }}
        >
            {children}
        </motion.div>
    );
};
