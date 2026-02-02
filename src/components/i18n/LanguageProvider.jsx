import React, { createContext, useState, useEffect } from 'react';
import { translations } from './translations';

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Load from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_language');
      if (saved && Object.keys(translations).includes(saved)) {
        return saved;
      }
      
      // Detect browser language
      const browserLang = navigator.language?.split('-')[0];
      if (browserLang && Object.keys(translations).includes(browserLang)) {
        return browserLang;
      }
    }
    return 'de'; // Default to German
  });

  // Update localStorage when language changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_language', language);
      document.documentElement.lang = language;
    }
  }, [language]);

  const value = {
    language,
    setLanguage,
    translations,
    supportedLanguages: ['de', 'en', 'fr']
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}