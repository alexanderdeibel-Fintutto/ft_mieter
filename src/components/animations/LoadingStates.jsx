import React from 'react';
import { cn } from '@/lib/utils';

// Shimmer Skeleton Loader
export function ShimmerSkeleton({ className }) {
  return (
    <div
      className={cn(
        'bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 animate-shimmer rounded',
        className
      )}
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite',
      }}
    />
  );
}

// Pulse Skeleton (für content-aware loading)
export function PulseSkeleton({ className, width = 'w-full', height = 'h-4' }) {
  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700 rounded animate-pulse',
        width,
        height,
        className
      )}
    />
  );
}

// Loading Card
export function LoadingCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4 shadow-md animate-fadeIn">
      <ShimmerSkeleton className="h-8 w-3/4" />
      <ShimmerSkeleton className="h-4 w-full" />
      <ShimmerSkeleton className="h-4 w-5/6" />
      <div className="pt-4 flex gap-3">
        <ShimmerSkeleton className="h-10 flex-1 rounded-lg" />
        <ShimmerSkeleton className="h-10 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

// Loading Grid
export function LoadingGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}

// Loading Spinner
export function LoadingSpinner({ size = 'md', label }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={cn(sizeClasses[size], 'animate-spin')}>
        <svg
          className="w-full h-full"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      {label && <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>}
    </div>
  );
}

// Loading Dots
export function LoadingDots() {
  return (
    <div className="flex gap-1 items-center">
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

// Progress Bar (für laden-prozess)
export function ProgressBar({ progress = 0, label }) {
  return (
    <div className="space-y-2">
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      {label && (
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>{label}</span>
          <span>{progress}%</span>
        </div>
      )}
    </div>
  );
}

// Skeleton Content Placeholder
export function SkeletonContent({ lines = 3 }) {
  return (
    <div className="space-y-3 animate-fadeIn">
      {Array.from({ length: lines }).map((_, i) => (
        <ShimmerSkeleton
          key={i}
          className={i === lines - 1 ? 'h-4 w-2/3' : 'h-4 w-full'}
        />
      ))}
    </div>
  );
}