import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EnhancedFormInput({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  success,
  icon: Icon,
  required,
  disabled,
  maxLength,
  showCharCount,
  hint,
  validation,
  className
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationState, setValidationState] = useState(null);

  const handleChange = (e) => {
    onChange?.(e.target.value);

    if (validation) {
      const isValid = validation(e.target.value);
      setValidationState(isValid ? 'valid' : 'invalid');
    }
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const showValidationIcon = validationState === 'valid' || validationState === 'invalid';

  return (
    <div className="w-full space-y-2">
      {/* Label */}
      {label && (
        <motion.label
          animate={isFocused ? { y: -4, color: '#3B82F6' } : {}}
          transition={{ duration: 0.2 }}
          className={cn(
            'block text-sm font-medium transition-colors',
            isFocused ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300',
            disabled && 'text-gray-400'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </motion.label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon (Left) */}
        {Icon && (
          <motion.div
            animate={isFocused ? { scale: 1.1, color: '#3B82F6' } : {}}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors"
          >
            <Icon className="w-5 h-5" />
          </motion.div>
        )}

        {/* Input */}
        <motion.input
          type={inputType}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-3 rounded-lg border-2 transition-all',
            'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
            Icon && 'pl-10',
            showValidationIcon && 'pr-10',
            type === 'password' && 'pr-10',
            isFocused
              ? 'border-blue-500 shadow-lg shadow-blue-500/10'
              : 'border-gray-200 dark:border-gray-700',
            error && 'border-red-500 focus:ring-red-500/20',
            success && 'border-green-500 focus:ring-green-500/20',
            disabled && 'bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-50',
            className
          )}
          animate={isFocused ? { boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)' } : {}}
        />

        {/* Password Toggle */}
        {type === 'password' && (
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}

        {/* Validation Icons */}
        {showValidationIcon && type !== 'password' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              validationState === 'valid' ? 'text-green-500' : 'text-red-500'
            )}
          >
            {validationState === 'valid' ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </motion.div>
        )}
      </div>

      {/* Helpers */}
      <div className="flex items-center justify-between text-xs">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            'transition-colors',
            error && 'text-red-500',
            success && 'text-green-500',
            hint && !error && !success && 'text-gray-500 dark:text-gray-400'
          )}
        >
          {error || success || hint}
        </motion.span>

        {maxLength && showCharCount && (
          <span className="text-gray-500 dark:text-gray-400">
            {value?.length || 0} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

// Textarea with floating label
export function EnhancedFormTextarea({
  label,
  placeholder,
  value,
  onChange,
  error,
  rows = 4,
  maxLength,
  showCharCount,
  className
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className={cn(
          'block text-sm font-medium transition-colors',
          isFocused ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
        )}>
          {label}
        </label>
      )}

      <textarea
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          'w-full px-4 py-3 rounded-lg border-2 transition-all',
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
          isFocused
            ? 'border-blue-500 shadow-lg shadow-blue-500/10'
            : 'border-gray-200 dark:border-gray-700',
          error && 'border-red-500',
          'resize-vertical',
          className
        )}
      />

      {showCharCount && maxLength && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
          {value?.length || 0} / {maxLength}
        </div>
      )}
    </div>
  );
}