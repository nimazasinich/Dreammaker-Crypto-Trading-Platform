import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Maximize2, Minimize2, X } from 'lucide-react';

export interface DockablePanelProps {
  id: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
  defaultDocked?: boolean;
  onDockChange?: (docked: boolean) => void;
  className?: string;
  isOpen?: boolean; // برای کنترل از خارج
  onOpenChange?: (open: boolean) => void; // callback برای تغییر state
}

export const DockablePanel: React.FC<DockablePanelProps> = ({
  id,
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  defaultDocked = true,
  onDockChange,
  className = '',
  isOpen: controlledIsOpen,
  onOpenChange,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const [isDocked, setIsDocked] = useState(defaultDocked);
  
  // استفاده از controlled state اگر ارائه شده باشد، در غیر این صورت از internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleDockToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newDocked = !isDocked;
    setIsDocked(newDocked);
    onDockChange?.(newDocked);
  };

  const handleToggle = () => {
    const newOpen = !isOpen;
    if (controlledIsOpen !== undefined) {
      // Controlled component
      onOpenChange?.(newOpen);
    } else {
      // Uncontrolled component
      setInternalIsOpen(newOpen);
    }
  };

  const setIsOpen = (open: boolean) => {
    if (controlledIsOpen !== undefined) {
      onOpenChange?.(open);
    } else {
      setInternalIsOpen(open);
    }
  };
  
  // React به تغییرات controlledIsOpen
  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      // اگر controlled است، state را به‌روزرسانی نکن
      return;
    }
  }, [controlledIsOpen]);

  // Light theme colors
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

  return (
    <div className={`mb-2 ${className}`}>
      {/* Enhanced Panel Header - Always Visible */}
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 relative overflow-hidden"
        style={{
          background: isOpen 
            ? `linear-gradient(135deg, ${lightColors.surface} 0%, ${lightColors.bg} 50%, ${lightColors.surface} 100%)`
            : `linear-gradient(135deg, ${lightColors.surface} 0%, ${lightColors.bg} 100%)`,
          border: `1.5px solid ${isOpen ? lightColors.accent + '50' : lightColors.border}`,
          boxShadow: isOpen 
            ? `0 4px 16px ${lightColors.shadow}, 0 0 0 1px ${lightColors.accent}30, inset 0 1px 0 rgba(255, 255, 255, 0.8)`
            : `0 2px 6px ${lightColors.shadow}, inset 0 1px 0 rgba(255, 255, 255, 0.5)`,
        }}
      >
        {/* Decorative gradient overlay */}
        {isOpen && (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at top left, ${lightColors.accent}20 0%, transparent 60%)`,
            }}
          />
        )}
        <div className="flex items-center gap-3 flex-1 relative z-10">
          {Icon && (
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-2 rounded-xl shadow-md"
              style={{
                background: isOpen
                  ? `linear-gradient(135deg, ${lightColors.accent} 0%, ${lightColors.accentLight} 100%)`
                  : `linear-gradient(135deg, ${lightColors.accent}80 0%, ${lightColors.accentLight}80 100%)`,
                boxShadow: isOpen 
                  ? `0 4px 12px ${lightColors.shadow}`
                  : `0 2px 6px ${lightColors.shadow}`,
              }}
            >
              <Icon className="w-4 h-4 text-white" />
            </motion.div>
          )}
          <span 
            className="font-bold text-sm flex-1 text-left"
            style={{ 
              color: isOpen ? lightColors.text : lightColors.textSecondary,
              textShadow: isOpen ? `0 1px 2px ${lightColors.shadow}` : 'none',
            }}
          >
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {/* Dock/Undock Button */}
          <motion.button
            onClick={handleDockToggle}
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.85 }}
            className="p-2 rounded-lg transition-all"
            style={{
              color: lightColors.textSecondary,
              background: lightColors.surface,
              border: `1px solid ${lightColors.border}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${lightColors.hover} 0%, ${lightColors.surface} 100%)`;
              e.currentTarget.style.color = lightColors.accent;
              e.currentTarget.style.borderColor = lightColors.accent + '40';
              e.currentTarget.style.boxShadow = `0 2px 8px ${lightColors.shadow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = lightColors.surface;
              e.currentTarget.style.color = lightColors.textSecondary;
              e.currentTarget.style.borderColor = lightColors.border;
              e.currentTarget.style.boxShadow = 'none';
            }}
            title={isDocked ? 'Undock Panel' : 'Dock Panel'}
          >
            {isDocked ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </motion.button>

          {/* Enhanced Expand/Collapse Icon */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="p-1.5 rounded-lg"
            style={{ 
              color: isOpen ? lightColors.accent : lightColors.textSecondary,
              background: isOpen ? lightColors.hover : 'transparent',
            }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </motion.button>

      {/* Panel Content - Dropdown Style */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="mt-2 rounded-xl p-4 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${lightColors.bg} 0%, ${lightColors.surface} 100%)`,
                border: `1.5px solid ${lightColors.border}`,
                boxShadow: `0 6px 20px ${lightColors.shadow}, inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
              }}
            >
              {/* Subtle pattern overlay */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(${lightColors.accent}10 1px, transparent 1px),
                    linear-gradient(90deg, ${lightColors.accent}10 1px, transparent 1px)
                  `,
                  backgroundSize: '15px 15px',
                }}
              />
              <div className="relative z-10">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Undocked Panel - Floating Window */}
      <AnimatePresence>
        {!isDocked && isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsDocked(true)}
            />
            {/* Floating Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed z-50 rounded-xl shadow-2xl"
              style={{
                top: '10%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '700px',
                maxWidth: '90vw',
                maxHeight: '80vh',
                background: lightColors.bg,
                border: `1px solid ${lightColors.border}`,
                boxShadow: `0 20px 60px ${lightColors.shadow}`,
              }}
            >
            {/* Floating Window Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b rounded-t-xl"
              style={{
                background: `linear-gradient(135deg, ${lightColors.surface} 0%, ${lightColors.bg} 100%)`,
                borderColor: lightColors.border,
              }}
            >
              <div className="flex items-center gap-3">
                {Icon && (
                  <div
                    className="p-1.5 rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${lightColors.accent} 0%, ${lightColors.accentLight} 100%)`,
                    }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                )}
                <span 
                  className="font-semibold text-sm"
                  style={{ color: lightColors.text }}
                >
                  {title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={handleDockToggle}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-md"
                  style={{
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
                  title="Dock Panel"
                >
                  <Minimize2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 rounded-md"
                  style={{
                    color: lightColors.textSecondary,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fee2e2';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = lightColors.textSecondary;
                  }}
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Floating Window Content */}
            <div
              className="overflow-y-auto p-4"
              style={{ maxHeight: 'calc(80vh - 60px)' }}
            >
              {children}
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

