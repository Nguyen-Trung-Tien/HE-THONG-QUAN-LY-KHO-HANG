import React from 'react';
import { cn } from '../../utils/cn';

const Button = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ref,
  ...props 
}) => {
  const variants = {
    primary: 'gradient-brand text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:scale-[0.98]',
    gradient: 'gradient-brand text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:scale-[0.98]',
    secondary: 'bg-bg-subtle/80 dark:bg-white/5 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-white border border-border/60 dark:border-dark-border/40 hover:bg-white dark:hover:bg-white/10 active:scale-[0.98]',
    outline: 'bg-transparent text-primary border border-primary/40 hover:border-primary hover:bg-primary/10 active:scale-[0.98]',
    ghost: 'bg-transparent text-text-secondary hover:bg-bg-subtle dark:hover:bg-white/5 hover:text-text-primary active:scale-[0.98]',
    danger: 'bg-error text-white shadow-md shadow-error/20 hover:shadow-error/35 hover:-translate-y-0.5 active:scale-[0.98]',
    success: 'bg-success text-white shadow-md shadow-success/20 hover:shadow-success/35 hover:-translate-y-0.5 active:scale-[0.98]',
    info: 'bg-info text-white shadow-md shadow-info/20 hover:shadow-info/35 hover:-translate-y-0.5 active:scale-[0.98]',
  };

  const sizes = {
    xs: 'h-7 px-2.5 text-[11px] font-bold rounded-xl gap-1.5',
    sm: 'h-9 px-4 text-xs font-bold rounded-xl gap-2',
    md: 'h-9 px-4 text-xs font-bold rounded-xl gap-2',
    lg: 'h-9.5 px-4.5 text-xs font-bold rounded-xl gap-2.5',
    xl: 'h-10.5 px-5 text-sm font-extrabold rounded-xl gap-3',
    icon: 'size-9 p-0 flex items-center justify-center rounded-xl',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'relative inline-flex items-center justify-center font-bold tracking-tight text-center transition-all duration-200 outline-none focus:ring-4 focus:ring-primary/15 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed overflow-hidden group select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {/* Subtle shine highlight on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

      {isLoading ? (
        <span className="inline-flex items-center gap-2 relative z-10">
          <span className="relative size-3.5 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full border-2 border-current opacity-20" />
            <span className="absolute inset-0 rounded-full border-2 border-current border-t-transparent animate-spin" />
          </span>
          <span className="tracking-tight">{loadingText || children}</span>
        </span>
      ) : (
        <>
          {leftIcon && (
            <span className="transition-transform duration-300 group-hover:-translate-x-0.5 relative z-10 flex items-center justify-center">{leftIcon}</span>
          )}
          <span className="relative z-10 whitespace-nowrap">{children}</span>
          {rightIcon && (
            <span className="transition-transform duration-300 group-hover:translate-x-0.5 relative z-10 flex items-center justify-center">{rightIcon}</span>
          )}
        </>
      )}
    </button>
  );
};

Button.displayName = 'Button';

export default Button;
