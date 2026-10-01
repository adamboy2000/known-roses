'use client';
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { content } from '../app/content';
import { useRoseAssets, useRoseRoutes } from './RoseAssetsProvider';
import { validateAddress, validateContact } from '../lib/rose-order';
import { readRecipientPreview } from '../lib/recipient-preview';
import SmsConsent from './SmsConsent';
import { KnownLogo } from './KnownLogo';

const empty = { first: '', last: '', phone: '', email: '', city: '', street: '', unit: '', zip: '', notes: '' };
type Claim = typeof empty;
type Stage = 'welcome' | 'delivery' | 'complete';
const autocomplete: Record<string, string> = { first: 'given-name', last: 'family-name', phone: 'tel', email: 'email', street: 'street-address', zip: 'postal-code' };

export default function RoseClaim() {
  const roseAssets = useRoseAssets();
  const routes = useRoseRoutes();
  const [details, setDetails] = useState<Claim>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Claim, string>>>({});
  const [consent, setConsent] = useState(false);
  const [stage, setStage] = useState<Stage>('welcome');
  const [senderFirst, setSenderFirst] = useState('');
  const [editingDetails, setEditingDetails] = useState(true);
  useEffect(() => {
    const loadInvite = () => {
      const known = readRecipientPreview();
      setDetails({ ...empty, ...known });
      setSenderFirst(known?.senderFirst || '');
      setEditingDetails(!known);
      setConsent(false);
      setErrors({});
      setStage('welcome');
    };
    loadInvite();
    window.addEventListener('hashchange', loadInvite);
    return () => window.removeEventListener('hashchange', loadInvite);
  }, []);
  const heading = useRef<HTMLHeadingElement>(null);
  const initial = useRef(true);
  useLayoutEffect(() => {
    if (initial.current) { initial.current = false; return; }
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [stage]);
  const go = (next: Stage) => { setErrors({}); setStage(next); };
  const change = (key: keyof Claim, value: string) => {
    setDetails(current => ({ ...current, [key]: value }));
    setErrors(current => ({ ...current, [key]: undefined, ...(key === 'email' ? { phone: undefined } : {}) }));
    if (key === 'phone') setConsent(false);
  };
  const field = (key: Exclude<keyof Claim, 'city' | 'notes'>, label: string, type = 'text') => <div className="checkoutField">
    <label htmlFor={`claim-${key}`}>{label}{key === 'unit' && <span>Optional</span>}</label>
    <input id={`claim-${key}`} value={details[key]} onChange={event => change(key, event.target.value)} type={type} maxLength={key === 'zip' ? 5 : key === 'email' ? 254 : key === 'street' ? 120 : 40} inputMode={key === 'zip' ? 'numeric' : undefined} autoComplete={autocomplete[key] || 'off'} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `claim-${key}-error` : undefined}/>
    {errors[key] && <p className="fieldError" id={`claim-${key}-error`}>{errors[key]}</p>}
  </div>;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: Partial<Record<keyof Claim, string>> = {};
    {
      if (!details.first.trim()) next.first = 'Add your first name.';
      if (!details.last.trim()) next.last = 'Add your last name.';
      const contact = validateContact(details.phone, details.email);
      if (contact.phone) next.phone = contact.phone;
      if (contact.email) next.email = contact.email;
    }
    Object.assign(next, validateAddress(details));
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      if (['first', 'last', 'phone', 'email'].includes(first)) setEditingDetails(true);
      requestAnimationFrame(() => document.getElementById(`claim-${first}`)?.focus()); return;
    }
    // The address stays in memory only; no order or delivery is created.
    go('complete');
  };
  const formStage = stage === 'delivery';
  return <main className="claimPage recipientPage">
    <a href={routes.home} className="recipientBrand" aria-label="Known home"><KnownLogo/></a>
    <section className="claimCard recipientCard" aria-labelledby="claim-title" data-stage={stage}>
      {formStage && <button className="checkoutBack" aria-label="Back" onClick={() => go('welcome')}><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="m12 4-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>}
      <div key={stage} className="recipientStage">
        {(stage === 'welcome' || stage === 'complete') && <div className={`recipientReveal ${stage === 'complete' ? 'recipientRevealSmall' : ''}`} aria-hidden="true">
          <img className="recipientSky" src={roseAssets.background} alt="" width="1880" height="1080"/>
          <img className="recipientRose" src={roseAssets.foreground} alt="" width="1448" height="1086" fetchPriority="high"/>
        </div>}
        <div className={`checkoutIntro recipientIntro ${formStage ? 'recipientIntroForm' : ''}`}>
          <h1 id="claim-title" ref={heading} tabIndex={-1}>{stage === 'welcome' ? <>{senderFirst || 'Someone'} thought<br/>of <em>you.</em></> : stage === 'delivery' ? <>Where should<br/>it <em>go?</em></> : <>A lovely <em>thought.</em></>}</h1>
          <p>{stage === 'welcome' ? 'A real rose. Just because you’re on their mind.' : stage === 'delivery' ? 'Your doorstep. Your office. Somewhere that suits you.' : `${details.first.trim()}, your address preview is ready.`}</p>
        </div>
        {stage === 'welcome' && <div className="recipientWelcome">
          <button type="button" className="button checkoutPrimary" onClick={() => go('delivery')}><img src="/known/location-pin-rounded.svg" width="18" height="18" alt=""/>Choose where it goes</button>
        </div>}
        {formStage && <>

          <form noValidate onSubmit={submit} className="checkoutForm claimForm">
            <div className="recipientIdentity">
              <div className="recipientIdentityHeading"><h2>Your details</h2>{!editingDetails && <button type="button" className="checkoutTextButton" onClick={() => setEditingDetails(true)}>Edit details</button>}</div>
              {!editingDetails ? <div className="recipientIdentitySummary"><strong>{details.first} {details.last}</strong>{details.phone && <span>{details.phone}</span>}{details.email && <span>{details.email}</span>}</div> : <>
              <div className="checkoutFieldRow">{field('first', 'Your first name')}{field('last', 'Your last name')}</div>
              <div className="checkoutFieldRow">{field('phone', 'Your phone number', 'tel')}{field('email', 'Your email', 'email')}</div>
              </>}
              <p className="fieldHint">Your details stay private. We’ll only use them for delivery updates.</p>
              {details.phone.trim() && <SmsConsent id="claim-consent" checked={consent} onChange={setConsent}/>}
            </div>
            <div className="recipientAddressFields">
              <div className="checkoutField"><label htmlFor="claim-city">Delivery city</label><select id="claim-city" value={details.city} onChange={event => change('city', event.target.value)} aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? 'claim-city-error' : undefined}><option value="">Choose a city</option>{content.cities.map(city => <option key={city}>{city}</option>)}</select>{errors.city && <p className="fieldError" id="claim-city-error">{errors.city}</p>}</div>
              {field('street', 'Street address')}
              <div className="checkoutFieldRow">{field('unit', 'Apt or unit')}{field('zip', 'ZIP code')}</div>
              <div className="checkoutField"><label htmlFor="claim-notes">Delivery notes <span>Optional</span></label><textarea id="claim-notes" value={details.notes} onChange={event => change('notes', event.target.value)} maxLength={300} rows={2} placeholder="A buzzer code, a side gate, the best door to knock on."/></div>
            </div>
            <button className="button checkoutPrimary" type="submit">Confirm address</button>
          </form>
        </>}
        {stage === 'complete' && <div className="claimComplete recipientComplete">
          <div className="recipientAddress"><img src="/known/rose.svg" width="18" height="18" alt=""/><div><strong>{details.first} {details.last}</strong><p>{details.street}{details.unit ? `, ${details.unit}` : ''}<br/>{details.city}, {details.zip}</p></div><button className="checkoutTextButton" onClick={() => go('delivery')}>Edit</button></div>
          <p className="fieldHint">This is a preview. Your address hasn’t been saved and no delivery is scheduled.</p>
        </div>}
      </div>
    </section>
    <aside className="recipientGive"><p>A little thought can go a long way.<br/><span>You can send a rose, too.</span></p><a href="/" className="button"><img src="/known/rose.svg" width="16" height="16" alt=""/>Send a rose</a></aside>
  </main>;
}
