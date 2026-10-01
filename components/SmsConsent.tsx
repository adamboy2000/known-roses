'use client';
import { SMS_CONSENT_COPY, SMS_CONSENT_VERSION } from '../lib/rose-order';

export default function SmsConsent({ checked, onChange, id }: { checked: boolean; onChange: (checked: boolean) => void; id: string }) {
  return <label className="smsConsent" data-consent-version={SMS_CONSENT_VERSION}>
    <input id={id} type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)}/>
    <span>{SMS_CONSENT_COPY}</span>
  </label>;
}
