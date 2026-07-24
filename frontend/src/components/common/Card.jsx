import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ children, title, extra, className = '', noPadding = false, variant = 'default', accent = false }) => {
  const variants = {
    default: 'bg-white dark:bg-dark-card border-border/50 dark:border-dark-border/40 shadow-soft-xl',
    glass: 'glass-card',
    primary: 'bg-primary/[0.03] dark:bg-primary/[0.05] border-primary/20 shadow-sm',
    subtle: 'bg-bg-subtle/30 dark:bg-white/[0.02] border-border/40 dark:border-dark-border/20 shadow-inner-sm',
  };

  return (
    <div className={cn(
      'rounded-2xl sm:rounded-3xl border overflow-hidden transition-all duration-300 hover:shadow-2xl relative group',
      variants[variant],
      className
    )}>
      {accent && <div className="absolute top-0 left-0 right-0 h-1 gradient-brand" />}

      {(title || extra) && (
        <div className="px-5 py-3.5 sm:px-7 sm:py-4.5 border-b border-border/40 dark:border-dark-border/40 flex items-center justify-between bg-gradient-to-r from-bg-subtle/30 dark:from-white/[0.01] to-transparent">
          {title && (
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-3.5 bg-primary rounded-full gradient-brand" />
              <h3 className="text-xs sm:text-sm font-extrabold text-text-primary dark:text-dark-text-primary tracking-tight uppercase">{title}</h3>
            </div>
          )}
          {extra && <div className="flex items-center scale-95 sm:scale-100">{extra}</div>}
        </div>
      )}
      <div className={cn(noPadding ? '' : 'p-4 sm:p-6 md:p-7')}>
        {children}
      </div>
    </div>
  );
};

export default Card;
