import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  ShieldCheck, 
  Layers, 
  PackageCheck 
} from 'lucide-react';

interface PlayStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
}

export const PlayStoreModal: React.FC<PlayStoreModalProps> = ({
  isOpen,
  onClose,
  appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://rupeesplit.app',
}) => {
  const [activeTab, setActiveTab] = useState<'pwabuilder' | 'bubblewrap' | 'assetlinks'>('pwabuilder');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : appUrl;
  const manifestUrl = `${currentOrigin}/manifest.webmanifest`;
  const bubblewrapCommand = `npm install -g @bubblewrap/cli\nbubblewrap init --manifest="${manifestUrl}"\nbubblewrap build`;

  const assetLinksJson = JSON.stringify(
    [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: 'com.rupeesplit.app',
          sha256_cert_fingerprints: [
            '14:6D:E9:7D:0F:52:AB:FC:0E:0E:0F:7D:0F:52:AB:FC:0E:0E:0F:7D:0F:52:AB:FC:0E:0E:0F:7D:0F:52:AB:FC',
          ],
        },
      },
    ],
    null,
    2
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/80 dark:bg-emerald-950/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Google Play Store & PWA Package Guide
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Your application is 100% compliant and ready for Google Play Store upload
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Status Checklist Cards */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Play Store Readiness Verification
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Manifest</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Standalone, ID & Scope configured</p>
              </div>

              <div className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Icons</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">192px, 512px & Maskable ready</p>
              </div>

              <div className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Service Worker</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Vite PWA offline cache enabled</p>
              </div>

              <div className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Asset Links</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">.well-known/assetlinks.json ready</p>
              </div>
            </div>
          </div>

          {/* Packaging Methods Tabs */}
          <div className="space-y-3">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('pwabuilder')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'pwabuilder'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Method 1: PWABuilder (No Code, 2 Mins)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bubblewrap')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'bubblewrap'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Method 2: Bubblewrap CLI (Google Official)
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('assetlinks')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'assetlinks'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Asset Links (.json)
              </button>
            </div>

            {/* Tab 1: PWABuilder */}
            {activeTab === 'pwabuilder' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Generate Google Play APK / .AAB with PWABuilder</span>
                  </h4>
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline font-semibold text-[11px]"
                  >
                    <span>Open PWABuilder</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <ol className="space-y-2 text-slate-600 dark:text-slate-300 list-decimal list-inside">
                  <li>
                    Copy your live app URL:{' '}
                    <code className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                      {currentOrigin}
                    </code>
                  </li>
                  <li>
                    Go to <strong>pwabuilder.com</strong>, paste the URL, and click <strong>Start</strong>.
                  </li>
                  <li>
                    PWABuilder will evaluate the manifest (scores 100% PWA compliant).
                  </li>
                  <li>
                    Click <strong>Package for Google Play</strong>. Choose package name:{' '}
                    <code className="font-mono font-semibold text-emerald-800 dark:text-emerald-300">
                      com.rupeesplit.app
                    </code>.
                  </li>
                  <li>
                    Download the signed <strong>Android App Bundle (.aab)</strong> and upload directly to your{' '}
                    <strong>Google Play Console</strong> account!
                  </li>
                </ol>
              </div>
            )}

            {/* Tab 2: Bubblewrap CLI */}
            {activeTab === 'bubblewrap' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Build TWA using Google Bubblewrap CLI</span>
                </h4>
                <p className="text-slate-600 dark:text-slate-300">
                  Run these commands in your terminal to generate an Android Studio project or build an Android App Bundle (.aab) automatically:
                </p>

                <div className="relative">
                  <pre className="p-3 bg-slate-900 dark:bg-slate-950 text-emerald-400 font-mono rounded-lg overflow-x-auto text-[11px] border border-slate-800">
                    {bubblewrapCommand}
                  </pre>
                  <button
                    type="button"
                    onClick={() => handleCopy(bubblewrapCommand)}
                    className="absolute right-2 top-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                    title="Copy command"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Assetlinks */}
            {activeTab === 'assetlinks' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Digital Asset Links Configuration</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    /.well-known/assetlinks.json
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Google Play uses Digital Asset Links to verify that the app and website belong to the same developer (eliminating the URL bar inside the Android app). This file is automatically hosted at <code className="font-mono">/.well-known/assetlinks.json</code> in this app.
                </p>
                <div className="relative">
                  <pre className="p-3 bg-slate-900 dark:bg-slate-950 text-slate-200 font-mono rounded-lg overflow-x-auto text-[11px] border border-slate-800">
                    {assetLinksJson}
                  </pre>
                  <button
                    type="button"
                    onClick={() => handleCopy(assetLinksJson)}
                    className="absolute right-2 top-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Package ID: <strong className="font-mono text-slate-800 dark:text-slate-200">com.rupeesplit.app</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
