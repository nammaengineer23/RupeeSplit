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
  ChevronRight,
  Sun,
  Moon,
  Settings,
  X
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
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

          {/* Zone 3: Actions, Quick Join, Theme, Consolidated Settings & User Profile */}
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:flex-none sm:gap-2">
            {/* Quick Join Trip Button */}
            <button
              onClick={onOpenJoinModal}
              title={t.joinTrip}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors whitespace-nowrap cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t.joinTrip}</span>
            </button>

            {/* Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Settings & Tools Dropdown Menu */}
            <div className="relative" ref={settingsMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(!isSettingsOpen);
                  setIsProfileMenuOpen(false);
                }}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center border shrink-0 ${
                  isSettingsOpen
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
                title="Settings, Language, Play Store & Sharing"
                aria-label="Settings, Language, Play Store & Sharing"
                aria-expanded={isSettingsOpen}
              >
                <Settings
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isSettingsOpen ? 'rotate-90 text-emerald-600 dark:text-emerald-400' : ''
                  }`}
                />
              </button>

              {/* Settings Dropdown Popover */}
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 text-slate-800 dark:text-slate-200 text-xs animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Popover Header */}
                  <div className="px-4 pb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Settings className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        Settings & Tools
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
                      aria-label="Close settings"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Optional Multi-Trip Switcher (only when user is in 2+ trips) */}
                  {allTrips.length > 1 && (
                    <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-800/40">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                        Switch Trip ({allTrips.length} Available)
                      </div>
                      <select
                        value={currentTrip.id}
                        onChange={(e) => {
                          onSelectTrip(e.target.value);
                          setIsSettingsOpen(false);
                        }}
                        className="w-full text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        title="Switch Active Trip"
                      >
                        {allTrips.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 1. Language Preference */}
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      <span>Language / भाषा</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                      Choose Indian regional or English interface
                    </p>
                    <div className="relative">
                      <select
                        value={currentLanguage}
                        onChange={(e) => {
                          onChangeLanguage(e.target.value as SupportedLanguage);
                        }}
                        className="w-full text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        title="Select Interface Language"
                      >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag} {lang.nativeName} ({lang.name})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 2. Play Store & Mobile App */}
                  <div className="px-4 py-3 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Mobile & Play Store
                    </div>

                    <PWAInstallButton
                      onOpenPlayStoreModal={() => {
                        setIsSettingsOpen(false);
                        onOpenPlayStoreModal();
                      }}
                      label={t.installApp}
                      className="w-full justify-center"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onOpenPlayStoreModal();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-750 transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            Google Play & App Package
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            Play Store bundle, APK & installation
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md shrink-0">
                        Ready
                      </span>
                    </button>
                  </div>

                  {/* 3. Share & Invite */}
                  <div className="px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                      Sharing & Invites
                    </div>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSettingsOpen(false);
                          onOpenInviteModal();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                            <Users className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {t.invite} Friends to Trip
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              Share secret link or join code
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsSettingsOpen(false);
                          handleShareApp();
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                            <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              Share RupeeSplit App
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              Send web & Play Store links
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    </div>
                  </div>

                  {/* 4. Download & Export */}
                  <div className="px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                      Data & Reports
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onOpenExportModal();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                          <Download className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {t.export} Data & Reports
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            Export Excel, CSV, PDF summary & backup
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  </div>

                  {/* 5. Demo Trip Reset */}
                  <div className="px-4 pt-2 pb-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onResetDemo();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reset to Demo Trip</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

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
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
            {/* Trip Name & Trip Dropdown Selector */}
            {allTrips.length > 1 ? (
              <div className="flex items-center gap-1">
                <select
                  value={currentTrip.id}
                  onChange={(e) => onSelectTrip(e.target.value)}
                  className="text-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer pr-6 max-w-[140px] sm:max-w-[200px] truncate shadow-2xs"
                  title="Switch Active Trip"
                >
                  {allTrips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={onOpenNewTripModal}
                  title="Create New Trip"
                  className="p-1 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-750 shadow-2xs text-xs">
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{currentTrip.name}</span>
                <button
                  type="button"
                  onClick={onOpenNewTripModal}
                  title="Create New Trip"
                  className="p-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Cloud Sync Status - beside Trip Name */}
            <div className="flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 text-[11px]">
              <Cloud className="w-3 h-3 text-emerald-600" />
              <span>{isCloudConnected ? 'Cloud Synced' : 'Connecting Cloud...'}</span>
            </div>

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
