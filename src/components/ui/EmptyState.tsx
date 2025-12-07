import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
    variant?: 'primary' | 'secondary' | 'danger';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
  size = 'md'
}) => {
  const ActionIcon = action?.icon;
  const variantClasses = action?.variant === 'danger' ? 'btn-danger' : action?.variant === 'secondary' ? 'btn-secondary' : 'btn-primary';
  
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-purple-400" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className={`${variantClasses} px-6 py-2.5 flex items-center gap-2`}
          aria-label={action.label}
        >
          {ActionIcon && <ActionIcon className="w-4 h-4" />}
          {action.label}
        </button>
      )}
    </div>
  );
};
