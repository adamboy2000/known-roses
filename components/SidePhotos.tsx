'use client';

import { useEffect, useRef, type ReactNode } from 'react';

const sources = Array.from({ length: 14 }, (_, i) => `/known/ambient/${String(i + 1).padStart(2, '0')}.webp`);
const phaseOffsets = [.8, .28, 1.1];

/** The reference's three independently eased, wrapping photos, kept at the edges. */
export default function SidePhotos({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current!;
    const track = root.querySelector<HTMLElement>('.sidePhotoTrack')!;
    const stage = root.querySelector<HTMLElement>('.sidePhotoStage')!;
    const images = Array.from(stage.querySelectorAll<HTMLImageElement>('img'));
    let disposed = false;
    let cleanup: (() => void) | undefined;

    // Delay the animation bundle until the visitor approaches the end of the hero.
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      import('gsap').then(({ gsap }) => {
        if (disposed) return;
        const media = gsap.matchMedia();
        media.add({ animate: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, context => {
          const reduced = Boolean(context.conditions?.reduce);
          let viewportHeight = 0, rootTop = 0, rootHeight = 0, frame = 0;
          const states = images.map((image, index) => ({ image, index, value: 0, cycle: -1, period: 1 }));
          const render = (state: typeof states[number]) => {
            const phase = state.value + viewportHeight * phaseOffsets[state.index];
            const cycle = Math.floor(phase / state.period);
            if (cycle !== state.cycle) {
              state.cycle = cycle;
              const source = (cycle * 3 + state.index) % sources.length;
              state.image.src = sources[source];
              // Prepare the next photo before its offscreen wrap, without loading the full set.
              const next = new Image();
              next.decoding = 'async'; next.fetchPriority = 'low';
              next.src = sources[(source + 3) % sources.length];
            }
            gsap.set(state.image, { y: -(phase % state.period), force3D: true });
          };
          const setters = states.map(state => gsap.quickTo(state, 'value', {
            duration: state.index + 1, ease: 'power4.out', onUpdate: () => render(state),
          }));
          const update = () => {
            frame = 0;
            const distance = Math.max(0, Math.min(scrollY - rootTop + viewportHeight, rootHeight + viewportHeight));
            if (!reduced) setters.forEach(set => set(distance * .55));
            const progress = Math.max(0, Math.min(1, (scrollY - rootTop + viewportHeight * 1.2) / (viewportHeight * .88)));
            track.style.opacity = String(progress);
          };
          const wake = () => { if (!frame) frame = requestAnimationFrame(update); };
          const measure = () => {
            viewportHeight = stage.clientHeight;
            rootTop = root.getBoundingClientRect().top + scrollY;
            rootHeight = root.offsetHeight;
            states.forEach(state => {
              const width = state.image.clientWidth;
              gsap.set(state.image, { x: state.index % 2 === 0 ? -width * .38 : root.clientWidth - width * .62 });
              state.period = viewportHeight + state.image.clientHeight + state.index * 200;
              state.cycle = -1;
              if (reduced) gsap.set(state.image, { y: -viewportHeight * [.8, .55, .1][state.index] });
              else {
                state.value = Math.max(0, Math.min(scrollY - rootTop + viewportHeight, rootHeight + viewportHeight)) * .55;
                render(state);
              }
            });
            update();
          };
          measure();
          const resize = new ResizeObserver(measure); resize.observe(root); resize.observe(stage);
          addEventListener('scroll', wake, { passive: true });
          return () => {
            resize.disconnect(); cancelAnimationFrame(frame);
            removeEventListener('scroll', wake);
            setters.forEach(set => set.tween.kill());
          };
        });
        cleanup = () => media.revert();
      });
    }, { rootMargin: `${Math.round(innerHeight * 1.2)}px 0px` });
    observer.observe(root);
    return () => { disposed = true; observer.disconnect(); cleanup?.(); };
  }, []);
  return <div className="postHero" ref={rootRef}>
    <div className="sidePhotoTrack" aria-hidden="true"><div className="sidePhotoStage">
      {sources.slice(0, 3).map(src => <img className="sidePhoto" key={src} src={src} alt="" width="600" height="800" loading="lazy" decoding="async" fetchPriority="low" />)}
    </div></div>
    {children}
  </div>;
}
