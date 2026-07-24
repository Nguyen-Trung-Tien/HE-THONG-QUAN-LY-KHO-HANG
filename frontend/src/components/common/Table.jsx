import React from 'react';
import { cn } from '../../utils/cn';

const Table = ({ 
  columns, 
  data = [], 
  loading = false, 
  emptyMessage = 'Không có dữ liệu',
  rowKey = 'id'
}) => {
  return (
    <div className="w-full">
      {/* Mobile Card View (< 640px) */}
      <div className="block sm:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={`mobile-skeleton-${i}`} 
              className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-border/40 dark:border-dark-border/40 space-y-3 animate-pulse shadow-sm"
            >
              <div className="h-4 bg-bg-subtle dark:bg-white/5 rounded-lg w-2/3" />
              <div className="h-3 bg-bg-subtle dark:bg-white/5 rounded-lg w-1/2" />
              <div className="h-3 bg-bg-subtle dark:bg-white/5 rounded-lg w-3/4" />
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-dark-card border border-border/40 dark:border-dark-border/40 text-center opacity-50">
            <svg className="size-10 mx-auto mb-2 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H4a2 2 0 00-2 2v7m18 0a2 2 0 01-2 2H4a2 2 0 01-2-2" />
            </svg>
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-dark-text-secondary">{emptyMessage}</p>
          </div>
        ) : (
          data.map((row, rowIndex) => (
            <div 
              key={row[rowKey] || rowIndex}
              className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-border/50 dark:border-dark-border/40 shadow-soft-md hover:border-primary/40 transition-all duration-300 space-y-2.5 relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              
              {columns.map((column, colIndex) => {
                const cellValue = column.render ? column.render(row[column.key], row, rowIndex) : row[column.key];
                const title = column.title;

                // Action column or icon columns usually have empty/minimal title
                const isActionColumn = !title || title === '' || title === 'Thao tác' || title === 'Hành động';

                if (isActionColumn) {
                  return (
                    <div key={colIndex} className="pt-2 border-t border-border/30 dark:border-dark-border/30 flex items-center justify-end gap-2">
                      {cellValue}
                    </div>
                  );
                }

                return (
                  <div key={colIndex} className="flex items-center justify-between gap-x-2 text-xs">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-tertiary dark:text-dark-text-tertiary flex-shrink-0">
                      {title}
                    </span>
                    <div className="font-bold text-text-primary dark:text-dark-text-primary text-right truncate">
                      {cellValue}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Desktop / Tablet Tabular View (>= 640px) */}
      <div className="hidden sm:block w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-border/50 dark:border-dark-border/40 bg-white dark:bg-dark-card shadow-soft-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-bg-subtle/50 dark:from-white/[0.01] to-white dark:to-dark-card border-b border-border/40 dark:border-dark-border/40">
                {columns.map((column, index) => (
                  <th 
                    key={column.key || index}
                    className={cn(
                      "px-4 py-4 sm:px-6 sm:py-5 text-[10px] font-extrabold text-text-tertiary dark:text-dark-text-tertiary uppercase tracking-widest whitespace-nowrap",
                      column.className
                    )}
                  >
                    <div className="flex items-center gap-x-1.5">
                      <span>{column.title}</span>
                      <div className="size-1 rounded-full bg-primary/40" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 dark:divide-dark-border/40">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-row-${i}`} className="animate-pulse">
                    {columns.map((_, j) => (
                      <td key={`skeleton-cell-${j}`} className="px-4 py-4 sm:px-6 sm:py-5">
                        <div className="h-3.5 bg-bg-subtle dark:bg-white/[0.03] rounded-full w-full opacity-50" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length} 
                    className="px-6 py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-y-2.5 opacity-40">
                      <svg className="size-10 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H4a2 2 0 00-2 2v7m18 0a2 2 0 01-2 2H4a2 2 0 01-2-2" />
                      </svg>
                      <p className="text-xs font-bold uppercase tracking-widest text-text-secondary dark:text-dark-text-secondary">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr 
                    key={row[rowKey] || rowIndex} 
                    className="group hover:bg-primary/5 dark:hover:bg-white/[0.02] transition-all duration-200 cursor-default relative"
                  >
                    {columns.map((column, colIndex) => (
                      <td 
                        key={colIndex} 
                        className={cn(
                          "px-4 py-4 sm:px-6 sm:py-5 text-xs font-bold text-text-primary dark:text-dark-text-primary transition-all duration-200 group-hover:translate-x-0.5",
                          column.className
                        )}
                      >
                        {/* Left highlight indicator */}
                        {colIndex === 0 && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center" />
                        )}
                        {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;
