import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
        <Wifi className="w-4 h-4 text-emerald-200" />
        <span>Back online — Cloud sync restored!</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
      <WifiOff className="w-4 h-4 text-amber-200" />
      <span>Offline Mode — Local data is cached and available.</span>
    </div>
  );
};
