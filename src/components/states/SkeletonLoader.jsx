import React from 'react';

export default function SkeletonLoader({ type = 'card', count = 1, className = '' }) {
  const skeletons = Array(count).fill(null);

  const CardSkeleton = () => (
    <div className={`bg-gray-200 dark:bg-gray-700 rounded-lg p-6 animate-pulse space-y-4 ${className}`}>
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
      </div>
      <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded mt-4"></div>
    </div>
  );

  const TableRowSkeleton = () => (
    <div className={`flex gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded mb-2 animate-pulse ${className}`}>
      <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
      </div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
    </div>
  );

  const ListItemSkeleton = () => (
    <div className={`flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded mb-2 animate-pulse ${className}`}>
      <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <CardSkeleton />;
      case 'table':
        return <TableRowSkeleton />;
      case 'list':
        return <ListItemSkeleton />;
      default:
        return <CardSkeleton />;
    }
  };

  return (
    <div>
      {skeletons.map((_, idx) => (
        <div key={idx}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}