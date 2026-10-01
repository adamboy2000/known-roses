'use client';

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type FormEvent, type InputHTMLAttributes } from 'react';
import { content } from '../app/content';
import { emptyOrder, validateOrder, ROSE_PRICE, type RoseOrder, type OrderErrors } from '../lib/rose-order';
import { roseAssets } from '../lib/rose-assets';
import RoseConfirmation, { prepareConfirmation } from './RoseConfirmation';
import SmsConsent from './SmsConsent';
import RoseInvite from './RoseInvite';

type OpenRequest = { button: HTMLElement; rect: DOMRect };
const CheckoutContext = createContext<((button: HTMLElement) => void) | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<OpenRequest | null>(null);
  return <CheckoutContext.Provider value={button => setRequest({ button, rect: button.getBoundingClientRect() })}>
    {children}
    {request && <RoseCheckout request={request} onDismiss={() => setRequest(null)} />}
  </CheckoutContext.Provider>;
}

export function SendRoseButton() {
  const open = useContext(CheckoutContext);
  return <button type="button" className="button" aria-haspopup="dialog" onClick={event => open?.(event.currentTarget)}>
    <img className="buttonIcon" src="/known/rose.svg" alt="" aria-hidden="true"/>Send a rose
  </button>;
}

function Field({ label, error, hint, optional, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string; optional?: boolean }) {
  return <div className="checkoutField">
    <label htmlFor={props.id}>{label}{optional && <span>Optional</span>}</label>
    <input {...props} aria-invalid={Boolean(error)} aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}/>
    {error ? <p className="fieldError" id={`${props.id}-error`}>{error}</p> : hint && <p className="fieldHint" id={`${props.id}-hint`}>{hint}</p>}
  </div>;
}

function SelectionMark() {
  return <span className="choiceCheck" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="m5.5 10 3 3 6-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></span>;
}

