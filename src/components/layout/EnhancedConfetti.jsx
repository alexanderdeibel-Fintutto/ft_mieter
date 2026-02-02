import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export function TriggerConfetti({
  type = 'default',
  duration = 2000
}) {
  useEffect(() => {
    const configs = {
      default: {
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      },
      success: {
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#22C55E', '#34D399', '#86EFAC']
      },
      celebration: {
        particleCount: 200,
        spread: 180,
        origin: { y: 0.5 }
      },
      fireworks: {
        particleCount: 100,
        spread: 360,
        ticks: 50
      }
    };

    const config = configs[type] || configs.default;
    confetti(config);

    if (duration) {
      setTimeout(() => confetti.reset(), duration);
    }
  }, [type, duration]);

  return null;
}

export function ConfettiExplosion() {
  useEffect(() => {
    const end = Date.now() + 1000;

    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 50,
        spread: Math.random() * 360,
        origin: {
          x: Math.random(),
          y: Math.random() * 0.5
        }
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return null;
}