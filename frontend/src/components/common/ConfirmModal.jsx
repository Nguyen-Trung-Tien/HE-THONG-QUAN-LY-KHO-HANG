import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { cn } from '../../utils/cn';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Xác nhận xóa', 
  message = 'Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.',
  confirmText = 'Xác nhận',
  cancelText = 'Quay lại',
  variant = 'danger',
  isLoading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title={title}
      size="xs"
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2.5 w-full">
          <Button 
            variant="ghost" 
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:flex-1"
            size="md"
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'danger' ? 'danger' : 'primary'} 
            onClick={onConfirm}
            isLoading={isLoading}
            className="w-full sm:flex-1"
            size="md"
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center py-1 sm:py-2">
        <div className={cn(
          "size-12 sm:size-16 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center mb-4 sm:mb-6 relative",
          variant === 'danger' ? "bg-error/10 text-error" : "bg-primary/10 text-primary"
        )}>
          <div className={cn(
            "absolute inset-0 rounded-2xl sm:rounded-[1.5rem] animate-ping opacity-20 duration-1000",
            variant === 'danger' ? "bg-error" : "bg-primary"
          )} />
          {variant === 'danger' ? (
            <svg className="size-6 sm:size-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ) : (
            <svg className="size-6 sm:size-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <h3 className="text-base sm:text-lg font-bold text-text-primary dark:text-dark-text-primary mb-2 tracking-tight uppercase leading-tight">
          {title}
        </h3>
        <p className="text-xs text-text-secondary dark:text-dark-text-secondary font-medium leading-relaxed px-1">
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;

