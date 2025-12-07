/**
 * FABMenu Component
 * Floating Action Button Menu for quick access to tools
 */

import React, { useState } from 'react';
import {
  Plus, X, TrendingUp, Target, Layers, Activity, BarChart2,
  LineChart, Waves, Hexagon, Volume2, Settings
} from 'lucide-react';

export type FABToolType = 
  | 'trendline' | 'fibonacci' | 'support-resistance'
  | 'elliott-wave' | 'harmonic' | 'volume-profile'
  | 'rsi' | 'macd' | 'bollinger';

interface FABTool {
  id: FABToolType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface FABMenuProps {
  onToolSelect: (tool: FABToolType) => void;
  activeTool?: FABToolType | null;
  isDark?: boolean;
  position?: 'bottom-right' | 'bottom-left';
}

const TOOLS: FABTool[] = [
  { id: 'trendline', label: 'Trendline', icon: TrendingUp, color: 'from-blue-500 to-blue-600' },
  { id: 'fibonacci', label: 'Fibonacci', icon: Target, color: 'from-yellow-500 to-orange-500' },
  { id: 'support-resistance', label: 'S/R Levels', icon: Layers, color: 'from-green-500 to-emerald-500' },
  { id: 'elliott-wave', label: 'Elliott Wave', icon: Waves, color: 'from-purple-500 to-violet-500' },
  { id: 'harmonic', label: 'Harmonic', icon: Hexagon, color: 'from-pink-500 to-rose-500' },
  { id: 'rsi', label: 'RSI', icon: Activity, color: 'from-cyan-500 to-teal-500' },
  { id: 'macd', label: 'MACD', icon: BarChart2, color: 'from-indigo-500 to-blue-500' },
  { id: 'bollinger', label: 'Bollinger', icon: LineChart, color: 'from-amber-500 to-yellow-500' },
];

const FABMenu: React.FC<FABMenuProps> = ({
  onToolSelect,
  activeTool,
  isDark = true,
  position = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToolClick = (tool: FABToolType) => {
    onToolSelect(tool);
    setIsOpen(false);
  };

  const positionClass = position === 'bottom-right' ? 'right-4 bottom-4' : 'left-4 bottom-4';
  const menuDirection = position === 'bottom-right' ? 'items-end' : 'items-start';

  return (
    <div className={`fixed ${positionClass} z-50 flex flex-col ${menuDirection} gap-2`}>
      {/* Tool Buttons */}
      <div className={`flex flex-col ${menuDirection} gap-2 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {TOOLS.map((tool, index) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`group flex items-center gap-2 transition-all duration-200 ${position === 'bottom-right' ? 'flex-row-reverse' : ''}`}
              style={{
                transitionDelay: isOpen ? `${index * 30}ms` : '0ms',
                transform: isOpen ? 'scale(1)' : 'scale(0.8)',
              }}
            >
              {/* Label */}
              <span className={`px-2 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-opacity ${
                isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 shadow-md'
              } opacity-0 group-hover:opacity-100`}>
                {tool.label}
              </span>
              
              {/* Icon Button */}
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 ${
                  isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''
                }`}
                style={{
                  background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div className={`bg-gradient-to-br ${tool.color} h-full w-full rounded-full flex items-center justify-center`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        style={{
          background: isOpen 
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          boxShadow: isOpen
            ? '0 8px 25px rgba(239, 68, 68, 0.5)'
            : '0 8px 25px rgba(139, 92, 246, 0.5)',
        }}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Plus className="h-6 w-6 text-white" />
        )}
      </button>
    </div>
  );
};

export default FABMenu;
