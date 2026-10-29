import React, { useState } from 'react';
import { useAuth } from '../firebase/authContext';
import { 
  ShieldCheck, 
  Sparkles, 
  Smartphone, 
  QrCode, 
  Coins, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  ArrowRight
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, error, clearError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(true);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      // Error handled in auth context
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 text-white flex flex-col justify-center items-center px-4 py-8 sm:px-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* App Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-500/25 ring-4 ring-emerald-500/20">
            <span className="text-3xl font-black font-sans">₹</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
              <span>RupeeSplit</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold px-2 py-0.5 rounded-full">
                India
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xs mx-auto">
              Smart group travel expense manager with real-time sync & instant UPI settlements
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-base font-bold text-slate-100">Sign in to your account</h2>
            <p className="text-xs text-slate-400">
              Sign in once with Google. You will stay logged in always on this device.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
                <button
                  onClick={clearError}
                  className="block text-[11px] underline mt-1 text-rose-200 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Primary Action: Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-900 font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-150 disabled:opacity-75 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isSigningIn ? (
              <div className="w-5 h-5 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span className="text-sm">
              {isSigningIn ? 'Connecting with Google...' : 'Continue with Google'}
            </span>
          </button>

          {/* Stay Logged In Toggle */}
          <div className="flex items-center justify-between px-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={stayLoggedIn}
                onChange={(e) => setStayLoggedIn(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-600 text-emerald-600 focus:ring-emerald-500 bg-slate-700"
              />
              <span className="flex items-center gap-1 font-medium">
                <Lock className="w-3 h-3 text-emerald-400" />
                Keep me logged in always
              </span>
            </label>
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Persistent
            </span>
          </div>

        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-left text-xs">
          <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <QrCode className="w-3.5 h-3.5" />
              <span>UPI Settlements</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Direct GPay, PhonePe & Paytm links with QR code
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone Contacts</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Import friends from phonebook with auto UPI ID
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Coins className="w-3.5 h-3.5" />
              <span>Shared Kitty Pot</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Pre-pool cash for chai, tolls, snacks & fuel
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Multi-Device Sync</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Real-time Firestore sync across all trip members
            </p>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Your login token & trip data are securely stored</span>
        </div>
      </div>
    </div>
  );
};
