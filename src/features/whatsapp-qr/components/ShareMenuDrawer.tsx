import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Share2,
  Mail,
  Copy,
  Check,
  Download,
  ExternalLink,
  MessageCircle,
  Home,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { copyText } from '../lib/clipboard';
import { useToast } from './ToastContext';

interface ShareMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

export const APP_URL = 'https://connect-with-me.ai.studio/';
export const APP_QR_IMAGE = '/assets/aistudio/Untitled_1__1__68c8db33.png';

export const ShareMenuDrawer: React.FC<ShareMenuDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCopyLink = async () => {
    const success = await copyText(APP_URL);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast({
        id: 'toast-app-link-copied',
        variant: 'success',
        message: 'App link copied to clipboard!',
      });
    } else {
      showToast({
        id: 'toast-app-link-copy-failed',
        variant: 'error',
        message: 'Unable to copy the link. Please try again.',
      });
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Create and share custom WhatsApp chat QR codes with this free web tool: ${APP_URL}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareEmail = () => {
    const subject = 'WhatsApp QR Code Generator';
    const body = `Hey,\n\nCheck out WhatsApp QR Code Generator: Create scannable QR codes for WhatsApp chats with custom pre-filled messages.\n\nLink: ${APP_URL}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'WhatsApp QR Code Generator',
          text: 'Create and share scannable QR codes for WhatsApp chats effortlessly.',
          url: APP_URL,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = APP_QR_IMAGE;
    link.download = 'whatsapp-qr-generator-app.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      id: 'toast-share-qr-downloaded',
      variant: 'success',
      message: 'App QR code downloaded!',
    });
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-drawer-title"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-slate-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="share-drawer-title" className="text-base font-bold text-slate-900">
                Share This App
              </h2>
              <p className="text-xs text-slate-500">Scan QR or share link with friends</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-5 flex flex-col gap-6 flex-1">
          {/* QR Code Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Scan to open on phone
            </span>

            {/* Uploaded App QR Code Image */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm max-w-[200px] w-full">
              <img
                src={APP_QR_IMAGE}
                alt="QR Code to open WhatsApp QR Generator"
                className="w-full h-auto aspect-square object-contain rounded-lg select-none"
              />
            </div>

            <p className="text-xs text-slate-600 font-medium mt-3 max-w-[240px]">
              Scan with your phone&rsquo;s camera to open this app anytime.
            </p>

            <button
              type="button"
              onClick={handleDownloadQr}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download App QR Code</span>
            </button>
          </div>

          {/* Quick Share Options */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Share via
            </span>

            {/* Share via WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full h-11 px-4 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-emerald-900 font-semibold text-sm flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-5 h-5 text-[#25D366] fill-[#25D366]/20" />
                <span>Share via WhatsApp</span>
              </div>
              <ExternalLink className="w-4 h-4 text-emerald-700" />
            </button>

            {/* Share via Email */}
            <button
              type="button"
              onClick={handleShareEmail}
              className="w-full h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-slate-600" />
                <span>Share via Email</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </button>

            {/* Native Share on supported devices */}
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Share2 className="w-5 h-5 text-slate-600" />
                  <span>More Sharing Options...</span>
                </div>
              </button>
            )}
          </div>

          {/* App URL Link Card */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              App Link
            </span>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600">
              <input
                type="text"
                readOnly
                value={APP_URL}
                aria-label="Application URL"
                className="flex-1 px-3 py-2 text-xs text-slate-700 bg-transparent border-none focus:outline-none select-all truncate font-mono"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 border-l border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          {onNavigate && (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Navigation
              </span>

              <button
                type="button"
                onClick={() => {
                  onNavigate('/');
                  onClose();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors text-left cursor-pointer"
              >
                <Home className="w-4 h-4 text-emerald-600" />
                <span>QR Generator Home</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onNavigate('/404');
                  onClose();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors text-left cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>404 Error Page Preview</span>
              </button>
            </div>
          )}

          {/* Privacy Note */}
          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Client-Side • No personal data stored</span>
          </div>
        </div>
      </div>
    </div>
  );
};
