'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Register the service worker after the page loads
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New content is available - show update prompt
                  console.log('New version available. Refresh to update.');
                }
              });
            }
          });
        } catch (error) {
          console.error('Service worker registration failed:', error);
        }
      };

      // Delay registration to not block initial page load
      const timeoutId = setTimeout(registerSW, 1000);

      // Re-register on online event (user might have been offline during first attempt)
      window.addEventListener('online', registerSW);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('online', registerSW);
      };
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}
