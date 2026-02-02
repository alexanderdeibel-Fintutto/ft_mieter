import React, { useEffect } from 'react';

/**
 * SEO Component for managing page metadata and structured data
 * Updates document head with meta tags and JSON-LD structured data
 */
export default function SEOHead({ 
  title,
  description,
  keywords = [],
  type = 'website', // website, profile, product, service, event
  image,
  url,
  structuredData,
  noIndex = false,
}) {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} | MieterApp`;
    }

    // Update or create meta tags
    const updateMeta = (name, content, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords.join(', '));
    
    // Open Graph tags
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:type', type, true);
    updateMeta('og:image', image, true);
    updateMeta('og:url', url || window.location.href, true);

    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);

    // Robots meta
    if (noIndex) {
      updateMeta('robots', 'noindex, nofollow');
    }

    // Structured Data (JSON-LD)
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    // Cleanup
    return () => {
      const script = document.querySelector('script[type="application/ld+json"]');
      if (script) script.remove();
    };
  }, [title, description, keywords, type, image, url, structuredData, noIndex]);

  return null; // This component doesn't render anything
}

/**
 * Generate structured data for a service/offer
 */
export function generateServiceStructuredData(service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: {
      '@type': 'Person',
      name: service.author,
    },
    areaServed: {
      '@type': 'Place',
      name: service.location || 'Nachbarschaft',
    },
    ...(service.price && {
      offers: {
        '@type': 'Offer',
        price: service.price.replace(/[^0-9.,]/g, ''),
        priceCurrency: 'EUR',
      },
    }),
    ...(service.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: service.rating,
        reviewCount: service.reviewCount || 1,
      },
    }),
  };
}

/**
 * Generate structured data for a person/profile
 */
export function generateProfileStructuredData(profile) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
    ...(profile.bio && { description: profile.bio }),
    ...(profile.skills && { 
      knowsAbout: profile.skills,
    }),
    ...(profile.address && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: profile.address,
      },
    }),
  };
}

/**
 * Generate structured data for an event
 */
export function generateEventStructuredData(event) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: `${event.date}T${event.time || '00:00'}`,
    location: {
      '@type': 'Place',
      name: event.location,
    },
    organizer: {
      '@type': 'Person',
      name: event.creator,
    },
    ...(event.maxParticipants && {
      maximumAttendeeCapacity: event.maxParticipants,
    }),
    ...(event.image && {
      image: event.image,
    }),
  };
}

/**
 * Generate structured data for a project
 */
export function generateProjectStructuredData(project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Project',
    name: project.title,
    description: project.description,
    ...(project.targetDate && {
      endDate: project.targetDate,
    }),
    ...(project.location && {
      location: {
        '@type': 'Place',
        name: project.location,
      },
    }),
    founder: {
      '@type': 'Person',
      name: project.creator,
    },
    member: project.participantNames?.map(name => ({
      '@type': 'Person',
      name,
    })),
  };
}