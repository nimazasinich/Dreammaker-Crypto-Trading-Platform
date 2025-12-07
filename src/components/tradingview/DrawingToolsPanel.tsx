import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Minus, Square, Circle, Type } from 'lucide-react';

interface DrawingTool {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  key: string;
  rotate?: number;
}

interface DrawingToolsPanelProps {
  activeTool: string | null;
  onToolSelect: (tool: string) => void;
  onNotification?: (message: string) => void;
  onToolChange?: (tool: string) => void;
}

export type { DrawingToolsPanelProps };

const DrawingToolsPanel: React.FC<DrawingToolsPanelProps> = ({
  activeTool,
  onToolSelect,
  onNotification,
}) => {
  const lightColors = {
    bg: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    text: '#1e293b',
    textSecondary: '#64748b',
    accent: '#8b5cf6',
    accentLight: '#a78bfa',
    hover: '#f1f5f9',
    shadow: 'rgba(139, 92, 246, 0.1)',
  };

  const drawingTools: DrawingTool[] = [
    { id: 'trendline', icon: TrendingUp, label: 'Trendline', key: 'T' },
    { id: 'horizontal', icon: Minus, label: 'Horizontal', key: 'H' },
    { id: 'vertical', icon: Minus, label: 'Vertical', key: 'V', rotate: 90 },
    { id: 'rectangle', icon: Square, label: 'Rectangle', key: 'R' },
    { id: 'circle', icon: Circle, label: 'Circle', key: 'O' },
    { id: 'text', icon: Type, label: 'Text', key: 'A' },
  ];

  const handleToolClick = (tool: DrawingTool) => {
    onToolSelect(tool.id);
    onNotification?.(`${tool.label} activated (${tool.key})`);
  };

  return (
    <div className="space-y-2">
      {drawingTools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        return (
          <motion.button
            key={tool.id}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleToolClick(tool)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
            style={isActive
              ? {
                  background: `linear-gradient(135deg, ${lightColors.accent} 0%, ${lightColors.accentLight} 100%)`,
                  color: '#ffffff',
                  boxShadow: `0 4px 12px ${lightColors.shadow}`,
                }
              : {
                  background: 'transparent',
                  color: lightColors.textSecondary,
                }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = lightColors.hover;
                e.currentTarget.style.color = lightColors.accent;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = lightColors.textSecondary;
              }
            }}
          >
            <Icon
              className={`w-5 h-5 ${tool.rotate ? `rotate-[${tool.rotate}deg]` : ''}`}
            />
            <span className="text-sm font-medium flex-1 text-left">{tool.label}</span>
            <span className="text-xs opacity-60">{tool.key}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default DrawingToolsPanel;

