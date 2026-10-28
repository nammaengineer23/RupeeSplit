import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { 
  pickContactFromPhone, 
  isContactPickerSupported, 
  sanitizePhoneNumber, 
  generateUpiSuggestions,
  POPULAR_UPI_HANDLES,
  extractPhoneDigits
} from '../utils/contacts';
import { X, Smartphone, User, Phone, QrCode, Check, AlertCircle } from 'lucide-react';

interface EditFriendModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onSave: (updatedMember: Member) => void;
}

export const EditFriendModal: React.FC<EditFriendModalProps> = ({
  isOpen,
  member,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setPhone(member.phone || '');
      setUpiId(member.upiId || '');
      setError(null);
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handlePickContact = async () => {
    setError(null);
    setIsPicking(true);
    try {
      const contact = await pickContactFromPhone();
      if (contact) {
        if (contact.name) setName(contact.name);
        if (contact.phone) setPhone(contact.phone);
        if (contact.suggestedUpi) setUpiId(contact.suggestedUpi);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Could not access phone contacts. You can enter details manually.');
      }
    } finally {
      setIsPicking(false);
    }
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    // If UPI ID is empty or default, suggest one from phone digits
    const digits = extractPhoneDigits(val);
    if (digits.length >= 10 && (!upiId || upiId.includes('@upi') || upiId.includes('@paytm'))) {
      setUpiId(`${digits}@paytm`);
    }
  };

  const handleApplyHandle = (handle: string) => {
    const base = upiId.split('@')[0] || (phone ? extractPhoneDigits(phone) : name.toLowerCase().replace(/\s+/g, ''));
    setUpiId(`${base || 'friend'}${handle}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name');
      return;
    }

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const updated: Member = {
      ...member,
      name: name.trim(),
      phone: phone.trim() ? sanitizePhoneNumber(phone) : undefined,
      upiId: upiId.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@upi`,
      initials: initials || member.initials,
    };

    onSave(updated);
    onClose();
  };

  const suggestions = generateUpiSuggestions(name, phone);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-1 ring-white dark:ring-slate-800 ${member.avatarColor}`}>
              {member.initials}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Edit Friend Details</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update Name, Phone & UPI ID for settlements</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Contact Picker Trigger Button */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-emerald-950 dark:text-emerald-100 block">
                  Select Contact from Phone
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block truncate">
                  Auto-fill name, phone & UPI ID from address book
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePickContact}
              disabled={isPicking}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-2xs cursor-pointer"
            >
              {isPicking ? 'Opening...' : 'Pick Contact'}
            </button>
          </div>

          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Mobile Phone Number</span>
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* UPI ID Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>UPI ID for Repayments</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 9876543210@paytm or rahul@oksbi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {/* Quick UPI Handle Chips */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                Quick handles:
              </span>
              <div className="flex flex-wrap gap-1">
                {POPULAR_UPI_HANDLES.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleApplyHandle(h)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested UPI IDs based on contact name/phone */}
            {suggestions.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                  Suggested for this contact:
                </span>
                <div className="flex flex-wrap gap-1">
                  {suggestions.slice(0, 3).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setUpiId(s)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Update Friend</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
