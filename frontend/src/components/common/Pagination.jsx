import React from 'react';
import { cn } from '../../utils/cn';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = '',
  siblingCount = 1 
}) => {
  if (totalPages <= 1) return null;

  const range = (start, end) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const paginationRange = () => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = range(1, leftItemCount);
      return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [1, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, '...', ...middleRange, '...', totalPages];
    }
  };

  const pages = paginationRange();

  return (
    <div className={cn("flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6 w-full max-w-full px-1", className)}>
      <button
        onClick={(e) => {
          e.preventDefault();
          onPageChange(currentPage - 1);
        }}
        disabled={currentPage === 1}
        className="px-3 py-2 sm:p-2 rounded-xl border border-border/60 dark:border-dark-border/40 bg-white dark:bg-dark-card text-text-secondary dark:text-dark-text-secondary hover:bg-primary/5 hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-dark-card disabled:hover:text-text-tertiary transition-all duration-300 active:scale-95 shadow-sm text-xs font-bold flex items-center gap-1 touch-target"
        aria-label="Trang trước"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="inline sm:hidden">Trước</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none px-1">
        {pages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-text-tertiary text-xs font-black">
                •••
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page);
                }}
                className={cn(
                  "min-w-[32px] h-8 sm:w-8 sm:h-8 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center tracking-tight",
                  currentPage === page 
                    ? "bg-primary text-white shadow-md shadow-primary/30 scale-105 z-10" 
                    : "bg-white dark:bg-dark-card border border-border/60 dark:border-dark-border/40 text-text-secondary dark:text-dark-text-secondary hover:bg-primary/5 hover:text-primary active:scale-95 shadow-sm"
                )}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          onPageChange(currentPage + 1);
        }}
        disabled={currentPage === totalPages}
        className="px-3 py-2 sm:p-2 rounded-xl border border-border/60 dark:border-dark-border/40 bg-white dark:bg-dark-card text-text-secondary dark:text-dark-text-secondary hover:bg-primary/5 hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-dark-card disabled:hover:text-text-tertiary transition-all duration-300 active:scale-95 shadow-sm text-xs font-bold flex items-center gap-1 touch-target"
        aria-label="Trang sau"
      >
        <span className="inline sm:hidden">Sau</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
