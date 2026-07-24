import React from 'react';
import { cn } from '../../utils/cn';

const Badge = ({ 
  children, 
  className, 
  variant = 'neutral',
  size = 'md'
}) => {
  const variants = {
    neutral: 'bg-bg-subtle dark:bg-white/5 text-text-secondary dark:text-dark-text-secondary border-border/50 dark:border-dark-border/40',
    primary: 'bg-primary/10 text-primary border-primary/30 shadow-sm shadow-primary/10',
    success: 'bg-success/15 text-emerald-600 dark:text-emerald-400 border-success/30 shadow-sm shadow-success/10',
    error: 'bg-error/15 text-rose-600 dark:text-rose-400 border-error/30 shadow-sm shadow-error/10',
    warning: 'bg-warning/15 text-amber-600 dark:text-amber-400 border-warning/30 shadow-sm shadow-warning/10',
    info: 'bg-info/15 text-blue-600 dark:text-blue-400 border-info/30 shadow-sm shadow-info/10',
    accent: 'bg-accent/15 text-amber-600 dark:text-amber-400 border-accent/30 shadow-sm shadow-accent/10',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full',
    md: 'px-3 py-1 text-xs font-bold uppercase tracking-tight rounded-full',
    lg: 'px-4 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide rounded-full',
  };

  return (
    <span className={cn(
      'inline-flex items-center justify-center border transition-all duration-300 hover:scale-105 select-none',
      variants[variant],
      sizes[size],
      className
    )}>
      <div className={cn("w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0 animate-pulse", 
        variant === 'success' ? 'bg-success' : 
        variant === 'error' ? 'bg-error' : 
        variant === 'warning' ? 'bg-warning' : 
        variant === 'primary' ? 'bg-primary' : 'bg-current'
      )} />
      {children}
    </span>
  );
};

export default Badge;
