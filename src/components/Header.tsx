import React, { useState, useRef, useEffect } from 'react';
import { Trip } from '../types';
import { SupportedLanguage, SUPPORTED_LANGUAGES, TranslationDictionary } from '../utils/i18n';
import { getCurrencyInfo } from '../utils/currency';
import { PWAInstallButton } from './PWAInstallButton';
import { useAuth } from '../firebase/authContext';
import { 
  Users, 
  Share2, 
  Download, 
  RotateCcw, 
  Plus, 
  MapPin, 
  Calendar, 
  Cloud, 
  LogIn,
  Globe,
  Smartphone,
  LogOut,
  ShieldCheck,
  Check,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentTrip: Trip;
  allTrips: Trip[];
  onSelectTrip: (tripId: string) => void;
  onOpenNewTripModal: () => void;
  onOpenJoinModal: () => void;
  onOpenInviteModal: () => void;
  onOpenExportModal: () => void;
  onOpenPlayStoreModal: () => void;
  onResetDemo: () => void;
  isCloudConnected: boolean;
  currentLanguage: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
}

export const Header: React.FC<HeaderProps> = ({
  currentTrip,
  allTrips,
  onSelectTrip,
  onOpenNewTripModal,
  onOpenJoinModal,
  onOpenInviteModal,
  onOpenExportModal,
  onOpenPlayStoreModal,
  onResetDemo,
  isCloudConnected,
  currentLanguage,
  onChangeLanguage,
  t,
}) => {
  const currencyInfo = getCurrencyInfo(currentTrip.currency || 'INR');
  const { user, signOutUser } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShareApp = async () => {
    const webUrl = typeof window !== 'undefined' ? window.location.origin : 'https://rupeesplit.app';
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.rupeesplit.app';
    const shareText = `Try RupeeSplit to track group trip expenses, split bills, and settle up easily.\n\nOpen the web app: ${webUrl}\nGet the Android app: ${playStoreUrl}`;

    setIsProfileMenuOpen(false);
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'RupeeSplit', text: shareText, url: playStoreUrl });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        window.alert('RupeeSplit app links copied. You can now share them with friends.');
      } else {
        window.prompt('Copy and share RupeeSplit:', shareText);
      }
    } catch (error) {
      // Ignore cancellation from the native share sheet; report other failures with a copy fallback.
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        try {
          await navigator.clipboard.writeText(shareText);
          window.alert('RupeeSplit app links copied. You can now share them with friends.');
        } catch {
          window.prompt('Copy and share RupeeSplit:', shareText);
        }
      }
    }
  };

  const userInitials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors">
      {/* Top 3-Zone Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 py-2 sm:min-h-16 sm:flex-nowrap sm:gap-3 sm:py-0">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {currencyInfo.symbol === '₹' ? '₹' : currencyInfo.symbol.slice(0, 2)}
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                RupeeSplit
              </span>
              <span className="hidden sm:inline-block text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 font-semibold px-2 py-0.5 rounded ml-2 border border-emerald-200 dark:border-emerald-800">
                {currencyInfo.flag} {currencyInfo.code}
              </span>
            </div>
          </div>

          {/* Zone 2: Trip Selector & Meta */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <select
                value={currentTrip.id}
                onChange={(e) => onSelectTrip(e.target.value)}
                className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer pr-7 max-w-[140px] sm:max-w-[220px] truncate"
              >
                {allTrips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenNewTripModal}
              title="Create New Trip"
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Zone 3: Actions, Dark Mode Toggle, Language Switcher, PWA & Logged-In User Profile */}
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5 sm:flex-none sm:flex-nowrap sm:gap-2">
            {/* Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center justify-center"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center">
              <select
                value={currentLanguage}
                onChange={(e) => onChangeLanguage(e.target.value as SupportedLanguage)}
                className="text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer pr-6 max-w-[110px] sm:max-w-[130px] truncate"
                title="Select Indian Language"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* In-App PWA Install & Play Store Ready Trigger */}
            <PWAInstallButton
              onOpenPlayStoreModal={onOpenPlayStoreModal}
              label={t.installApp}
            />

            <button
              onClick={onOpenJoinModal}
              title={t.joinTrip}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors whitespace-nowrap cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.joinTrip}</span>
            </button>

            <button
              onClick={onOpenInviteModal}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">{t.invite}</span>
            </button>

            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">{t.export}</span>
            </button>

            {/* User Profile & Permanent Session Menu */}
            {user && (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                  title={`${user.displayName} (${user.email}) - Always Logged In`}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      {userInitials}
                    </div>
                  )}
                  <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400 hidden sm:block mr-1" />
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 text-slate-800 dark:text-slate-200 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                            {userInitials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                            {user.displayName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Always Logged In Session Active</span>
                      </div>
                    </div>

                    <div className="p-1.5 space-y-1">
                      <button
                        onClick={handleShareApp}
                        className="w-full flex items-center gap-2 px-3 py-2 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors text-left font-medium"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share RupeeSplit app</span>
                      </button>

                      {/* Theme toggle option in menu */}
                      <button
                        onClick={() => {
                          toggleTheme();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          {isDark ? (
                            <Sun className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Moon className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>Theme</span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                          {theme}
                        </span>
                      </button>

                      <button
                        onClick={onResetDemo}
                        className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reset to Demo Trip</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          signOutUser();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors text-left font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Google</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-bar: Trip context metadata & quick stats */}
      <div className="bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center flex-wrap gap-3">
            <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="min-w-0 break-words">{currentTrip.destination}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {currentTrip.startDate} to {currentTrip.endDate}
              </span>
            </div>

            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded text-[11px]">
              <span>{currencyInfo.flag}</span>
              <span>{currencyInfo.code} ({currencyInfo.symbol})</span>
            </div>

            <div className="flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 text-[11px]">
              <Cloud className="w-3 h-3 text-emerald-600" />
              <span>{isCloudConnected ? 'Cloud Synced' : 'Connecting Cloud...'}</span>
            </div>
          </div>

          {/* Members preview */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5 overflow-hidden">
              {currentTrip.members.map((m) => (
                <div
                  key={m.id}
                  title={`${m.name} (${m.upiId}${m.phone ? ` • ${m.phone}` : ''})`}
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ring-2 ring-white dark:ring-slate-900 ${m.avatarColor}`}
                >
                  {m.initials}
                </div>
              ))}
            </div>
            <span className="text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap font-medium">
              {currentTrip.members.length} {t.friends.toLowerCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
