import React, { createContext, useState, useContext } from 'react';
import { de, en, fr } from './translations';

const LanguageContext = createContext();

const TRANSLATIONS = {
  de,
  en,
  fr,
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('de');

  const t = (key) => {
    const keys = key.split('.');
    let value = TRANSLATIONS[language];
    
    for (const k of keys) {
      value = value[k];
      if (!value) return key;
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}