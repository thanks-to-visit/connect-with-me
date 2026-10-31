import React, { useEffect, useState } from 'react';
import { Home, ArrowLeft, Search, QrCode, Menu } from 'lucide-react';
import { ShareMenuDrawer } from '../whatsapp-qr/components/ShareMenuDrawer';

interface NotFoundPageProps {
  onGoHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome }) => {
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = '404 - Page Not Found | WhatsApp QR Code Generator';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <QrCode className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold text-slate-900 leading-tight block">
                WhatsApp QR Generator
              </span>
              <span className="text-xs text-slate-500 hidden sm:block">
                Free, scannable QR codes for WhatsApp chats
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsShareMenuOpen(true)}
            aria-label="Open menu and share app"
            aria-expanded={isShareMenuOpen}
            className="flex items-center gap-2 h-10 px-3 sm:px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
          >
            <Menu className="w-4 h-4 text-slate-700" />
            <span className="hidden xs:inline">Share App</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center flex flex-col items-center">
          {/* Badge */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-6">
            <span className="text-2xl font-black text-emerald-700 tracking-tight">404</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Page Not Found
          </h1>

          <p className="text-slate-600 text-sm leading-relaxed mb-8">
            The page you are looking for doesn&rsquo;t exist, was removed, or the link may be broken.
          </p>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onGoHome}
              className="flex-1 h-11 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
            >
              <Home className="w-4 h-4" />
              <span>Back to QR Generator</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  onGoHome();
                }
              }}
              className="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Additional Help Section */}
          <div className="w-full mt-8 pt-6 border-t border-slate-100 text-left">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Looking for something else?
            </span>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-emerald-600" />
                <span>Create a customized WhatsApp link with a phone number and message</span>
              </li>
              <li className="flex items-center gap-2">
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>Download a high-resolution 1024×1024 px PNG QR code</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} WhatsApp QR Generator • All rights reserved
        </div>
      </footer>

      {/* Share / Hamburger Menu Drawer */}
      <ShareMenuDrawer
        isOpen={isShareMenuOpen}
        onClose={() => setIsShareMenuOpen(false)}
        onNavigate={onGoHome}
      />
    </div>
  );
};
