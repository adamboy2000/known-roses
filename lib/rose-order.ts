import { content } from '../app/content';

export const ROSE_PRICE = '$3.33';
export type RoseOrder = {
  sender: string; senderLast: string; senderPhone: string; senderEmail: string; senderSmsConsent: boolean;
  recipient: string; recipientLast: string; recipientPhone: string; recipientEmail: string;
  delivery: 'link' | 'address';
  city: string; street: string; unit: string; zip: string; notes: string;
};
export const emptyOrder: RoseOrder = { sender: '', senderLast: '', senderPhone: '', senderEmail: '', senderSmsConsent: false, recipient: '', recipientLast: '', recipientPhone: '', recipientEmail: '', delivery: 'link', city: '', street: '', unit: '', zip: '', notes: '' };
export type OrderErrors = Partial<Record<keyof RoseOrder, string>>;
export const SMS_CONSENT_COPY = 'I agree to receive automated texts from Known about this rose, including delivery updates. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Optional; not a condition of purchase.';
export const SMS_CONSENT_VERSION = 'rose-transactional-v1';
export const isPhone = (value: string) => /^(1\d{10}|\d{10})$/.test(value.replace(/[\s()+.-]/g, ''));
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
export function validateContact(phone: string, email: string) {
  return {
    phone: !phone.trim() && !email.trim() ? 'Add a phone number or email.' : phone.trim() && !isPhone(phone) ? 'Add a valid US phone number.' : undefined,
    email: email.trim() && !isEmail(email) ? 'Add a valid email address.' : undefined,
  };
}
export function validateAddress(order: Pick<RoseOrder, 'city' | 'street' | 'zip'>): OrderErrors {
  const errors: OrderErrors = {};
  if (!content.cities.includes(order.city)) errors.city = 'Choose one of our 14 delivery cities.';
  if (!order.street.trim()) errors.street = 'Add a street address.';
  if (!/^\d{5}$/.test(order.zip.trim())) errors.zip = 'Add a five-digit ZIP code.';
  return errors;
}
export function validateOrder(order: RoseOrder): OrderErrors {
  const errors: OrderErrors = {};
  for (const [key, label] of [['sender', 'your first'], ['senderLast', 'your last'], ['recipient', 'their first'], ['recipientLast', 'their last']] as const) {
    if (!order[key].trim()) errors[key] = `Add ${label} name.`;
    else if (order[key].trim().length > 40) errors[key] = 'Keep this name under 40 characters.';
  }
  const sender = validateContact(order.senderPhone, order.senderEmail), recipient = validateContact(order.recipientPhone, order.recipientEmail);
  if (sender.phone) errors.senderPhone = sender.phone;
  if (sender.email) errors.senderEmail = sender.email;
  if (recipient.phone) errors.recipientPhone = recipient.phone;
  if (recipient.email) errors.recipientEmail = recipient.email;
  if (order.delivery === 'address') Object.assign(errors, validateAddress(order));
  return errors;
}
