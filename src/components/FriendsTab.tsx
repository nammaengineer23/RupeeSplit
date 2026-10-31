import React, { useState } from 'react';
import { Member, MemberBalance } from '../types';
import { formatMoney, MEMBER_AVATAR_PALETTE } from '../utils/format';
import { getCurrencyInfo } from '../utils/currency';
import { TranslationDictionary } from '../utils/i18n';
import { 
  pickContactFromPhone, 
  isContactPickerSupported, 
  generateUpiSuggestions,
  POPULAR_UPI_HANDLES,
  extractPhoneDigits
} from '../utils/contacts';
import { EditFriendModal } from './EditFriendModal';
import { 
  Users, 
  Plus, 
  Share2, 
  Copy, 
  Check, 
  Trash2, 
  Smartphone,
  Pencil,
  Phone,
  QrCode,
  Info,
  RotateCcw
} from 'lucide-react';

interface FriendsTabProps {
  members: Member[];
  balances: Record<string, MemberBalance>;
  inviteCode: string;
  onAddMember: (member: Member) => void;
  onUpdateMember: (member: Member) => void;
  onRemoveMember: (memberId: string) => void;
  onReactivateMember?: (memberId: string) => void;
  onOpenInviteModal: () => void;
  onOpenUpiForMember: (member: Member) => void;
  currentUserId?: string;
  currentUserPhone?: string;
  currency?: string;
  t?: TranslationDictionary;
}

