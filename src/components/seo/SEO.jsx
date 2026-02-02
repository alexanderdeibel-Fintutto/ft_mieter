import React from 'react';

export function SEOHead({
  title = 'Mieterapp',
  description = 'Die einfache Lösung für Mieter',
  image = 'https://mieterapp.de/og-image.png',
  url = 'https://mieterapp.de',
  type = 'website'
}) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical */}
      <link rel="canonical" href={url} />

      {/* Preload */}
      <link rel="preload" as="image" href={image} />
    </>
  );
}

export function StructuredData({ type = 'Organization', data = {} }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}