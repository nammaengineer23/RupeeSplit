import React, { useState } from 'react';
import { TripInvite } from '../types';
import { MapPin, Calendar, Users, Check, X, Clock, ArrowRight, Sparkles } from 'lucide-react';

interface DiscoveredTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  invites: TripInvite[];
  onRequestJoin: (invite: TripInvite) => Promise<void>;
}

export const DiscoveredTripModal: React.FC<DiscoveredTripModalProps> = ({
  isOpen,
  onClose,
  invites,
  onRequestJoin,
}) => {
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || invites.length === 0) return null;

  const handleRequest = async (invite: TripInvite) => {
    setRequestingId(invite.id);
    setSuccessMsg(null);
    try {
      await onRequestJoin(invite);
      setSuccessMsg(`Join request sent to ${invite.organizerName}! Waiting for organizer approval.`);
    } catch (e: any) {
      alert(e?.message || 'Could not send join request.');
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-indigo-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Trips Found For Your Number
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Friends added your mobile number to these trips
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

        {/* List of Invites */}
        <div className="p-5 space-y-3">
          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <p className="text-xs text-slate-600 dark:text-slate-300">
            We discovered trips where you were added by friends. Request to join so the organizer can approve your access:
          </p>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {invites.map((invite) => {
              const isPending = invite.status === 'requested';

              return (
                <div
                  key={invite.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2.5 hover:border-emerald-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {invite.tripName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{invite.destination}</span>
                      </div>
                    </div>

                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      Organizer: {invite.organizerName}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                          <Clock className="w-3 h-3" />
                          Waiting for approval
                        </span>
                      ) : (
                        <span>Added as {invite.memberName || 'friend'}</span>
                      )}
                    </span>

                    {isPending ? (
                      <span className="px-3 py-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                        Request Sent
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRequest(invite)}
                        disabled={requestingId === invite.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <span>{requestingId === invite.id ? 'Sending...' : 'Request to Join'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
