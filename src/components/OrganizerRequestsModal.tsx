import React, { useState } from 'react';
import { Trip, TripInvite } from '../types';
import { Check, X, Users, UserPlus, AlertCircle, Clock } from 'lucide-react';

interface OrganizerRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: TripInvite[];
  trips: Trip[];
  onAccept: (trip: Trip, invite: TripInvite) => Promise<void>;
  onReject: (invite: TripInvite) => Promise<void>;
}

export const OrganizerRequestsModal: React.FC<OrganizerRequestsModalProps> = ({
  isOpen,
  onClose,
  requests,
  trips,
  onAccept,
  onReject,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!isOpen || requests.length === 0) return null;

  const handleAccept = async (invite: TripInvite) => {
    const targetTrip = trips.find((t) => t.id === invite.tripId);
    if (!targetTrip) {
      alert('Associated trip was not found in your account.');
      return;
    }
    setProcessingId(invite.id);
    try {
      await onAccept(targetTrip, invite);
    } catch (e: any) {
      alert(e?.message || 'Failed to accept request.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (invite: TripInvite) => {
    setProcessingId(invite.id);
    try {
      await onReject(invite);
    } catch (e: any) {
      alert(e?.message || 'Failed to reject request.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-amber-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Pending Join Requests ({requests.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Friends asking to join your trips
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

        {/* Requests List */}
        <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {req.requestedByName || req.memberName || 'Friend'}
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                    +91 {req.phoneNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Requested to join: <span className="font-semibold text-slate-700 dark:text-slate-300">{req.tripName}</span>
                </p>
                {req.requestedByEmail && (
                  <p className="text-[11px] text-slate-400 truncate">
                    {req.requestedByEmail}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={processingId === req.id}
                  onClick={() => handleReject(req)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Reject
                </button>

                <button
                  type="button"
                  disabled={processingId === req.id}
                  onClick={() => handleAccept(req)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{processingId === req.id ? 'Adding...' : 'Accept & Add'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
