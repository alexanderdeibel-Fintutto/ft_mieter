import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function EnhancedCard({
  children,
  className,
  header,
  title,
  icon,
  hoverEffect = 'lift',
  glowColor = 'blue',
  interactive = false,
  onClick,
  ...props
}) {
  const hoverClasses = {
    lift: 'hover:shadow-xl hover:-translate-y-1',
    glow: `hover:shadow-glow-${glowColor}`,
    scale: 'hover:scale-105',
    none: '',
  };

  const glowVariants = {
    blue: 'hover:shadow-glow-blue',
    green: 'hover:shadow-glow-green',
    red: 'hover:shadow-glow-red',
  };

  return (
    <Card
      className={cn(
        'transition-all duration-300',
        hoverClasses[hoverEffect],
        glowColor && glowVariants[glowColor],
        interactive && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {header || (title && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon && <span className="text-2xl">{icon}</span>}
            {title}
          </CardTitle>
        </CardHeader>
      ))}

      {children && (
        <CardContent>
          {children}
        </CardContent>
      )}
    </Card>
  );
}