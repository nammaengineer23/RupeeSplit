/**
 * Contact Picker API integration & Phone/UPI utilities
 */

export interface PickedContact {
  name: string;
  phone: string;
  email?: string;
  suggestedUpi: string;
}

/**
 * Check if the browser supports the native Web Contact Picker API
 */
export function isContactPickerSupported(): boolean {
  return typeof window !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window;
}

/**
 * Sanitize and format Indian phone number
 */
export function sanitizePhoneNumber(raw: string): string {
  if (!raw) return '';
  // Remove spaces, hyphens, parentheses
  let cleaned = raw.replace(/[\s\-\(\)]/g, '');
  
  // Strip leading 0 or country code if needed for UPI handle
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  // If standard 10 digit Indian mobile
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }

  return raw.trim();
}

/**
 * Extract just digits from phone for UPI ID generation
 */
export function extractPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

/**
 * Common Indian UPI handle suggestions
 */
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

/**
 * Generate smart UPI suggestions based on Name or Phone
 */
export function generateUpiSuggestions(name: string, phone?: string): string[] {
  const suggestions: string[] = [];
  const digits = phone ? extractPhoneDigits(phone) : '';
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 15);

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
 * Open native Web Contact Picker API to select friend from device phonebook
 */
export async function pickContactFromPhone(): Promise<PickedContact | null> {
  if (!isContactPickerSupported()) {
    throw new Error('Contact Picker API is not supported on this browser or platform.');
  }

  try {
    const props = ['name', 'tel', 'email'];
    const opts = { multiple: false };
    const contacts = await (navigator as any).contacts.select(props, opts);

    if (!contacts || contacts.length === 0) {
      return null;
    }

    const c = contacts[0];
    const rawName = Array.isArray(c.name) && c.name.length > 0 ? c.name[0] : (c.name || 'Friend');
    const rawTel = Array.isArray(c.tel) && c.tel.length > 0 ? c.tel[0] : (c.tel || '');
    const rawEmail = Array.isArray(c.email) && c.email.length > 0 ? c.email[0] : (c.email || '');

    const formattedPhone = sanitizePhoneNumber(rawTel);
    const digits = extractPhoneDigits(rawTel);
    const cleanName = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Best guess UPI ID: phone@paytm or name@upi
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
