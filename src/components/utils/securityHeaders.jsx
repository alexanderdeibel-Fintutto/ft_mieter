// Security Headers & CSRF Protection

// Get or Create CSRF Token
export const getOrCreateCsrfToken = () => {
  let token = localStorage.getItem('csrf_token');
  
  if (!token) {
    token = generateRandomToken();
    localStorage.setItem('csrf_token', token);
  }
  
  return token;
};

// Generate Random Token
const generateRandomToken = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Add CSRF Token to Request Headers
export const addCsrfHeader = (headers = {}) => {
  return {
    ...headers,
    'X-CSRF-Token': getOrCreateCsrfToken(),
  };
};

// Verify CSRF Token
export const verifyCsrfToken = (token) => {
  const stored = localStorage.getItem('csrf_token');
  return stored === token;
};

// Secure API Call Wrapper
export const secureApiCall = async (url, options = {}) => {
  const headers = addCsrfHeader(options.headers || {});
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies
    mode: 'same-origin', // Prevent CORS-based attacks
  });

  return response;
};

// Content Security Policy Compliant Script Execution
export const executeScriptSafely = (code, allowedOrigins = []) => {
  // Never use eval() - use Worker instead
  if (allowedOrigins.length === 0) {
    console.warn('executeScriptSafely: No allowed origins specified');
    return null;
  }

  const blob = new Blob([code], { type: 'application/javascript' });
  const worker = new Worker(URL.createObjectURL(blob));
  
  return worker;
};

// Encrypt Sensitive Data (Client-side)
export const encryptData = async (data, key) => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(JSON.stringify(data));
  
  const keyBuffer = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: encoder.encode('salt'), iterations: 100000, hash: 'SHA-256' },
    keyBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    derivedKey,
    dataBuffer
  );

  return {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted))
  };
};

// Secure Session Storage
export const secureSessionStorage = {
  set: (key, value) => {
    sessionStorage.setItem(key, JSON.stringify({
      value,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    }));
  },
  
  get: (key) => {
    const item = sessionStorage.getItem(key);
    if (!item) return null;

    const parsed = JSON.parse(item);
    
    // Validate user agent didn't change
    if (parsed.userAgent !== navigator.userAgent) {
      sessionStorage.removeItem(key);
      return null;
    }

    return parsed.value;
  },
  
  remove: (key) => {
    sessionStorage.removeItem(key);
  }
};

// Rate Limiting with Exponential Backoff
export const rateLimitWithBackoff = (() => {
  const attempts = new Map();

  return (key, maxAttempts = 5, baseDelayMs = 1000) => {
    const now = Date.now();
    const attempt = attempts.get(key) || { count: 0, lastAttempt: 0 };

    if (now - attempt.lastAttempt < (baseDelayMs * Math.pow(2, attempt.count))) {
      throw new Error(`Rate limited. Try again in ${(baseDelayMs * Math.pow(2, attempt.count)) / 1000}s`);
    }

    attempt.count = (attempt.count + 1) % maxAttempts;
    attempt.lastAttempt = now;
    attempts.set(key, attempt);

    return true;
  };
})();