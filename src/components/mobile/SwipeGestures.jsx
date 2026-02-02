import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export function SwipeableContainer({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50
}) {
  const [swipeStart, setSwipeStart] = useState(null);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    setSwipeStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e) => {
    if (!swipeStart) return;

    const deltaX = e.changedTouches[0].clientX - swipeStart.x;
    const deltaY = e.changedTouches[0].clientY - swipeStart.y;

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) onSwipeRight?.();
        else onSwipeLeft?.();
      }
    } else {
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) onSwipeDown?.();
        else onSwipeUp?.();
      }
    }

    setSwipeStart(null);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="touch-pan-x touch-pan-y"
    >
      {children}
    </div>
  );
}

// Swipe to Delete
export function SwipableItem({ children, onDelete, onEdit }) {
  const [isDragged, setIsDragged] = useState(false);
  const [dragX, setDragX] = useState(0);

  return (
    <motion.div
      drag="x"
      dragElastic={0.2}
      onDrag={(_, { offset }) => {
        setIsDragged(offset.x !== 0);
        setDragX(offset.x);
      }}
      onDragEnd={(_, { offset, velocity }) => {
        const swipe = offset.x + velocity.x * 10;
        
        if (swipe < -100) onDelete?.();
        else if (swipe > 100) onEdit?.();
        else setDragX(0);

        setIsDragged(false);
      }}
      className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden"
    >
      {/* Delete Action Background */}
      <div className="absolute inset-y-0 right-0 w-32 bg-red-500 flex items-center justify-end pr-4">
        <span className="text-white text-sm font-semibold">Löschen</span>
      </div>

      {/* Edit Action Background */}
      <div className="absolute inset-y-0 left-0 w-32 bg-blue-500 flex items-center justify-start pl-4">
        <span className="text-white text-sm font-semibold">Ändern</span>
      </div>

      {/* Content */}
      <div className="relative bg-white dark:bg-gray-800 shadow-md">
        {children}
      </div>
    </motion.div>
  );
}

// Pull to Refresh
export function PullToRefresh({ children, onRefresh }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setPullDistance(0);
    }
  };

  const handleTouchMove = (e) => {
    if (window.scrollY === 0) {
      const distance = e.touches[0].clientY;
      setPullDistance(Math.max(0, distance));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 80) {
      setIsRefreshing(true);
      await onRefresh?.();
      setIsRefreshing(false);
    }
    setPullDistance(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator */}
      <motion.div
        style={{
          height: pullDistance,
          opacity: pullDistance / 80,
        }}
        className="bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center overflow-hidden"
      >
        <motion.div
          animate={{
            rotate: isRefreshing ? 360 : (pullDistance / 80) * 180,
          }}
          transition={{ duration: 0.5 }}
          className="text-2xl"
        >
          ⬇️
        </motion.div>
      </motion.div>

      {/* Content */}
      {children}
    </div>
  );
}

// Page Swipe Navigation
export function SwipeNavigation({ currentPage, onPageChange }) {
  return (
    <SwipeableContainer
      onSwipeRight={() => onPageChange(-1)}
      onSwipeLeft={() => onPageChange(1)}
      threshold={50}
    >
      {currentPage}
    </SwipeableContainer>
  );
}