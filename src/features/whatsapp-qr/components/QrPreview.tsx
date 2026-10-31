import React, { useState } from 'react';
import { Download, ExternalLink, Copy, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { downloadDataUrl } from '../lib/download';
import { copyText } from '../lib/clipboard';
import { useToast } from './ToastContext';

export interface QrSnapshot {
  url: string;
  dataUrl: string;
  phoneDisplay: string;
  digits: string;
  message: string;
}

interface QrPreviewProps {
  snapshot: QrSnapshot;
  isStale: boolean;
  onRegenerate?: () => void;
}

export const QrPreview: React.FC<QrPreviewProps> = ({ snapshot, isStale, onRegenerate }) => {
  const { showToast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isMessageExpanded, setIsMessageExpanded] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const filename = `whatsapp-qr-${snapshot.digits}.png`;
      await downloadDataUrl(snapshot.dataUrl, filename);
      showToast({
        id: 'toast-download-completed',
        variant: 'success',
        message: 'QR code downloaded successfully!',
      });
    } catch {
      showToast({
        id: 'toast-generation-failed',
        variant: 'error',
        message: 'Unable to download QR code. Please try again.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyText(snapshot.url);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      showToast({
        id: 'toast-link-copied',
        variant: 'success',
        message: 'WhatsApp link copied to clipboard!',
      });
    } else {
      showToast({
        id: 'toast-clipboard-failed',
        variant: 'error',
        message: 'Unable to copy the link. Please try again.',
      });
    }
  };

  const handleTestLink = () => {
    try {
      const newTab = window.open(snapshot.url, '_blank', 'noopener,noreferrer');
      // If popup was blocked or opened in a restricted context
      if (!newTab && typeof window !== 'undefined') {
        showToast({
          id: 'toast-test-link-blocked',
          variant: 'info',
          message: 'Popup blocked. Click "Copy link" to open directly in your browser.',
        });
      }
    } catch {
      showToast({
        id: 'toast-test-link-blocked',
        variant: 'info',
        message: 'Unable to open tab automatically. Please use the Copy link option.',
      });
    }
  };

  const isLongMessage = snapshot.message.length > 90 || snapshot.message.includes('\n');

  return (
    <div className="flex flex-col items-center bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative transition-all duration-300">
      {/* Stale State Banner */}
      {isStale && (
        <div
          role="status"
          className="w-full mb-4 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs gap-2"
        >
          <div className="flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
            <span>Form inputs changed. Preview is out of date.</span>
          </div>
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="px-2.5 py-1 text-xs font-semibold bg-amber-200/80 hover:bg-amber-300 rounded-lg text-amber-900 transition-colors shrink-0"
            >
              Update QR
            </button>
          )}
        </div>
      )}

      {/* QR Code Container with Quiet Zone */}
      <div className="w-full max-w-[280px] sm:max-w-[320px] bg-white p-4 sm:p-5 rounded-2xl shadow-inner border border-slate-200/80 flex flex-col items-center justify-center">
        <img
          src={snapshot.dataUrl}
          alt={`WhatsApp QR code to start a conversation with ${snapshot.phoneDisplay}`}
          className="w-full h-auto aspect-square object-contain rounded-lg select-none"
          loading="eager"
        />
      </div>

      {/* Scannable instruction */}
      <p className="text-xs font-medium text-slate-500 mt-3 text-center">
        Scan to start a WhatsApp conversation.
      </p>

      {/* Formatted Phone Number */}
      <div className="mt-2 text-center">
        <span className="text-base font-bold text-slate-900 tracking-tight">
          {snapshot.phoneDisplay}
        </span>
      </div>

      {/* Message Preview */}
      {snapshot.message && (
        <div className="w-full mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
            <span>Pre-filled text</span>
            {isLongMessage && (
              <button
                type="button"
                onClick={() => setIsMessageExpanded((prev) => !prev)}
                className="text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
              >
                {isMessageExpanded ? (
                  <>
                    <span>Collapse</span>
                    <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    <span>Expand</span>
                    <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </div>
          <p
            className={`whitespace-pre-wrap break-words leading-relaxed ${
              !isMessageExpanded && isLongMessage ? 'line-clamp-2' : ''
            }`}
          >
            {snapshot.message}
          </p>
        </div>
      )}

      {/* Generated Link Field */}
      <div className="w-full mt-4 flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-transparent">
        <input
          type="text"
          readOnly
          value={snapshot.url}
          aria-label="Generated WhatsApp URL"
          className="flex-1 px-3 py-2 text-xs text-slate-700 bg-transparent border-none focus:outline-none select-all truncate font-mono"
        />
        <button
          type="button"
          onClick={handleCopyLink}
          title="Copy WhatsApp link"
          aria-label="Copy WhatsApp link"
          className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors flex items-center gap-1 text-xs font-medium border-l border-slate-200"
        >
          {isCopied ? (
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

      {/* Action Buttons */}
      <div className="w-full grid grid-cols-2 gap-2.5 mt-4">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="h-11 px-4 flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all disabled:opacity-60 shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Downloading...' : 'Download PNG'}</span>
        </button>

        <button
          type="button"
          onClick={handleTestLink}
          className="h-11 px-4 flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 transition-all shadow-xs cursor-pointer"
        >
          <ExternalLink className="w-4 h-4 text-slate-600" />
          <span>Test Chat Link</span>
        </button>
      </div>

      {/* Resolution info */}
      <div className="mt-3 text-[11px] text-slate-400 text-center">
        Exports at 1024 × 1024 px PNG • Level M Error Correction
      </div>
    </div>
  );
};
