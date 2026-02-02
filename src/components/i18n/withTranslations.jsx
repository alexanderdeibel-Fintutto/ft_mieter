import React from 'react';
import { useLanguage } from './useLanguage';

// Higher-order component to inject translations
export function withTranslations(Component) {
  return function TranslatedComponent(props) {
    const { t, language, setLanguage } = useLanguage();
    return <Component {...props} t={t} language={language} setLanguage={setLanguage} />;
  };
}

// Hook wrapper for easier use
export function useTranslations() {
  const { t } = useLanguage();
  return { t };
}