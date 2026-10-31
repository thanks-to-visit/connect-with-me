import React from 'react';
import { QrCode, Smartphone, MessageSquareQuote, Download } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[460px] h-full bg-slate-50/50 rounded-2xl border border-dashed border-slate-300 select-none">
      <div className="w-16 h-16 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mb-4 text-slate-400">
        <QrCode className="w-8 h-8 text-slate-400 stroke-[1.5]" />
      </div>

      <h3 className="text-base font-semibold text-slate-900 mb-1">
        Your QR Code will appear here
      </h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6">
        Enter your WhatsApp phone number and click &ldquo;Generate QR Code&rdquo; to preview and download.
      </p>

      {/* Feature perks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-sm text-left pt-2">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2.5">
          <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-medium text-slate-700">100% Scannable</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2.5">
          <MessageSquareQuote className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-medium text-slate-700">Custom message</span>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2.5">
          <Download className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-medium text-slate-700">1024px PNG</span>
        </div>
      </div>
    </div>
  );
};