export const FriendsTab: React.FC<FriendsTabProps> = ({
  members,
  balances,
  inviteCode,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
  onReactivateMember,
  onOpenInviteModal,
  onOpenUpiForMember,
  currentUserId,
  currentUserPhone,
  currency = 'INR',
  t,
}) => {
  const currInfo = getCurrencyInfo(currency);
  const formatPrice = (amt: number) => formatMoney(amt, currency);

  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [phone, setPhone] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isPickingContact, setIsPickingContact] = useState(false);
  const [contactPickerNotice, setContactPickerNotice] = useState<string | null>(null);

  // Edit Friend Modal State
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const activeMembers = members.filter((m) => !m.isArchived);
  const archivedMembers = members.filter((m) => m.isArchived);

  const isMemberSelf = (m: Member): boolean => {
    if (m.isCurrentUser) return true;
    if (currentUserId && m.uid && m.uid === currentUserId) return true;
    if (currentUserPhone && m.phone) {
      const p1 = extractPhoneDigits(m.phone);
      const p2 = extractPhoneDigits(currentUserPhone);
      if (p1 && p2 && p1 === p2) return true;
    }
    const lower = m.name.toLowerCase();
    return lower.includes('(you)') || lower === 'you';
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Pick Contact from Device Address Book
  const handlePickFromPhone = async () => {
    setContactPickerNotice(null);
    setIsPickingContact(true);
    try {
      const contact = await pickContactFromPhone();
      if (contact) {
        setName(contact.name);
        setPhone(contact.phone);
        setUpiId(contact.suggestedUpi);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        if (!isContactPickerSupported()) {
          setContactPickerNotice(
            'Contact Picker is available on mobile browsers (Android Chrome, PWA). On desktop, enter details manually.'
          );
        } else {
          setContactPickerNotice('Contact selection cancelled or not permitted.');
        }
      }
    } finally {
      setIsPickingContact(false);
    }
  };

  const handlePhoneInputChange = (val: string) => {
    setPhone(val);
    const digits = extractPhoneDigits(val);
    if (digits.length >= 10 && (!upiId || upiId.includes('@upi') || upiId.includes('@paytm'))) {
      setUpiId(`${digits}@paytm`);
    }
  };

  const handleApplyHandle = (handle: string) => {
    const base = upiId.split('@')[0] || (phone ? extractPhoneDigits(phone) : name.toLowerCase().replace(/\s+/g, ''));
    setUpiId(`${base || 'friend'}${handle}`);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const trimmed = name.trim();
    const initials = trimmed
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const randomColor =
      MEMBER_AVATAR_PALETTE[members.length % MEMBER_AVATAR_PALETTE.length];

    const cleanPhone = phone.trim() ? phone.trim() : undefined;

    const finalUpi = upiId.trim()
      ? upiId.trim().toLowerCase()
      : cleanPhone
      ? `${extractPhoneDigits(cleanPhone)}@paytm`
      : `${trimmed.toLowerCase().replace(/\s+/g, '')}@okhdfcbank`;

    onAddMember({
      id: `member-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      upiId: finalUpi,
      phone: cleanPhone,
      avatarColor: randomColor,
      initials,
    });

    setName('');
    setUpiId('');
    setPhone('');
  };

  const suggestions = name ? generateUpiSuggestions(name, phone) : [];

  return (
    <div className="space-y-6">
      {/* Invite Code & Share Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div className="space-y-0.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t?.invite || 'Trip Secret Code'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-base font-mono font-bold tracking-widest text-slate-900 dark:text-slate-100">
              {inviteCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-1 text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 rounded transition-colors cursor-pointer"
              title="Copy Code"
            >
              {copiedCode ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <button
          onClick={onOpenInviteModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold text-xs rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer shadow-2xs"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{t?.invite || 'Show QR & Shareable Link'}</span>
        </button>
      </div>

      {/* Active Friends List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{t?.activeMembers || 'Trip Friends'} ({activeMembers.length})</span>
          </h4>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Click pencil to update Name, Phone & UPI ID
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeMembers.map((m) => {
            const b = balances[m.id] || { netBalance: 0, totalPaid: 0, totalOwed: 0 };
            const isOwed = b.netBalance > 0.05;
            const owes = b.netBalance < -0.05;
            const isSelf = isMemberSelf(m);

            return (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3 group hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-2xs ring-1 ring-white dark:ring-slate-800 ${m.avatarColor}`}
                  >
                    {m.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {m.name}
                      </span>
                      {isSelf && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {t?.you || 'You'}
                        </span>
                      )}
                      <button
                        onClick={() => setEditingMember(m)}
                        className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                        title="Update Name, Phone Number, and UPI ID"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate">
                      <QrCode className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="truncate">{m.upiId}</span>
                    </div>

                    {m.phone ? (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        <Phone className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{m.phone}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingMember(m)}
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline block cursor-pointer"
                      >
                        + Add phone number
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <span
                    className={`text-xs font-mono font-bold block tabular-nums ${
                      isOwed
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : owes
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isOwed && `+${formatPrice(b.netBalance)}`}
                    {owes && `${formatPrice(b.netBalance)}`}
                    {!isOwed && !owes && `${currInfo.symbol}0`}
                  </span>

                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-mono">
                    Paid: {formatPrice(b.totalPaid)}
                  </span>

                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setEditingMember(m)}
                      className="text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 p-1 text-[11px] rounded transition-colors cursor-pointer"
                      title="Edit Contact & UPI"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Self-deletion is strictly forbidden. Delete button only for other members */}
                    {!isSelf && (
                      <button
                        onClick={() => onRemoveMember(m.id)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1 rounded cursor-pointer"
                        title={t?.removeFriend || 'Remove Friend from Trip'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past Members (In Settlement) */}
      {archivedMembers.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{t?.pastMembers || 'Past Members (In Settlement)'} ({archivedMembers.length})</span>
            </h4>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Excluded from future expenses. Retained in settlement and past records.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-85">
            {archivedMembers.map((m) => {
              const b = balances[m.id] || { netBalance: 0, totalPaid: 0, totalOwed: 0 };
              const isOwed = b.netBalance > 0.05;
              const owes = b.netBalance < -0.05;

              return (
                <div
                  key={m.id}
                  className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 opacity-70 ${m.avatarColor}`}
                    >
                      {m.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate line-through">
                          {m.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                          {t?.leftTrip || 'Left Trip'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">
                        {m.upiId}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span
                      className={`text-xs font-mono font-bold block tabular-nums ${
                        isOwed
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : owes
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {isOwed && `+${formatPrice(b.netBalance)}`}
                      {owes && `${formatPrice(b.netBalance)}`}
                      {!isOwed && !owes && `${currInfo.symbol}0`}
                    </span>
                    {onReactivateMember && (
                      <button
                        onClick={() => onReactivateMember(m.id)}
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-medium ml-auto"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Re-add to Trip</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Friend Form with Phone Contact Picker */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t?.addFriend || 'Add Friend to Trip'}</span>
          </h4>

          {/* Contact Picker Trigger Button */}
          <button
            type="button"
            onClick={handlePickFromPhone}
            disabled={isPickingContact}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isPickingContact ? 'Opening Contacts...' : t?.selectFromContacts || 'Select from Phone Contacts'}</span>
          </button>
        </div>

        {contactPickerNotice && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>{contactPickerNotice}</span>
          </div>
        )}

        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                {t?.friendFullName || "Friend's Full Name"} *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                {t?.mobileNumber || 'Mobile Number (Optional)'}
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => handlePhoneInputChange(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                {t?.upiId || 'UPI ID for Settlement'}
              </label>
              <input
                type="text"
                placeholder="e.g. rahul@oksbi or phone@paytm"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quick UPI Handle Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Quick handles:</span>
            {POPULAR_UPI_HANDLES.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => handleApplyHandle(h)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-800 dark:hover:text-emerald-300 hover:border-emerald-300 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                {h}
              </button>
            ))}

            {suggestions.length > 0 && suggestions.slice(0, 2).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setUpiId(s)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
              >
                Suggested: {s}
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t?.addFriend || 'Add Friend'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Edit Friend Modal */}
      <EditFriendModal
        isOpen={!!editingMember}
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onSave={(updated) => {
          onUpdateMember(updated);
          setEditingMember(null);
        }}
      />
    </div>
  );
};
