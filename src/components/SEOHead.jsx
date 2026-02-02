import { useEffect } from 'react';

export default function SEOHead({ 
  title = "Mietrendite-Rechner 2026 | Kostenlos Rendite berechnen | FinTuttO",
  description = "Berechne kostenlos die Mietrendite deiner Immobilie. Brutto- & Netto-Rendite, Cashflow, Eigenkapitalrendite. Mit Finanzierungs-Simulation und PDF-Export.",
  canonical = "https://mietrendite-rechner.fintutto.de/",
  ogImage = "https://mietrendite-rechner.fintutto.de/og-image.png"
}) {
  useEffect(() => {
    // Set meta tags
    document.title = title;
    
    const setMeta = (name, content) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const setProperty = (property, content) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic Meta
    setMeta('description', description);
    setMeta('keywords', 'Mietrendite berechnen, Rendite Immobilie, Bruttomietrendite, Nettomietrendite, Eigenkapitalrendite, Cashflow Immobilie, Immobilien Rechner');
    setMeta('author', 'FinTuttO GmbH');
    setMeta('robots', 'index, follow');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', 'Mietrendite-Rechner | Kostenlos Rendite berechnen');
    setMeta('twitter:description', 'Berechne in 30 Sekunden, ob sich deine Immobilie lohnt.');
    setMeta('twitter:image', ogImage);

    // Canonical
    let canonical_link = document.querySelector('link[rel="canonical"]');
    if (!canonical_link) {
      canonical_link = document.createElement('link');
      canonical_link.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical_link);
    }
    canonical_link.setAttribute('href', canonical);

    // Open Graph
    setProperty('og:type', 'website');
    setProperty('og:url', canonical);
    setProperty('og:title', 'Mietrendite-Rechner | Kostenlos Rendite berechnen');
    setProperty('og:description', 'Berechne in 30 Sekunden, ob sich deine Immobilie lohnt. Brutto- & Netto-Rendite, Cashflow-Analyse, PDF-Export.');
    setProperty('og:image', ogImage);
    setProperty('og:image:width', '1200');
    setProperty('og:image:height', '630');
    setProperty('og:locale', 'de_DE');
    setProperty('og:site_name', 'FinTuttO');
  }, [title, description, canonical, ogImage]);

  return null;
}