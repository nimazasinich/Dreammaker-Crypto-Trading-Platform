import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface Node {
    id: number;
    x: number;
    y: number;
}

interface Connection {
    from: Node;
    to: Node;
}

export const NeuralBackground: React.FC = () => {
    const { nodes, connections } = useMemo(() => {
        const nodeCount = 15;
        const generatedNodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
        }));

        const generatedConnections: Connection[] = [];
        generatedNodes.forEach((node, i) => {
            const nextNode = generatedNodes[(i + 1) % nodeCount];
            generatedConnections.push({ from: node, to: nextNode });

            // Add random connections
            if (Math.random() > 0.7) {
                const randomNode = generatedNodes[Math.floor(Math.random() * nodeCount)];
                generatedConnections.push({ from: node, to: randomNode });
            }
        });

        return { nodes: generatedNodes, connections: generatedConnections };
    }, []);

    return (
        <svg className="absolute inset-0 w-full h-full">
            {/* Connections */}
            {connections.map((conn, i) => (
                <motion.line
                    key={`line-${i}`}
                    x1={`${conn.from.x}%`}
                    y1={`${conn.from.y}%`}
                    x2={`${conn.to.x}%`}
                    y2={`${conn.to.y}%`}
                    stroke="rgba(139, 92, 246, 0.2)"
                    strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                        duration: 2,
                        delay: i * 0.1,
                        repeat: Infinity,
                        repeatType: 'reverse',
                    }}
                />
            ))}

            {/* Nodes */}
            {nodes.map((node) => (
                <motion.circle
                    key={`node-${node.id}`}
                    cx={`${node.x}%`}
                    cy={`${node.y}%`}
                    r="3"
                    fill="rgba(139, 92, 246, 0.5)"
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: node.id * 0.2,
                    }}
                />
            ))}
        </svg>
    );
};
