import React, { useEffect } from 'react';

class AnalyticsTracker {
  constructor() {
    this.events = [];
    this.sessionStart = Date.now();
  }

  track(eventName, properties = {}) {
    const event = {
      name: eventName,
      properties,
      timestamp: Date.now(),
      sessionTime: Date.now() - this.sessionStart
    };
    this.events.push(event);

    if (typeof window !== 'undefined') {
      window.__analytics?.push(event);
      console.debug(`[Analytics] ${eventName}`, properties);
    }
  }

  trackPageView(pageName) {
    this.track('page_view', { page: pageName });
  }

  trackClick(elementName) {
    this.track('element_click', { element: elementName });
  }

  trackError(error) {
    this.track('error', { message: error.message, stack: error.stack });
  }

  trackConversion(type, value) {
    this.track('conversion', { type, value });
  }

  getEvents() {
    return this.events;
  }
}

const tracker = new AnalyticsTracker();

export function useAnalytics() {
  return tracker;
}

export function AnalyticsProvider({ children }) {
  useEffect(() => {
    window.__analytics = [];

    const handleClick = (e) => {
      const target = e.target;
      if (target.matches('button, a')) {
        tracker.trackClick(target.textContent?.trim() || target.id);
      }
    };

    document.addEventListener('click', handleClick);

    return () => document.removeEventListener('click', handleClick);
  }, []);

  return children;
}

export default tracker;