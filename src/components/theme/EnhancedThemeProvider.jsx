import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  colorScheme: 'default',
  fontSize: 'normal',
  setTheme: () => {},
  setColorScheme: () => {},
  setFontSize: () => {}
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within EnhancedThemeProvider');
  }
  return context;
};

export default function EnhancedThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('theme-preference');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [colorScheme, setColorSchemeState] = useState(() => {
    if (typeof window === 'undefined') return 'default';
    return localStorage.getItem('color-scheme') || 'default';
  });

  const [fontSize, setFontSizeState] = useState(() => {
    if (typeof window === 'undefined') return 'normal';
    return localStorage.getItem('font-size') || 'normal';
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme-preference', newTheme);
    applyTheme(newTheme);
  };

  const setColorScheme = (scheme) => {
    setColorSchemeState(scheme);
    localStorage.setItem('color-scheme', scheme);
    document.documentElement.setAttribute('data-color-scheme', scheme);
  };

  const setFontSize = (size) => {
    setFontSizeState(size);
    localStorage.setItem('font-size', size);
    document.documentElement.setAttribute('data-font-size', size);
    
    // Apply font size scaling
    const scales = {
      small: '0.875',
      normal: '1',
      large: '1.125',
      xlarge: '1.25'
    };
    document.documentElement.style.fontSize = `${scales[size] * 16}px`;
  };

  const applyTheme = (newTheme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (newTheme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      document.documentElement.setAttribute('data-theme', 'auto');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  useEffect(() => {
    applyTheme(theme);
    setColorScheme(colorScheme);
    setFontSize(fontSize);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (theme === 'auto') {
        applyTheme('auto');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, colorScheme, fontSize]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorScheme,
        fontSize,
        setTheme,
        setColorScheme,
        setFontSize
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}