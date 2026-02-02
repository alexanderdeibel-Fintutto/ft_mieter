import DOMPurify from 'dompurify';

// Input Sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

// Email Validation
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Phone Validation (German)
export const validatePhone = (phone) => {
  const regex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return regex.test(phone);
};

// IBAN Validation (German)
export const validateIBAN = (iban) => {
  const ibanRegex = /^DE\d{2}\d{8}\d{10}$/;
  return ibanRegex.test(iban.replace(/\s/g, ''));
};

// File Size Validation (in MB)
export const validateFileSize = (file, maxSizeMB) => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

// File Type Validation
export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

// CSRF Token Handler
export const getCsrfToken = () => {
  return localStorage.getItem('csrf_token') || '';
};

// Rate Limit Check
export const checkRateLimit = (key, maxRequests, timeWindowSeconds) => {
  const now = Date.now();
  const requests = JSON.parse(localStorage.getItem(`ratelimit_${key}`) || '[]');
  const recentRequests = requests.filter(t => now - t < timeWindowSeconds * 1000);

  if (recentRequests.length >= maxRequests) {
    return false;
  }

  recentRequests.push(now);
  localStorage.setItem(`ratelimit_${key}`, JSON.stringify(recentRequests));
  return true;
};