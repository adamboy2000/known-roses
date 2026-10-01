'use client';
import { useEffect, useRef } from 'react';
import { content } from '../app/content';
import { KnownLogo } from './KnownLogo';
import { SendRoseButton } from './RoseCheckout';
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = ref.current!, line = section.querySelector<HTMLElement>('.heroLine')!, hint = section.querySelector<HTMLElement>('.scrollHint')!;
    const media = matchMedia('(prefers-reduced-motion: reduce)'); let raf = 0;
    const update = () => {
      raf = 0; const rect = section.getBoundingClientRect(), travel = rect.height - section.querySelector<HTMLElement>('.manifestoSticky')!.clientHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
      const opacity = media.matches ? 1 : Math.min(1, Math.max(0, (.92 - p) / .12));
      line.style.opacity = String(opacity);
      section.style.setProperty('--hero-topbar-opacity', String(opacity));
      hint.classList.toggle('scrollHintHidden', scrollY > 10);
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(update); };
    update(); addEventListener('scroll', wake, { passive: true }); addEventListener('resize', wake); media.addEventListener('change', wake);
    return () => { cancelAnimationFrame(raf); removeEventListener('scroll', wake); removeEventListener('resize', wake); media.removeEventListener('change', wake); };
  }, []);
  return <section className="manifesto" ref={ref} aria-label="Known roses"><div className="manifestoSticky">
    <div className="heroTopBar"><span className="heroEnter heroLogoEnter"><KnownLogo /></span></div>
    <h1 className="heroLine"><span className="heroEnter heroEnterFirst"><em>Roses</em> belong</span><br/><span className="heroEnter heroEnterSecond">in real life.</span><br/><span className="heroEnter heroEnterThird">So does <em>dating.</em></span></h1>
    <img src="/known/scroll-arrow.svg" className="scrollHint" alt="" aria-hidden="true"/>
  </div></section>;
}
export function Actions({ closing = false }: { closing?: boolean }) {
  return <div className="buttonRow"><SendRoseButton/>{closing && <a className="button buttonGhost" href={content.knownHref}>Get known</a>}</div>;
}

/** Progressive enhancement: content stays readable before JS or with reduced motion. */
export function ContentReveals() {
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.hero .content > *, .sectionLabel, .beliefHeading, .beliefContent .bodyCopy, .stepsContent > .bodyCopy, .step, .cities, .closingBlock > :not(.footerBackdrop)'));
    let observer: IntersectionObserver | undefined;
    const show = (el: HTMLElement) => { el.classList.add('isRevealed'); observer?.unobserve(el); };
    const setup = () => {
      observer?.disconnect();
      if (media.matches) { elements.forEach(show); return; }
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) show(entry.target as HTMLElement); });
      }, { rootMargin: '0px 0px -32px 0px', threshold: 0 });
      elements.forEach(el => {
        if (el.getBoundingClientRect().top < innerHeight) { show(el); return; }
        el.classList.add('revealItem');
        if (el.classList.contains('step')) el.style.setProperty('--reveal-delay', `${Array.from(el.parentElement!.children).indexOf(el) * 90}ms`);
        observer!.observe(el);
      });
    };
    const onFocus = (event: FocusEvent) => {
      const target = event.target;
      if (target instanceof Element) elements.filter(el => el.contains(target)).forEach(show);
    };
    setup(); media.addEventListener('change', setup); document.addEventListener('focusin', onFocus);
    return () => { observer?.disconnect(); media.removeEventListener('change', setup); document.removeEventListener('focusin', onFocus); elements.forEach(el => el.classList.remove('revealItem', 'isRevealed')); };
  }, []);
  return null;
}
