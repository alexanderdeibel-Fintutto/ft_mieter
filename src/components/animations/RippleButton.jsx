import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function RippleButton({
  children,
  className,
  rippleColor = 'rgba(255, 255, 255, 0.6)',
  ...props
}) {
  const [ripples, setRipples] = useState([]);

  const handleMouseDown = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = Date.now();

    const newRipple = { id, x, y, size };
    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  return (
    <Button
      {...props}
      className={cn('relative overflow-hidden', className)}
      onMouseDown={handleMouseDown}
    >
      {/* Ripples */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="animate-ripple absolute rounded-full pointer-events-none"
          style={{
            width: ripple.size,
            height: ripple.size,
            left: ripple.x,
            top: ripple.y,
            backgroundColor: rippleColor,
          }}
        />
      ))}

      {/* Content */}
      <span className="relative z-10">{children}</span>
    </Button>
  );
}