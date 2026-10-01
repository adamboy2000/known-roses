import type { RoseOrder } from './rose-order';

const KEY = 'known:recipient-preview';
export type RecipientDetails = { first: string; last: string; phone: string; email: string; senderFirst?: string };
// Temporary, browser-local demo handoff. Real shared invites need server-side lookup.
export function createRecipientPreview(order: RoseOrder): string {
  try {
    const id = crypto.randomUUID();
    const details: RecipientDetails = { first: order.recipient, last: order.recipientLast, phone: order.recipientPhone, email: order.recipientEmail, senderFirst: order.sender.trim() };
    localStorage.setItem(KEY, JSON.stringify({ id, details, expires: Date.now() + 15 * 60 * 1000 }));
    return `#invite=${id}`;
  } catch { return ''; }
}
export function readRecipientPreview(): RecipientDetails | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const record = JSON.parse(raw);
    if (typeof record.expires !== 'number' || record.expires < Date.now()) { localStorage.removeItem(KEY); return null; }
    const id = new URLSearchParams(location.hash.slice(1)).get('invite');
    if (!id || record.id !== id) return null;
    if (!['first', 'last', 'phone', 'email'].every(key => typeof record.details?.[key] === 'string')) return null;
    return { ...record.details, senderFirst: typeof record.details.senderFirst === 'string' ? record.details.senderFirst.trim().slice(0, 40) : '' };
  } catch { return null; }
}
