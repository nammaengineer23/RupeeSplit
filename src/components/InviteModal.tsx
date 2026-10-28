import React, { useState } from 'react';
import { Trip } from '../types';
import { QrCodeDisplay } from './QrCodeDisplay';
import { X, Copy, Check, Share2, Users, Smartphone } from 'lucide-react';

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
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?tripId=${encodeURIComponent(trip.id)}&code=${encodeURIComponent(trip.inviteCode)}`
    : `https://rupeesplit.app?tripId=${encodeURIComponent(trip.id)}&code=${encodeURIComponent(trip.inviteCode)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Invite Friends</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{trip.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
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
              Friends can scan this QR, sign in, and confirm before joining
            </p>
          </div>

          {/* Shareable Link */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Shareable Invite Link</label>
            <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg gap-2">
              <span className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate">{inviteUrl}</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shrink-0 shadow-xs"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Members Already in Trip */}
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
                  className="flex items-center justify-between p-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${m.avatarColor}`}
                    >
                      {m.initials}
                    </div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{m.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{m.upiId}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
