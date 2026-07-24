import React from "react";

export default function PageSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse w-full max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-dark-card/40 p-4 rounded-2xl border border-border/40 dark:border-dark-border/40 backdrop-blur-md">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700/60 rounded-lg"></div>
          <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700/40 rounded-md"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700/60 rounded-xl"></div>
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700/60 rounded-xl"></div>
        </div>
      </div>

      {/* Cards Skeleton Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white/60 dark:bg-dark-card/60 border border-border/40 dark:border-dark-border/40 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700/50 rounded"></div>
              <div className="size-8 bg-gray-200 dark:bg-gray-700/60 rounded-xl"></div>
            </div>
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700/70 rounded-lg"></div>
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700/40 rounded"></div>
          </div>
        ))}
      </div>

      {/* Table / Main Content Skeleton */}
      <div className="bg-white/60 dark:bg-dark-card/60 rounded-2xl border border-border/40 dark:border-dark-border/40 p-6 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-border/30 dark:border-dark-border/30">
          <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700/60 rounded-md"></div>
          <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700/40 rounded-xl"></div>
        </div>
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="flex items-center justify-between py-2 gap-4">
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700/40 rounded"></div>
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700/50 rounded flex-1"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700/40 rounded"></div>
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700/60 rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
