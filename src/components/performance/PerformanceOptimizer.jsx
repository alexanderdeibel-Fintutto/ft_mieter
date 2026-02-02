import React, { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

// Image Lazy Loading
export function LazyImage({ src, alt, className, threshold = 0.1 }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageRef, setImageRef] = React.useState();

  useEffect(() => {
    let observer;

    if (imageRef && imageSrc === null) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold }
      );
      observer.observe(imageRef);
    }

    return () => observer?.disconnect();
  }, [imageRef, imageSrc, threshold, src]);

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}

// Debounced Callback
export function useDebounce(callback, delay = 300) {
  const timeoutRef = React.useRef();

  return React.useCallback((...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
}

// Throttled Callback
export function useThrottle(callback, delay = 300) {
  const lastCallRef = React.useRef(0);
  const timeoutRef = React.useRef();

  return React.useCallback((...args) => {
    const now = Date.now();

    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    } else {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        callback(...args);
      }, delay - (now - lastCallRef.current));
    }
  }, [callback, delay]);
}

// Virtual List (für lange Listen)
export function VirtualList({
  items = [],
  itemHeight = 50,
  containerHeight = 500,
  renderItem
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  return (
    <div
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      className="overflow-auto"
      style={{ height: containerHeight }}
    >
      <div style={{ height: items.length * itemHeight }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, idx) => (
            <div key={startIndex + idx} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + idx)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Memory Leak Detector
export function useMemoryMonitor(threshold = 100) {
  useEffect(() => {
    if (typeof window === 'undefined' || !performance.memory) return;

    const interval = setInterval(() => {
      const used = performance.memory.usedJSHeapSize / 1048576;
      if (used > threshold) {
        console.warn(`Memory usage high: ${used.toFixed(2)}MB`);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [threshold]);
}

// Component Memoization Helper
export const memoComponent = (Component, propsAreEqual) => {
  return React.memo(Component, propsAreEqual);
};