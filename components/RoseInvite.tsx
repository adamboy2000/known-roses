'use client';
import { useEffect, useRef, useState } from 'react';
import type { RoseOrder } from '../lib/rose-order';
import { createRecipientPreview } from '../lib/recipient-preview';

export default function RoseInvite({ order }: { order: RoseOrder }) {
  const [link, setLink] = useState('');
  const [apple, setApple] = useState(false);
  const [notice, setNotice] = useState<{ text: string } | null>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Demo links deliberately contain no contact details or address data.
    setLink(`${location.origin}/rose/claim${createRecipientPreview(order)}`);
    setApple(/Mac|iPhone|iPad|iPod/.test(navigator.platform));
  }, []);
  useEffect(() => {
    if (!notice || !toastRef.current) return;
    const toast = toastRef.current;
    const position = () => {
      const dialog = toast.closest('dialog')?.getBoundingClientRect();
      toast.style.top = `${Math.min((dialog?.bottom ?? 0) + 12, innerHeight - toast.offsetHeight - 12)}px`;
    };
    toast.showPopover();
    position();
    window.addEventListener('resize', position);
    const timer = setTimeout(() => setNotice(null), 3200);
    return () => { clearTimeout(timer); window.removeEventListener('resize', position); if (toast.matches(':popover-open')) toast.hidePopover(); };
  }, [notice]);
  const message = `${order.recipient.trim()}, a little something to brighten your day. 🌹\nI’d like to send you a real rose through Known. Choose where it should go:\n${link}\n— ${order.sender.trim()}`;
  const phone = order.recipientPhone.replace(/[^\d+]/g, '');
  const sms = `sms:${phone}${apple ? '&' : '?'}body=${encodeURIComponent(message)}`;
  const email = `mailto:${encodeURIComponent(order.recipientEmail.trim())}?subject=${encodeURIComponent('A little thought for you 🌹')}&body=${encodeURIComponent(message)}`;
  const copy = async (text: string, label: string) => {
    try { await navigator.clipboard.writeText(text); setNotice({ text: `${label} copied.` }); }
    catch { setNotice({ text: 'Couldn’t copy. Select the link in your message.' }); }
  };
  return <div className="inviteContent">
    <p>A little something for {order.recipient.trim()}.<br/><span>They choose the address. You keep the surprise.</span></p>
    <div className="inviteTo"><span>To</span><strong>{order.recipient} {order.recipientLast}</strong><small>{order.recipientPhone || order.recipientEmail}</small></div>
    <label className="checkoutField inviteMessage">Your message<textarea readOnly value={message} rows={5} onFocus={event => event.target.select()}/></label>
    {link && <div className="inviteActions">
      <div className="inviteSendActions">
        {phone && <a className="button checkoutPrimary" href={sms}><ShareIcon kind="send"/>Send SMS</a>}
        {order.recipientEmail.trim() && <a className="button checkoutPrimary" href={email}><ShareIcon kind="email"/>Send email</a>}
        <button type="button" className="button checkoutPrimary" onClick={() => copy(link, 'Link')}><ShareIcon kind="link"/>Share link</button>
      </div>
    </div>}
    {notice && <div ref={toastRef} popover="manual" className="inviteToast" role="status" aria-live="polite">{notice.text}</div>}
  </div>;
}

function ShareIcon({ kind }: { kind: 'send' | 'email' | 'link' }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
    {kind === 'send' ? <path fill="currentColor" d="M21.3 2.7a1 1 0 0 0-1.05-.23L3.1 9.05a1 1 0 0 0 .04 1.88l6.4 2.14 7.37-6-6 7.37 2.14 6.4a1 1 0 0 0 1.88.04l6.58-17.15a1 1 0 0 0-.21-1.03Z"/> : kind === 'email' ? <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 6.8 5.1a2 2 0 0 0 2.4 0L20 7"/></g> : <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m10 7 2-2a5 5 0 0 1 7 7l-2 2M14 17l-2 2a5 5 0 0 1-7-7l2-2M8.5 15.5l7-7"/></g>}
  </svg>;
}
