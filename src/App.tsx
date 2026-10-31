/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { ToastProvider } from './features/whatsapp-qr/components/ToastContext';
import { WhatsAppQrGenerator } from './features/whatsapp-qr/WhatsAppQrGenerator';
import { NotFoundPage } from './features/not-found/NotFoundPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  }, []);

  // Root or empty path -> main WhatsApp QR Generator app
  const isHome = currentPath === '/' || currentPath === '' || currentPath === '/index.html';

  return (
    <ToastProvider>
      {isHome ? (
        <WhatsAppQrGenerator onNavigate={navigate} />
      ) : (
        <NotFoundPage onGoHome={() => navigate('/')} />
      )}
    </ToastProvider>
  );
}
