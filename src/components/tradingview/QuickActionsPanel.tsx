import React from 'react';
import { motion } from 'framer-motion';
import { Undo2, Redo2, Trash2, Save, Download } from 'lucide-react';

interface QuickAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: () => void;
}

interface QuickActionsPanelProps {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onSave: () => void;
  onExport: () => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onUndo,
  onRedo,
  onDelete,
  onSave,
  onExport,
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

  const quickActions: QuickAction[] = [
    { id: 'undo', icon: Undo2, label: 'Undo', action: onUndo },
    { id: 'redo', icon: Redo2, label: 'Redo', action: onRedo },
    { id: 'delete', icon: Trash2, label: 'Delete', action: onDelete },
    { id: 'save', icon: Save, label: 'Save', action: onSave },
    { id: 'download', icon: Download, label: 'Export', action: onExport },
  ];

  return (
    <div className="space-y-2">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.02, x: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.action}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
            style={{
              background: 'transparent',
              color: lightColors.textSecondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = lightColors.hover;
              e.currentTarget.style.color = lightColors.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = lightColors.textSecondary;
            }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium flex-1 text-left">{action.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default QuickActionsPanel;

