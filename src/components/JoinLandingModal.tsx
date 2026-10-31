import React from 'react';
import { Smartphone, Download, Globe, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { buildAndroidIntentUrl, PLAY_STORE_URL } from '../utils/invite';

interface JoinLandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  inviteCode: string;
  onContinueWeb: () => void;
}

export const JoinLandingModal: React.FC<JoinLandingModalProps> = ({
  isOpen,
  onClose,
  tripId,
  inviteCode,
  onContinueWeb,
}) => {
  if (!isOpen || !tripId || !inviteCode) return null;

  const androidIntentUrl = buildAndroidIntentUrl(tripId, inviteCode);
  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 text-center bg-gradient-to-b from-emerald-500/15 to-transparent border-b border-slate-100 dark:border-slate-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 mb-3">
            ₹
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            You're Invited to Join a Trip!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Split group expenses, manage kitty cash, and settle up via UPI with friends.
          </p>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">
          {/* Primary: Open App (triggers intent or redirects to Play Store) */}
          <a
            href={androidIntentUrl}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="leading-tight">Open in RupeeSplit App</div>
                <div className="text-[11px] text-emerald-100 font-normal">
                  Opens app or leads to Google Play Store
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* Secondary: Google Play Store Direct */}
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-xs transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-left">
                <div className="leading-tight">Install from Google Play Store</div>
                <div className="text-[11px] text-slate-400 font-normal">
                  com.rupeesplit.app (Android)
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* Tertiary: Continue on Web / PWA */}
          <button
            type="button"
            onClick={onContinueWeb}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-xs transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-left">
                <div className="leading-tight">Continue in Web Browser</div>
                <div className="text-[11px] text-slate-400 font-normal">
                  Sign in with Google to join instantly
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Real-time sync across Android app and web</span>
        </div>
      </div>
    </div>
  );
};
