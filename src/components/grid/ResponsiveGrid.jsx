import React from 'react';
import { cn } from '@/lib/utils';

export function GridContainer({ children, className }) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4', className)}>
      {children}
    </div>
  );
}

export function GridItem({ children, span = 1, className }) {
  const spanClasses = {
    1: 'col-span-1',
    2: 'col-span-1 md:col-span-2',
    3: 'col-span-1 md:col-span-3',
    4: 'col-span-1 md:col-span-4'
  };

  return (
    <div className={cn(spanClasses[span], className)}>
      {children}
    </div>
  );
}

export function DashboardGrid({ children, className }) {
  return (
    <div className={cn('grid auto-rows-max gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className)}>
      {children}
    </div>
  );
}