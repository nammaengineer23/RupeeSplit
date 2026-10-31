import React, { useState, useEffect } from 'react';
import { Trip } from '../types';
import { QrCodeDisplay } from './QrCodeDisplay';
import {
  X,
  Copy,
  Check,
  Share2,
  Users,
  Smartphone,
  MessageCircle,
  ExternalLink,
  Download,
} from 'lucide-react';
import {
  buildTripInviteUrl,
  buildWhatsAppShareUrl,
  PLAY_STORE_URL,
} from '../utils/invite';
import { syncTripPhoneInvites } from '../firebase/service';
import { useAuth } from '../firebase/authContext';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  trip,
}) => {
  const { user } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen && trip) {
      // Automatically register any phone numbers present in trip members so friends can discover this trip
      syncTripPhoneInvites(trip, user?.displayName || 'Organizer').catch((e) =>
        console.warn('Could not auto-sync phone invites:', e)
      );
    }
  }, [isOpen, trip, user]);

  if (!isOpen) return null;

  // Clean public HTTPS invite URL (guaranteed never localhost)
  const inviteUrl = buildTripInviteUrl(trip.id, trip.inviteCode);
  const whatsappUrl = buildWhatsAppShareUrl(trip);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Join ${trip.name} on RupeeSplit`,
          text: `Join our group trip ${trip.name} (${trip.destination}) to split expenses:`,
          url: inviteUrl,
        });
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Invite Friends</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{trip.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* QR Code and Quick Scan */}
          <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Scan to Join Trip
            </span>
            <QrCodeDisplay value={inviteUrl} size={150} altText="Invite QR Code" />
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Friends can scan this QR code to join in app or browser
            </p>
          </div>

          {/* 1-Click WhatsApp Share Action */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md transition-all hover:shadow-lg cursor-pointer text-center group"
          >
            <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
            <span>Share Invite on WhatsApp</span>
          </a>

          {/* App / Play Store Notice Banner */}
          <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-300">
            <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Smart Deep Link: </span>
              <span>
                Friends with the RupeeSplit app open it directly. If the app is not installed, the link directs them to install from Google Play Store or join via Web.
              </span>
            </div>
          </div>

          {/* Shareable Link Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Clickable Public Invite Link
              </label>
              {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Other Apps</span>
                </button>
              )}
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl gap-2">
              <span className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate select-all">
                {inviteUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shrink-0 shadow-xs cursor-pointer transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
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

          {/* Joined Friends */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Joined Friends ({trip.members.length})</span>
              </span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {trip.members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${m.avatarColor}`}
                    >
                      {m.initials}
                    </div>
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{m.name}</span>
                      {m.phone && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          +91 {m.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{m.upiId}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
