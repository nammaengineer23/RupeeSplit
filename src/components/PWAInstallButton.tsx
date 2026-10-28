import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

interface PWAInstallButtonProps {
  onOpenPlayStoreModal?: () => void;
  className?: string;
  label?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenPlayStoreModal,
  className = '',
  label = 'Install App',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone/PWA, optionally offer Play Store Package button
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span className="font-medium text-[11px]">Installed</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer ${className}`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Install RupeeSplit on iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                <li>
                  Tap the <strong>Share</strong> button (square with arrow) at the bottom of Safari.
                </li>
                <li>
                  Scroll down and tap <strong>Add to Home Screen</strong>.
                </li>
                <li>Tap <strong>Add</strong> in the top-right corner.</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-2 w-full rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback button to open Play Store / Package modal
  return (
    <button
      onClick={onOpenPlayStoreModal}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer ${className}`}
      title="Google Play Store & PWA Package Guide"
    >
      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
      <span>Play Store Ready</span>
    </button>
  );
};
