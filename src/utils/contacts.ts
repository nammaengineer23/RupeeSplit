/**
 * Native and browser contact picking plus phone/UPI utilities.
 */
import { Capacitor } from '@capacitor/core';
import { CapacitorContacts, ContactProperty } from '@capgo/capacitor-contacts';

export interface PickedContact {
  name: string;
  phone: string;
  email?: string;
  suggestedUpi: string;
}

/**
 * Native Capacitor apps use the Android/iOS system picker.
 * Browsers use the Web Contact Picker API when available.
 */
export function isContactPickerSupported(): boolean {
  if (Capacitor.isNativePlatform()) return true;
  return typeof window !== 'undefined' && 'contacts' in navigator &&
    typeof (navigator as Navigator & { contacts?: unknown }).contacts === 'object';
}

/** Sanitize and format Indian phone number. */
export function sanitizePhoneNumber(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.replace(/[\\s\\-\\(\\)]/g, '');

  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }

  return raw.trim();
}

/** Extract just digits from phone for UPI ID generation. */
export function extractPhoneDigits(phone: string): string {
  return phone.replace(/\\D/g, '').slice(-10);
}

export const POPULAR_UPI_HANDLES = [
  '@okhdfcbank',
  '@okaxis',
  '@oksbi',
  '@okicici',
  '@ybl',
  '@paytm',
  '@ibl',
  '@upi',
];

/** Generate suggested UPI handles from a name or phone number. */
export function generateUpiSuggestions(name: string, phone?: string): string[] {
  const suggestions: string[] = [];
  const digits = phone ? extractPhoneDigits(phone) : '';
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);

  if (digits && digits.length >= 10) {
    suggestions.push(`${digits}@paytm`);
    suggestions.push(`${digits}@ybl`);
    suggestions.push(`${digits}@okhdfcbank`);
    suggestions.push(`${digits}@upi`);
  }

  if (cleanName) {
    suggestions.push(`${cleanName}@oksbi`);
    suggestions.push(`${cleanName}@okaxis`);
    suggestions.push(`${cleanName}@icici`);
  }

  return suggestions;
}

/**
 * Pick one contact from the device.
 * Capacitor uses the native system picker; the web build uses the browser API.
 * Native phone-property picking avoids requesting READ_CONTACTS for the whole
 * address book and is suitable for Android's restricted contact-picker flow.
 */
export async function pickContactFromPhone(): Promise<PickedContact | null> {
  try {
    let rawName = '';
    let rawTel = '';
    let rawEmail = '';

    if (Capacitor.isNativePlatform()) {
      const result = await CapacitorContacts.pickContacts({
        property: ContactProperty.PhoneNumber,
      });
      const contact = result.contacts?.[0];
      if (!contact) return null;

      rawName = contact.displayName || 'Friend';
      rawTel = contact.phoneNumbers?.[0]?.value || '';
      if (!rawTel) {
        throw new Error('The selected contact does not have a phone number. Please choose a contact with a mobile number.');
      }
    } else {
      if (!isContactPickerSupported()) {
        throw new Error('Contact Picker is not supported in this browser. Open the Android app or use a supported mobile browser.');
      }

      const props = ['name', 'tel', 'email'];
      const contacts = await (navigator as Navigator & {
        contacts: { select: (properties: string[], options: { multiple: boolean }) => Promise<Array<{ name?: string[]; tel?: string[]; email?: string[] }>> };
      }).contacts.select(props, { multiple: false });

      const contact = contacts?.[0];
      if (!contact) return null;
      rawName = Array.isArray(contact.name) ? contact.name[0] || 'Friend' : 'Friend';
      rawTel = Array.isArray(contact.tel) ? contact.tel[0] || '' : '';
      rawEmail = Array.isArray(contact.email) ? contact.email[0] || '' : '';
    }

    const formattedPhone = sanitizePhoneNumber(rawTel);
    const digits = extractPhoneDigits(rawTel);
    const cleanName = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const suggestedUpi = digits.length >= 10 ? `${digits}@paytm` : `${cleanName || 'friend'}@upi`;

    return {
      name: rawName,
      phone: formattedPhone,
      email: rawEmail || undefined,
      suggestedUpi,
    };
  } catch (err) {
    console.warn('Contact picker cancelled or failed:', err);
    throw err;
  }
}