function RoseCheckout({ request, onDismiss }: { request: OpenRequest; onDismiss: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const closing = useRef(false);
  const busyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [order, setOrder] = useState<RoseOrder>({ ...emptyOrder });
  const [errors, setErrors] = useState<OrderErrors>({});
  const [stage, setStage] = useState<'details' | 'payment' | 'complete' | 'share'>('details');
  const [detailsStep, setDetailsStep] = useState(0);
  const [introScrolled, setIntroScrolled] = useState(false);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const [card, setCard] = useState<'apple' | 'approved' | 'declined'>('apple');
  const [busy, setBusy] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const animationsRef = useRef<Animation[]>([]);

  useLayoutEffect(() => {
    const scroll = dialogRef.current?.querySelector('.checkoutScroll');
    if (scroll) setHasMoreBelow(scroll.scrollHeight - scroll.clientHeight > 40 && scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop > 2);
  });

  useLayoutEffect(() => {
    if (!dialogRef.current?.open) return;
    dialogRef.current.querySelector('.checkoutScroll')?.scrollTo({ top: 0, behavior: 'instant' });
    titleRef.current?.focus({ preventScroll: true });
  }, [stage, detailsStep]);

  useEffect(() => {
    prepareConfirmation();
    const dialog = dialogRef.current!;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbar = innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar) document.body.style.paddingRight = `${scrollbar}px`;
    dialog.showModal();
    const scroll = dialog.querySelector('.checkoutScroll')!;
    const resize = new ResizeObserver(() => setHasMoreBelow(scroll.scrollHeight - scroll.clientHeight > 40 && scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop > 2));
    resize.observe(scroll);
    const rect = dialog.getBoundingClientRect();
    const dx = request.rect.left + request.rect.width / 2 - rect.left - rect.width / 2;
    const dy = request.rect.top + request.rect.height / 2 - rect.top - rect.height / 2;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animationsRef.current.push(dialog.animate([
        { transform: `translate(${dx}px,${dy}px) scale(${request.rect.width / rect.width},${request.rect.height / rect.height})`, borderRadius: '44px', opacity: .65 },
        { transform: 'translate(0,0) scale(1)', borderRadius: '24px', opacity: 1 },
      ], { duration: 660, easing: 'cubic-bezier(.22,1,.36,1)' }));
      animationsRef.current.push(bodyRef.current!.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 460, delay: 180, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }));
    }
    titleRef.current?.focus({ preventScroll: true });
    return () => {
      animationsRef.current.forEach(animation => animation.cancel());
      resize.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      request.button.focus({ preventScroll: true });
    };
  }, [request]);

  const close = () => {
    if (closing.current || busyRef.current) return;
    closing.current = true;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { onDismiss(); return; }
    const dialog = dialogRef.current!;
    const rect = dialog.getBoundingClientRect(), origin = request.button.getBoundingClientRect();
    const dx = origin.left + origin.width / 2 - rect.left - rect.width / 2;
    const dy = origin.top + origin.height / 2 - rect.top - rect.height / 2;
    animationsRef.current.forEach(animation => animation.cancel());
    animationsRef.current.push(bodyRef.current!.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 130, fill: 'forwards' }));
    const animation = dialog.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1, borderRadius: '24px' },
      { transform: `translate(${dx}px,${dy}px) scale(${origin.width / rect.width},${origin.height / rect.height})`, opacity: 0, borderRadius: '44px' },
    ], { duration: 340, easing: 'cubic-bezier(.55,0,.8,.4)', fill: 'forwards' });
    animationsRef.current.push(animation);
    animation.onfinish = onDismiss;
  };
  const change = <K extends keyof RoseOrder,>(key: K, value: RoseOrder[K]) => {
    setOrder(current => ({ ...current, [key]: value, ...(key === 'senderPhone' ? { senderSmsConsent: false } : {}) }));
    setErrors(current => ({ ...current, [key]: undefined, ...(key === 'senderEmail' ? { senderPhone: undefined } : key === 'recipientEmail' ? { recipientPhone: undefined } : {}) }));
  };
  const go = (next: typeof stage) => {
    setStage(next);
    setIntroScrolled(false);
  };
  const goDetails = (step: number) => { setDetailsStep(step); setErrors({}); go('details'); };
  const submitDetails = (event: FormEvent) => {
    event.preventDefault();
    const allErrors = validateOrder(order);
    const nextErrors = Object.fromEntries(Object.entries(allErrors).filter(([key]) => detailsStep === 2 || key.startsWith(detailsStep === 0 ? 'sender' : 'recipient'))) as OrderErrors;
    setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0];
    if (first) {
      const errorStep = first.startsWith('sender') ? 0 : first.startsWith('recipient') ? 1 : 2;
      if (errorStep !== detailsStep) {
        setDetailsStep(errorStep); setIntroScrolled(false);
        requestAnimationFrame(() => document.getElementById(`rose-${first}`)?.focus());
      } else document.getElementById(`rose-${first}`)?.focus();
      return;
    }
    if (detailsStep < 2) goDetails(detailsStep + 1); else go('payment');
  };
  const payDemo = (event: FormEvent) => {
    event.preventDefault();
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setPaymentError('');
    timerRef.current = setTimeout(() => {
      busyRef.current = false; setBusy(false);
      if (card === 'declined') setPaymentError('Card declined. Choose another card and try again.');
      else go('complete');
    }, 900);
  };
  const field = (key: Exclude<keyof RoseOrder, 'senderSmsConsent'>, label: string, extra: Partial<InputHTMLAttributes<HTMLInputElement>> & { optional?: boolean; hint?: string } = {}) =>
    <Field id={`rose-${key}`} label={label} value={order[key]} onChange={event => change(key, event.target.value)} error={errors[key]} {...extra}/>;

  return <dialog ref={dialogRef} className="roseDialog" aria-labelledby="checkout-title" onCancel={event => { event.preventDefault(); close(); }} onKeyDown={event => {
    if (event.key !== 'Tab') return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]')).filter(element => element.offsetParent !== null && element.tabIndex >= 0);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === titleRef.current)) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onClick={event => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.target === event.currentTarget && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) close();
  }}>
    <div ref={bodyRef} className="checkoutShell" data-stage={stage} data-scroll-below={hasMoreBelow}>
      {((stage === 'details' && detailsStep > 0) || stage === 'payment') && <button type="button" className="checkoutBack" aria-label="Back" disabled={busy} onClick={() => goDetails(stage === 'payment' ? 2 : detailsStep - 1)}><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m14 6-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>}
      <button type="button" className="checkoutClose" aria-label="Close checkout" onClick={close} disabled={busy}><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></button>
      {stage === 'payment' && <header className="checkoutTop checkoutTopWithBack"><h2 id="checkout-title" ref={titleRef} tabIndex={-1}>Payment</h2></header>}
      {stage === 'share' && <header className="checkoutTop"><h2 id="checkout-title" ref={titleRef} tabIndex={-1}>Send their link</h2></header>}
      <div className={`checkoutScroll ${stage === 'details' ? 'checkoutScrollDetails' : stage === 'complete' ? 'checkoutScrollComplete' : ''}`} data-intro-scrolled={introScrolled} onScroll={event => {
        const scroll = event.currentTarget;
        setHasMoreBelow(scroll.scrollHeight - scroll.clientHeight > 40 && scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop > 2);
        if (stage !== 'details' || detailsStep !== 0) return;
        setIntroScrolled(scroll.scrollTop > (scroll.querySelector<HTMLElement>('.checkoutHero')?.offsetHeight ?? 0));
      }}>
        {stage === 'details' && <>
          {detailsStep === 0 && <>
          <div className="checkoutImageBar" aria-hidden="true"><span>Send a rose</span></div>
          <div className="checkoutHero checkoutStepHero" aria-hidden="true"><img src={roseAssets.poster} alt="" width="1880" height="1080" decoding="async"/><div className="checkoutHeroBlur"><span/><span/><span/><span/></div></div>
          </>}
          <div className={`checkoutIntro checkoutStepIntro ${detailsStep > 0 ? 'checkoutStepIntroCompact' : ''}`}><h2 id="checkout-title" ref={titleRef} tabIndex={-1}>{detailsStep === 0 ? <>Send a <em>rose.</em></> : detailsStep === 1 ? <>For <em>them.</em></> : <>The <em>delivery.</em></>}</h2><p>{detailsStep === 0 ? 'Let’s start with you.' : detailsStep === 1 ? 'Someone on your mind?' : 'A surprise at the door, or a link to choose.'}</p></div>
          <CheckoutProgress current={detailsStep}/>
          <form key={detailsStep} id="rose-details-form" noValidate onSubmit={submitDetails} className="checkoutForm checkoutDetailsForm checkoutStepForm">
          <div className="checkoutFields">
            {detailsStep === 0 && <fieldset className="checkoutSection contactSection"><legend className="checkoutSrOnly">Your details</legend>
              <div className="checkoutFieldRow">{field('sender', 'Your first name', { maxLength: 40, autoComplete: 'section-sender given-name', autoCapitalize: 'words' })}{field('senderLast', 'Your last name', { maxLength: 40, autoComplete: 'section-sender family-name', autoCapitalize: 'words' })}</div>
              <div className="checkoutFieldRow contactMethods">{field('senderPhone', 'Your phone number', { type: 'tel', maxLength: 24, autoComplete: 'section-sender tel' })}{field('senderEmail', 'Your email', { type: 'email', maxLength: 254, autoComplete: 'section-sender email', autoCapitalize: 'none', spellCheck: false })}</div>
              {order.senderPhone.trim() && <SmsConsent id="rose-senderSmsConsent" checked={order.senderSmsConsent} onChange={checked => change('senderSmsConsent', checked)}/>}
            </fieldset>}
            {detailsStep === 1 && <fieldset className="checkoutSection contactSection"><legend className="checkoutSrOnly">Their details</legend>
              <div className="checkoutFieldRow">{field('recipient', 'Their first name', { maxLength: 40, autoComplete: 'off', autoCapitalize: 'words' })}{field('recipientLast', 'Their last name', { maxLength: 40, autoComplete: 'off', autoCapitalize: 'words' })}</div>
              <div className="checkoutFieldRow contactMethods">{field('recipientPhone', 'Their phone number', { type: 'tel', maxLength: 24, autoComplete: 'off' })}{field('recipientEmail', 'Their email', { type: 'email', maxLength: 254, autoComplete: 'off', autoCapitalize: 'none', spellCheck: false })}</div>
              <p className="fieldHint">They can opt in to texts themselves. Adding their number doesn’t sign them up.</p>
            </fieldset>}
            {detailsStep === 2 && <>
            <fieldset className="checkoutSection deliveryChoices"><legend>Delivery</legend>
              <label className={`deliveryChoice ${order.delivery === 'link' ? 'selected' : ''}`}><input type="radio" name="delivery" value="link" checked={order.delivery === 'link'} onChange={() => change('delivery', 'link')}/><img src="/known/where.svg" alt=""/><span><strong>Send them a link to choose</strong><small>After checkout, send their link in Messages or email.</small></span><SelectionMark/></label>
              <label className={`deliveryChoice ${order.delivery === 'address' ? 'selected' : ''}`}><input type="radio" name="delivery" value="address" checked={order.delivery === 'address'} onChange={() => change('delivery', 'address')}/><img src="/known/rose.svg" alt=""/><span><strong>I know their address</strong><small>A surprise at their door.</small></span><SelectionMark/></label>
            </fieldset>
            {order.delivery === 'address' && <section className="checkoutAddress" aria-label="Delivery address">
              <div className="checkoutField"><label htmlFor="rose-city">Delivery city</label><select id="rose-city" value={order.city} onChange={event => change('city', event.target.value)} aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? 'rose-city-error' : undefined}><option value="">Choose a city</option>{content.cities.map(city => <option key={city} value={city}>{city}</option>)}</select>{errors.city && <p className="fieldError" id="rose-city-error">{errors.city}</p>}</div>
              {field('street', 'Street address', { maxLength: 120, autoComplete: 'off', placeholder: '123 Rose Street' })}
              <div className="checkoutFieldRow">{field('unit', 'Apt or unit', { maxLength: 120, autoComplete: 'off', optional: true })}{field('zip', 'ZIP code', { maxLength: 5, inputMode: 'numeric', autoComplete: 'off', placeholder: '10001' })}</div>
              <div className="checkoutField"><label htmlFor="rose-notes">Delivery notes<span>Optional</span></label><textarea id="rose-notes" value={order.notes} maxLength={300} rows={2} onChange={event => change('notes', event.target.value)} placeholder="A buzzer code, a side gate, the best door to knock on."/></div>
            </section>}
            </>}
          </div>
          </form>
        </>}
        {stage === 'payment' && <><CheckoutProgress current={3}/><form id="rose-payment-form" onSubmit={payDemo} className="checkoutForm"><div className="checkoutFields">
          <div className="orderReview"><p>{order.delivery === 'link' ? 'Private link delivery' : <>{order.street.trim()}{order.unit.trim() && `, ${order.unit.trim()}`}<br/>{order.city}, {order.zip}</>}</p><button type="button" className="checkoutTextButton" onClick={() => goDetails(2)} disabled={busy}>Edit</button></div>
          <fieldset className="checkoutSection paymentChoices" disabled={busy}><legend>Payment method</legend>
            <label className={`testCard ${card === 'apple' ? 'selected' : ''}`}><input type="radio" name="test-card" checked={card === 'apple'} onChange={() => { setCard('apple'); setPaymentError(''); }}/><span className="walletMark" aria-hidden="true"><img src="/known/payments/apple-pay.svg" alt="" width="48" height="31"/></span><span><strong>Apple Pay</strong></span><SelectionMark/></label>
            <label className={`testCard ${card === 'approved' ? 'selected' : ''}`}><input type="radio" name="test-card" checked={card === 'approved'} onChange={() => { setCard('approved'); setPaymentError(''); }}/><span className="cardMark" aria-hidden="true"><img src="/known/payments/visa.svg" alt="" width="34" height="12"/></span><span><strong>Test card ···· 4242</strong></span><SelectionMark/></label>
            <label className={`testCard ${card === 'declined' ? 'selected' : ''}`}><input type="radio" name="test-card" checked={card === 'declined'} onChange={() => { setCard('declined'); setPaymentError(''); }}/><span className="cardMark" aria-hidden="true"><img src="/known/payments/visa.svg" alt="" width="34" height="12"/></span><span><strong>Test card ···· 0002</strong><small>Declined card</small></span><SelectionMark/></label>
          </fieldset><div className="checkoutTotal"><strong>Total</strong><strong>{ROSE_PRICE}</strong></div>
          {paymentError && <p className="paymentError" role="alert">{paymentError}</p>}
        </div></form></>}
        {stage === 'complete' && <RoseConfirmation order={order} titleRef={titleRef}/>}
        {stage === 'share' && <RoseInvite order={order}/>}
      </div>
      {stage === 'details' && <div className="checkoutFoot"><button type="submit" form="rose-details-form" className="button checkoutPrimary">{detailsStep === 2 ? `Continue to payment · ${ROSE_PRICE}` : 'Continue'}</button></div>}
      {stage === 'payment' && <div className="checkoutFoot"><button className="button checkoutPrimary" type="submit" form="rose-payment-form" disabled={busy}>{busy ? <><span className="checkoutSpinner" aria-hidden="true"/>One moment…</> : card === 'apple' ? <>Try Apple Pay · {ROSE_PRICE}</> : <>Pay {ROSE_PRICE}</>}</button><span className="checkoutFootnote" aria-live="polite">{busy ? 'Processing demo…' : card === 'apple' ? 'Apple Pay preview · no wallet opens or payment taken' : 'Test payment'}</span></div>}
      {stage === 'complete' && <div className="checkoutFoot checkoutConfirmationFoot">{order.delivery === 'link' && <button className="button checkoutPrimary" type="button" onClick={() => go('share')}>Send their link</button>}<button className={order.delivery === 'link' ? 'checkoutSecondary' : 'button checkoutPrimary'} type="button" onClick={close}>Done</button></div>}
      {stage === 'share' && <div className="checkoutFoot checkoutShareFoot"><button className="checkoutSecondary" type="button" onClick={close}>Done</button></div>}
    </div>
  </dialog>;
}

function CheckoutProgress({ current }: { current: number }) {
  return <ol className="checkoutProgress" aria-label="Checkout progress">{['You', 'Them', 'Delivery', 'Payment'].map((label, index) => <li key={label} aria-current={index === current ? 'step' : undefined} data-complete={index < current}><span aria-hidden="true"/>{label}</li>)}</ol>;
}
