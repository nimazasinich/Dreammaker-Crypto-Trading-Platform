import React from 'react';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  ariaLabel,
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const baseClasses = variant === 'primary' 
    ? 'btn-primary'
    : variant === 'secondary'
    ? 'btn-secondary'
    : 'btn-ghost';

  return (
    <button
      {...props}
      className={`${baseClasses} ${className}`}
      aria-label={ariaLabel}
      type={props.type || 'button'}
    >
      {children}
    </button>
  );
};
