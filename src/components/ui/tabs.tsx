import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Context
// ============================================================================

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
  variant: TabsVariant;
  orientation: 'horizontal' | 'vertical';
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
};

// ============================================================================
// Types
// ============================================================================

type TabsVariant = 'default' | 'pills' | 'underline' | 'enclosed' | 'soft';

// ============================================================================
// Tabs Root
// ============================================================================

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  variant?: TabsVariant;
  orientation?: 'horizontal' | 'vertical';
  defaultValue?: string;
}

export function Tabs({
  value,
  onValueChange,
  children,
  className = '',
  variant = 'default',
  orientation = 'horizontal',
}: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange, variant, orientation }}>
      <div
        className={`
          ${orientation === 'vertical' ? 'flex gap-4' : ''}
          ${className}
        `}
        data-orientation={orientation}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// ============================================================================
// Tabs List
// ============================================================================

export interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const listVariantStyles: Record<TabsVariant, string> = {
  default: `
    inline-flex items-center gap-1 p-1 
    bg-slate-800/50 backdrop-blur-sm
    rounded-xl border border-slate-700/50
  `,
  pills: `
    inline-flex items-center gap-2
  `,
  underline: `
    inline-flex items-center gap-6
    border-b-2 border-slate-700/50
  `,
  enclosed: `
    inline-flex items-center
    bg-slate-900/50 backdrop-blur-sm
    rounded-t-xl border border-b-0 border-slate-700/50
  `,
  soft: `
    inline-flex items-center gap-1 p-1
    bg-purple-500/10 backdrop-blur-sm
    rounded-xl border border-purple-500/20
  `,
};

export function TabsList({ children, className = '', fullWidth = false }: TabsListProps) {
  const { variant, orientation } = useTabsContext();

  return (
    <div
      className={`
        ${listVariantStyles[variant]}
        ${orientation === 'vertical' ? 'flex-col' : ''}
        ${fullWidth ? 'flex w-full' : ''}
        ${className}
      `}
      role="tablist"
      aria-orientation={orientation}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Tabs Trigger
// ============================================================================

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
}

const triggerVariantStyles: Record<TabsVariant, { base: string; active: string; inactive: string }> = {
  default: {
    base: `
      relative px-4 py-2 text-sm font-medium rounded-lg
      transition-all duration-200 ease-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
    `,
    active: `
      bg-gradient-to-r from-purple-600 to-purple-500 text-white
      shadow-lg shadow-purple-500/25
    `,
    inactive: `
      text-slate-400 hover:text-white hover:bg-slate-700/50
    `,
  },
  pills: {
    base: `
      relative px-4 py-2 text-sm font-medium rounded-full
      transition-all duration-200 ease-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500
    `,
    active: `
      bg-gradient-to-r from-purple-600 to-blue-500 text-white
      shadow-lg shadow-purple-500/30
    `,
    inactive: `
      text-slate-400 hover:text-white
      bg-slate-800/50 hover:bg-slate-700/50
      border border-slate-700/50 hover:border-slate-600/50
    `,
  },
  underline: {
    base: `
      relative px-1 pb-3 text-sm font-medium
      transition-all duration-200 ease-out
      focus-visible:outline-none
    `,
    active: `
      text-purple-400
    `,
    inactive: `
      text-slate-400 hover:text-white
    `,
  },
  enclosed: {
    base: `
      relative px-4 py-2.5 text-sm font-medium
      transition-all duration-200 ease-out
      border-b-2 -mb-[2px]
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-inset
    `,
    active: `
      text-white bg-slate-800/80
      border-b-purple-500
      rounded-t-lg
    `,
    inactive: `
      text-slate-400 hover:text-white
      border-b-transparent hover:border-b-slate-600
    `,
  },
  soft: {
    base: `
      relative px-4 py-2 text-sm font-medium rounded-lg
      transition-all duration-200 ease-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2
    `,
    active: `
      bg-purple-500/20 text-purple-300
      border border-purple-500/30
    `,
    inactive: `
      text-slate-400 hover:text-purple-300 hover:bg-purple-500/10
    `,
  },
};

export function TabsTrigger({
  value,
  children,
  className = '',
  disabled = false,
  icon,
  badge,
}: TabsTriggerProps) {
  const { value: selectedValue, onValueChange, variant } = useTabsContext();
  const isActive = selectedValue === value;
  const styles = triggerVariantStyles[variant];

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      data-state={isActive ? 'active' : 'inactive'}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={`
        ${styles.base}
        ${isActive ? styles.active : styles.inactive}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center gap-2">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
        {badge !== undefined && (
          <span
            className={`
              ml-1.5 px-1.5 py-0.5 text-xs font-semibold rounded-full
              ${isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'}
            `}
          >
            {badge}
          </span>
        )}
      </span>

      {/* Underline indicator for underline variant */}
      {variant === 'underline' && isActive && (
        <motion.div
          layoutId="underline"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500"
          style={{ borderRadius: 9999 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  );
}

// ============================================================================
// Tabs Content
// ============================================================================

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  forceMount?: boolean;
}

export function TabsContent({
  value,
  children,
  className = '',
  forceMount = false,
}: TabsContentProps) {
  const { value: selectedValue } = useTabsContext();
  const isActive = selectedValue === value;

  if (!forceMount && !isActive) return null;

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={value}
          role="tabpanel"
          id={`panel-${value}`}
          aria-labelledby={`tab-${value}`}
          data-state={isActive ? 'active' : 'inactive'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`focus-visible:outline-none ${className}`}
          style={!isActive && forceMount ? { display: 'none' } : undefined}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Controlled Tabs Hook
// ============================================================================

export function useTabs(defaultValue: string) {
  const [value, setValue] = useState(defaultValue);

  const onValueChange = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  return { value, onValueChange };
}

// ============================================================================
// Exports
// ============================================================================

export default Tabs;
