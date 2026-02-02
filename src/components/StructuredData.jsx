import { useEffect } from 'react';

export default function StructuredData() {
  useEffect(() => {
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebApplication",
          "@id": "https://mietrendite-rechner.fintutto.de/#app",
          "name": "FinTuttO Mietrendite-Rechner",
          "description": "Kostenloser Online-Rechner zur Berechnung der Mietrendite von Immobilien",
          "url": "https://mietrendite-rechner.fintutto.de/",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "127",
            "bestRating": "5",
            "worstRating": "1"
          },
          "author": {
            "@type": "Organization",
            "name": "FinTuttO GmbH",
            "url": "https://fintutto.de"
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Was ist die Bruttomietrendite?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Die Bruttomietrendite berechnet sich aus der Jahresmiete geteilt durch den Kaufpreis mal 100. Sie gibt einen ersten Überblick, berücksichtigt aber keine Nebenkosten oder Finanzierung."
              }
            },
            {
              "@type": "Question",
              "name": "Was ist eine gute Mietrendite?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Eine Bruttomietrendite ab 5% gilt als gut, ab 6% als sehr gut. Bei der Nettomietrendite sind Werte ab 3,5% akzeptabel und ab 4,5% gut. Die ideale Rendite hängt von Lage, Objektzustand und persönlicher Strategie ab."
              }
            },
            {
              "@type": "Question",
              "name": "Was ist der Unterschied zwischen Brutto- und Nettomietrendite?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Die Bruttomietrendite berücksichtigt nur Kaufpreis und Mieteinnahmen. Die Nettomietrendite zieht zusätzlich alle Kosten ab: Kaufnebenkosten, Hausgeld, Instandhaltung, Mietausfallrisiko und ggf. Finanzierungskosten."
              }
            },
            {
              "@type": "Question",
              "name": "Was ist die Eigenkapitalrendite?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Die Eigenkapitalrendite zeigt, wie viel Rendite du auf dein eingesetztes Eigenkapital erzielst. Durch den Hebeleffekt bei Finanzierung kann die EK-Rendite höher sein als die Objektrendite."
              }
            },
            {
              "@type": "Question",
              "name": "Wie hoch sind die Kaufnebenkosten?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Kaufnebenkosten betragen je nach Bundesland 7-15% des Kaufpreises. Sie setzen sich zusammen aus: Grunderwerbsteuer (3,5-6,5%), Notarkosten (~1,5%), Grundbuchkosten (~0,5%) und ggf. Maklergebühren (bis 7,14%)."
              }
            }
          ]
        },
        {
          "@type": "Organization",
          "@id": "https://fintutto.de/#organization",
          "name": "FinTuttO GmbH",
          "url": "https://fintutto.de",
          "logo": {
            "@type": "ImageObject",
            "url": "https://fintutto.de/logo.png"
          },
          "sameAs": [
            "https://www.linkedin.com/company/fintutto"
          ]
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "FinTuttO",
              "item": "https://fintutto.de"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Rechner",
              "item": "https://fintutto.de/rechner"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Mietrendite-Rechner",
              "item": "https://mietrendite-rechner.fintutto.de"
            }
          ]
        }
      ]
    });
    document.head.appendChild(schemaScript);

    return () => {
      if (schemaScript.parentNode) {
        schemaScript.parentNode.removeChild(schemaScript);
      }
    };
  }, []);

  return null;
}