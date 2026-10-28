import React, { useState } from 'react';
import { Member, Trip } from '../types';
import { generateTripCode, MEMBER_AVATAR_PALETTE } from '../utils/format';
import { SUPPORTED_CURRENCIES } from '../utils/currency';
import { useAuth } from '../firebase/authContext';
import { 
  pickContactFromPhone, 
  isContactPickerSupported, 
  sanitizePhoneNumber,
  extractPhoneDigits
} from '../utils/contacts';
import { X, MapPin, Calendar, Users, Plus, Trash2, Globe, Smartphone } from 'lucide-react';

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (trip: Trip) => void;
}

export const TripModal: React.FC<TripModalProps> = ({
  isOpen,
  onClose,
  onCreateTrip,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0]
  );
  const [friends, setFriends] = useState<
    { name: string; upiId: string; phone?: string }[]
  >(() => [
    { 
      name: user?.displayName ? `${user.displayName} (You)` : 'You', 
      upiId: 'myupi@okhdfcbank',
      phone: user?.phoneNumber 
    },
    { name: 'Rahul', upiId: 'rahul@paytm' },
    { name: 'Pooja', upiId: 'pooja@icici' },
  ]);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendUpi, setNewFriendUpi] = useState('');
  const [newFriendPhone, setNewFriendPhone] = useState('');
  const [isPickingContact, setIsPickingContact] = useState(false);

  if (!isOpen) return null;

  const handlePickFromPhone = async () => {
    setIsPickingContact(true);
    try {
      const contact = await pickContactFromPhone();
      if (contact) {
        setFriends((prev) => [
          ...prev,
          {
            name: contact.name,
            upiId: contact.suggestedUpi,
            phone: contact.phone,
          },
        ]);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Could not pick contact:', err);
      }
    } finally {
      setIsPickingContact(false);
    }
  };

  const handleAddFriend = () => {
    if (!newFriendName.trim()) return;
    setFriends([
      ...friends,
      {
        name: newFriendName.trim(),
        upiId: newFriendUpi.trim() || `${newFriendName.toLowerCase().replace(/\s+/g, '')}@upi`,
        phone: newFriendPhone.trim() ? sanitizePhoneNumber(newFriendPhone) : undefined,
      },
    ]);
    setNewFriendName('');
    setNewFriendUpi('');
    setNewFriendPhone('');
  };

  const handleRemoveFriend = (index: number) => {
    if (friends.length <= 1) return;
    setFriends(friends.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !destination.trim() || friends.length === 0) return;

    const formattedMembers: Member[] = friends.map((f, i) => {
      const initials = f.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      return {
        id: `m-${Date.now()}-${i}`,
        name: f.name,
        upiId: f.upiId,
        avatarColor: MEMBER_AVATAR_PALETTE[i % MEMBER_AVATAR_PALETTE.length],
        initials: initials || 'FR',
        phone: f.phone,
      };
    });

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      name: name.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      currency,
      members: formattedMembers,
      inviteCode: generateTripCode(name.slice(0, 3)),
      createdAt: Date.now(),
    };

    onCreateTrip(newTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Create New Trip</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Plan and track group expenses in ₹ INR</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Trip Name & Destination */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Trip Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Manali Winter Trek, Rishikesh Camping, Goa 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Destination</label>
            <input
              type="text"
              required
              placeholder="e.g., Old Manali & Solang Valley"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Dates & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs px-2.5 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs px-2.5 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg"
              />
            </div>
          </div>

          {/* Currency Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Trip Base Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} ({c.symbol}) - {c.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              All balances, totals, and shares for this trip will be tracked in this currency.
            </p>
          </div>

          {/* Add Friends Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Trip Friends ({friends.length})</span>
              </label>

              <button
                type="button"
                onClick={handlePickFromPhone}
                disabled={isPickingContact}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
              >
                <Smartphone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{isPickingContact ? 'Picking...' : 'Pick from Contacts'}</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {friends.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <div className="truncate">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{f.name}</span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {f.upiId} {f.phone ? `• ${f.phone}` : ''}
                    </span>
                  </div>
                  {friends.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFriend(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Remove Friend"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Quick add friend inputs */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <input
                type="text"
                placeholder="Friend's Name"
                value={newFriendName}
                onChange={(e) => setNewFriendName(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg"
              />
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="UPI ID (e.g. name@upi)"
                  value={newFriendUpi}
                  onChange={(e) => setNewFriendUpi(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddFriend}
                  disabled={!newFriendName.trim()}
                  className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm cursor-pointer"
            >
              Start Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
