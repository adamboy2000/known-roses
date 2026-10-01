'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';
import { useRoseAssets } from './RoseAssetsProvider';
import { ROSE_PRICE, type RoseOrder } from '../lib/rose-order';

let motion: typeof import('gsap').gsap | undefined;
let loading: Promise<void> | undefined;

// Start when checkout opens, keeping this animation off the initial hero load.
export function prepareConfirmation() {
  loading ??= import('gsap').then(module => { motion = module.gsap; }).catch(() => { loading = undefined; });
}

export default function RoseConfirmation({ order, titleRef }: { order: RoseOrder; titleRef: RefObject<HTMLHeadingElement | null> }) {
  const roseAssets = useRoseAssets();
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // The complete receipt stays usable if motion hasn't loaded or is disabled.
    if (!motion) return;
    const media = motion.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      motion!.timeline({ defaults: { ease: 'power3.out' } })
        .from('.confirmationRose', { y: 24, rotation: -4, scale: .94, opacity: 0, duration: .9 })
        .from('.confirmationLine', { y: 14, opacity: 0, duration: .65, stagger: .12 }, .25)
        .from('.confirmationCopy p', { y: 8, opacity: 0, duration: .55 }, .65)
        .from('.confirmationReceipt', { y: 8, opacity: 0, duration: .5 }, .85);
    }, rootRef);
    return () => media.revert();
  }, []);

  return <div ref={rootRef} className="checkoutComplete">
    <div className="confirmationRose" aria-hidden="true"><img src={roseAssets.foreground} alt="" width="1448" height="1086" decoding="async"/></div>
    <div className="confirmationCopy">
      <h2 id="checkout-title" ref={titleRef} tabIndex={-1}><span className="confirmationLine">A little thought.</span>{' '}<em className="confirmationLine">A real rose.</em></h2>
      <p>You’re all set. This one’s for {order.recipient.trim()}.</p>
    </div>
    <div className="confirmationReceipt"><div><span>One real rose</span><strong>{ROSE_PRICE}</strong></div><p><img src={order.delivery === 'link' ? '/known/where.svg' : '/known/rose.svg'} alt=""/>{order.delivery === 'link' ? 'Private link · they choose the address' : `${order.city} · hand delivery`}</p></div>
  </div>;
}
