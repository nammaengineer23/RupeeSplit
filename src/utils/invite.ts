export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.rupeesplit.app';
export const PLAY_STORE_PACKAGE = 'com.rupeesplit.app';

/**
 * Returns a robust public HTTPS base URL for WhatsApp sharing and invites.
 * Never returns localhost, 127.0.0.1, or capacitor:// in mobile or dev environments.
 */
export function getPublicInviteBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin;
    if (
      !origin.includes('localhost') &&
      !origin.includes('127.0.0.1') &&
      !origin.startsWith('capacitor:')
    ) {
      return origin;
    }
  }

  // Cloud Run hosted preview or configured domain
  return (
    (import.meta as any).env?.VITE_PUBLIC_APP_URL ||
    'https://ais-pre-vqguytfbdcwa7vvunmguvi-811147183845.asia-southeast1.run.app'
  );
}

/**
 * Formats a clean, standard 10-digit Indian phone number (removing +91, spaces, hyphens).
 */
export function normalizePhone10(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits.slice(-10);
}

/**
 * Validates whether a phone number is a valid 10-digit Indian mobile number.
 */
export function isValidIndianMobile(raw: string): boolean {
  const normalized = normalizePhone10(raw);
  return /^[6-9]\d{9}$/.test(normalized);
}

/**
 * Builds the public HTTPS invite URL for WhatsApp, web, and QR code sharing.
 */
export function buildTripInviteUrl(tripId: string, inviteCode: string): string {
  const base = getPublicInviteBaseUrl().replace(/\/$/, '');
  return `${base}/?tripId=${encodeURIComponent(tripId)}&code=${encodeURIComponent(inviteCode)}`;
}

/**
 * Builds an Android Chrome intent URL:
 * - If RupeeSplit app is installed: opens com.rupeesplit.app directly.
 * - If app is NOT installed: falls back and opens Google Play Store for com.rupeesplit.app!
 */
export function buildAndroidIntentUrl(tripId: string, inviteCode: string): string {
  const fallback = encodeURIComponent(PLAY_STORE_URL);
  return `intent://join?tripId=${encodeURIComponent(tripId)}&code=${encodeURIComponent(inviteCode)}#Intent;scheme=rupeesplit;package=${PLAY_STORE_PACKAGE};S.browser_fallback_url=${fallback};end`;
}

/**
 * Builds a 1-click WhatsApp share text with destination, dates, and clean clickable HTTPS link.
 */
export function buildWhatsAppShareUrl(trip: {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  members: { name: string }[];
  id: string;
  inviteCode: string;
}): string {
  const inviteUrl = buildTripInviteUrl(trip.id, trip.inviteCode);
  const friendNames = trip.members.map((m) => m.name).join(', ') || 'Friends';

  const message =
    `🏖️ *Join our trip: ${trip.name} on RupeeSplit!*\n\n` +
    `📍 *Destination:* ${trip.destination}\n` +
    `📅 *Dates:* ${trip.startDate} to ${trip.endDate}\n` +
    `👥 *Friends:* ${friendNames}\n\n` +
    `📲 *Tap link to open in app or install from Play Store:*\n` +
    `${inviteUrl}`;

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export function getDirectApkDownloadUrl(): string {
  const base = getPublicInviteBaseUrl().replace(/\/$/, '');
  return `${base}/RupeeSplit.apk`;
}

export const APK_DOWNLOAD_URL = 'https://play.google.com/store/apps/details?id=com.rupeesplit.app';

/**
 * Builds 1-click WhatsApp URL to share RupeeSplit providing both Google Play Store link and direct APK download.
 * Does NOT provide GitHub links.
 */
export function buildApkWhatsAppShareUrl(): string {
  const base = getPublicInviteBaseUrl().replace(/\/$/, '');
  const directApkUrl = `${base}/RupeeSplit.apk`;
  const playStoreUrl = PLAY_STORE_URL;

  const message =
    `🚀 *RupeeSplit - Smart Group Travel Expense Manager*\n` +
    `Track group expenses, kitty cash & settle instantly with UPI!\n\n` +
    `🛍️ *Install from Google Play Store:*\n` +
    `${playStoreUrl}\n\n` +
    `📦 *Direct Android APK Download:*\n` +
    `${directApkUrl}\n\n` +
    `🌐 *Web App (Use instantly in browser):*\n` +
    `${base}\n\n` +
    `Install from Google Play or download the APK directly on Android to start splitting!`;

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}
