import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Input = ({ 
  className, 
  type = 'text', 
  label,
  error,
  leftIcon,
  rightIcon,
  showPasswordToggle = true,
  containerClassName,
  ref,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={cn('flex flex-col space-y-1.5 w-full', containerClassName)}>
      {label && (
        <label className="text-xs font-extrabold text-text-secondary dark:text-dark-text-secondary ml-1 uppercase tracking-wider flex items-center space-x-1.5 select-none">
          <span>{label}</span>
          <div className="w-1 h-1 rounded-full bg-primary/60" />
        </label>
      )}
      <div className="relative group">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-primary transition-colors duration-300 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          type={effectiveType}
          ref={ref}
          className={cn(
            'w-full bg-bg-subtle/50 dark:bg-dark-card/60 border border-border/60 dark:border-dark-border/60 text-text-primary dark:text-dark-text-primary text-xs sm:text-sm rounded-xl sm:rounded-2xl py-3 px-4 outline-none transition-all duration-300 focus:bg-white dark:focus:bg-dark-card focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-text-tertiary/60 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-border dark:hover:border-dark-border',
            leftIcon && 'pl-11',
            (rightIcon || (isPassword && showPasswordToggle)) && 'pr-11',
            error && 'border-error/60 focus:border-error focus:ring-error/10 bg-error/[0.02]',
            className
          )}
          {...props}
        />
        {rightIcon ? (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">
            {rightIcon}
          </div>
        ) : isPassword && showPasswordToggle ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-text-tertiary hover:text-primary hover:bg-bg-subtle dark:hover:bg-white/5 transition-all active:scale-90 touch-target flex items-center justify-center"
            title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <FiEyeOff className="size-4" /> : <FiEye className="size-4" />}
          </button>
        ) : null}
      </div>
      {error && (
        <p className="text-xs font-bold text-error ml-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
};

Input.displayName = 'Input';

export default Input;
