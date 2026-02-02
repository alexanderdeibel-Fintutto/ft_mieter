import React, { useEffect } from 'react';

export default function AccessibilityHelper() {
  useEffect(() => {
    // Add keyboard shortcuts
    const handleKeyPress = (e) => {
      // Cmd/Ctrl + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Trigger search
        const searchInput = document.querySelector('[data-search-input]');
        if (searchInput) searchInput.focus();
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('[role="dialog"]');
        if (activeModal) {
          const closeBtn = activeModal.querySelector('[aria-label="Close"]');
          if (closeBtn) closeBtn.click();
        }
      }

      // Tab through buttons in modals
      if (e.key === 'Tab') {
        const activeModal = document.querySelector('[role="dialog"]');
        if (activeModal) {
          e.preventDefault();
          const buttons = Array.from(activeModal.querySelectorAll('button, [role="button"]'));
          const focusedIndex = buttons.indexOf(document.activeElement);
          const nextIndex = (focusedIndex + 1) % buttons.length;
          buttons[nextIndex].focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    // Ensure focus visible for keyboard navigation
    const style = document.createElement('style');
    style.textContent = `
      button:focus-visible,
      a:focus-visible,
      input:focus-visible,
      select:focus-visible,
      textarea:focus-visible {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
      }
      
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }

      /* High contrast mode support */
      @media (prefers-contrast: more) {
        * {
          border-width: 2px !important;
        }
      }

      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => document.head.removeChild(style);
  }, []);

  return null;
}