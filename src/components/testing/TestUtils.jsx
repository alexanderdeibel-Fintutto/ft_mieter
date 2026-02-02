import React from 'react';

// Mock data generators
export const generateMockUser = (overrides = {}) => ({
  id: 'user_123',
  full_name: 'Max Mustermann',
  email: 'max@example.com',
  role: 'user',
  ...overrides
});

export const generateMockRepair = (overrides = {}) => ({
  id: 'repair_123',
  title: 'Wasserhahn tropft',
  description: 'Der Wasserhahn in der Küche tropft',
  status: 'pending',
  priority: 'medium',
  created_at: new Date().toISOString(),
  ...overrides
});

export const generateMockMessage = (overrides = {}) => ({
  id: 'msg_123',
  sender_id: 'user_456',
  content: 'Test message',
  is_read: false,
  created_at: new Date().toISOString(),
  ...overrides
});

// Test wrappers
export function TestWrapper({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {children}
    </div>
  );
}

// Debug component
export function DebugPanel({ data = {} }) {
  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 text-white p-4 rounded-lg max-w-xs max-h-64 overflow-auto font-mono text-xs z-50">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

// Performance monitoring
export function usePerformanceMonitor(componentName) {
  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    console.log(`${componentName} rendered in ${(endTime - startTime).toFixed(2)}ms`);
  };
}