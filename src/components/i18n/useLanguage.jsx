import { useContext } from 'react';
import { LanguageContext } from './LanguageProvider';

export function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  const { language, setLanguage, translations } = context;

  // Function to get translation with nested keys (e.g., "auth.login")
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof value === 'string') {
      // Replace placeholders like {count} with values from params
      return value.replace(/{(\w+)}/g, (match, paramKey) => params[paramKey] ?? match);
    }

    console.warn(`Translation value is not a string: ${key}`);
    return key;
  };

  return {
    language,
    setLanguage,
    t,
    supportedLanguages: ['de', 'en', 'fr']
  };
}