import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Fade In Animation
export function FadeIn({ children, delay = 0, duration = 0.3, className }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide In From Bottom
export function SlideInUp({ children, delay = 0, duration = 0.3, distance = 20, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide In From Top
export function SlideInDown({ children, delay = 0, duration = 0.3, distance = 20, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale In
export function ScaleIn({ children, delay = 0, duration = 0.3, scale = 0.9, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger Container (für Listen)
export function StaggerContainer({ children, delay = 0, staggerDelay = 0.1 }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

// Stagger Item (mit Container nutzen)
export function StaggerItem({ children, className }) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hover Scale
export function HoverScale({ children, scale = 1.05, className }) {
  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hover Lift (shadow + translate)
export function HoverLift({ children, distance = 10, className }) {
  return (
    <motion.div
      whileHover={{
        y: -distance,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Rotate On Hover
export function HoverRotate({ children, rotation = 5, className }) {
  return (
    <motion.div
      whileHover={{ rotate: rotation }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Tab Switch Animation (für Tabs)
export function TabSwitchAnimation({ activeTab, children }) {
  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// Modal Animation
export function ModalAnimation({ isOpen, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.95, y: isOpen ? 0 : 20 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Slide In Sidebar
export function SidebarAnimation({ isOpen, children }) {
  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: isOpen ? 0 : -300, opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}