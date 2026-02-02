import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ILLUSTRATIONS = {
  empty: '📭',
  search: '🔍',
  error: '⚠️',
  success: '✨',
  loading: '⏳',
  offline: '📡',
  access: '🔐',
  custom: null
};

export default function EmptyStateEnhanced({
  title,
  description,
  icon = 'empty',
  actionLabel,
  onAction,
  actionSecondary,
  onActionSecondary,
  className
}) {
  const illustration = typeof icon === 'string' ? ILLUSTRATIONS[icon] : icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {/* Illustration */}
      {illustration && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="text-6xl mb-6"
        >
          {illustration}
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-md space-y-3"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </motion.div>

      {/* Actions */}
      {(actionLabel || actionSecondary) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mt-8"
        >
          {actionLabel && (
            <Button
              onClick={onAction}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {actionLabel}
            </Button>
          )}

          {actionSecondary && (
            <Button
              onClick={onActionSecondary}
              variant="outline"
            >
              {actionSecondary}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// Error State
export function ErrorState({ title, description, onRetry }) {
  return (
    <EmptyStateEnhanced
      icon="error"
      title={title || 'Etwas ist schiefgelaufen'}
      description={description || 'Bitte versuchen Sie es später erneut'}
      actionLabel="Erneut versuchen"
      onAction={onRetry}
    />
  );
}

// Offline State
export function OfflineState() {
  return (
    <EmptyStateEnhanced
      icon="offline"
      title="Offline"
      description="Sie sind nicht mit dem Internet verbunden"
    />
  );
}

// No Results State
export function NoResultsState({ searchTerm }) {
  return (
    <EmptyStateEnhanced
      icon="search"
      title="Keine Ergebnisse"
      description={`Keine Treffer für "${searchTerm}" gefunden`}
    />
  );
}

// Success State
export function SuccessState({ title, description, actionLabel, onAction }) {
  return (
    <EmptyStateEnhanced
      icon="success"
      title={title || 'Erfolgreich!'}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
}