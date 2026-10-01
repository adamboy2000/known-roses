'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { useRoseAssets } from './RoseAssetsProvider';

const BG_WIDTH = 1920 * 1.18;
const BG_HEIGHT = BG_WIDTH * 941 / 1672;
function camera(progress: number) {
  const tilt = (1 - Math.exp(-1.6 * progress)) / (1 - Math.exp(-1.6));
  const backgroundWidth = 1920 * (1.18 + .07 * progress);
  const foregroundWidth = 1200 * (1 + .35 * progress);
  return {
    background: `translate3d(${((1920 - backgroundWidth) / 2 - 40) / BG_WIDTH * 100}%,${(-10 - 230 * tilt) / BG_HEIGHT * 100}%,0) scale(${backgroundWidth / BG_WIDTH})`,
    foreground: `translate3d(${(980 - foregroundWidth * .505 - 40) / 1200 * 100}%,${(515 - 430 * tilt) / 900 * 100}%,0) scale(${foregroundWidth / 1200})`,
  };
}
const opening = camera(0);

/** The same two planes and camera path used to bake the delivered JPG sequence.
 * Transforms run on composited image layers, avoiding 82 downloads and decodes.
 */
export default function RoseScene({ children }: { children: ReactNode }) {
  const roseAssets = useRoseAssets();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLImageElement>(null);
  const foregroundRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const wrapper = wrapperRef.current!, stage = stageRef.current!;
    const background = backgroundRef.current!, foreground = foregroundRef.current!;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, ready = false, raf = 0, progress = 0, previousTime = 0;
    let wrapperTop = 0, travel = 1;
    const target = () => motion.matches ? 0 : Math.max(0, Math.min(1, (scrollY - wrapperTop) / travel));
    const draw = () => {
      const transforms = camera(progress);
      background.style.transform = transforms.background;
      foreground.style.transform = transforms.foreground;
      stage.dataset.progress = progress.toFixed(5);
    };
    const tick = (time: number) => {
      raf = 0;
      if (disposed || !ready) return;
      const destination = target();
      // Retain the original .2 smoothing at 60Hz, with consistent speed at 120Hz.
      const elapsed = previousTime ? Math.min(64, time - previousTime) : 1000 / 60;
      previousTime = time;
      progress += (destination - progress) * (1 - Math.pow(.8, elapsed / (1000 / 60)));
      if (Math.abs(destination - progress) < .00001) progress = destination;
      draw();
      if (progress !== destination) wake(); else previousTime = 0;
    };
    function wake() { if (!disposed && ready && !raf) raf = requestAnimationFrame(tick); }
    const measure = () => {
      const rect = wrapper.getBoundingClientRect();
      wrapperTop = rect.top + scrollY;
      // A stable large viewport avoids jumps as mobile browser chrome collapses.
      const viewportHeight = wrapper.querySelector<HTMLElement>('.sequenceViewport')!.clientHeight;
      travel = Math.max(1, rect.height - viewportHeight);
      wake();
    };
    const onMotion = () => { progress = target(); previousTime = 0; draw(); wake(); };
    measure();
    // The cropped poster stays in place until both exact scene planes are decoded.
    Promise.all([background.decode(), foreground.decode()]).then(() => {
      if (disposed) return;
      ready = true; progress = 0; draw(); stage.dataset.ready = 'true'; wake();
    }).catch(() => { /* A failed layer leaves the complete photographic poster visible. */ });
    const observer = new ResizeObserver(measure); observer.observe(wrapper);
    addEventListener('scroll', wake, { passive: true }); addEventListener('resize', measure);
    motion.addEventListener('change', onMotion);
    return () => { disposed = true; cancelAnimationFrame(raf); observer.disconnect(); removeEventListener('scroll', wake); removeEventListener('resize', measure); motion.removeEventListener('change', onMotion); };
  }, []);
  return <div className="scrollSequence" ref={wrapperRef}>
    <link rel="preload" as="image" href={roseAssets.poster} fetchPriority="high"/>
    <div className="bgVideoHolder" aria-hidden="true"><div className="sequenceViewport roseViewport">
      <img className="rosePoster" src={roseAssets.poster} alt="" fetchPriority="high" decoding="async"/>
      <div className="roseStage" ref={stageRef} data-progress="0">
        <img className="rosePlane roseBackground" ref={backgroundRef} src={roseAssets.background} alt="" fetchPriority="high" decoding="async" width="1672" height="941" style={{ transform: opening.background }}/>
        <img className="rosePlane roseForeground" ref={foregroundRef} src={roseAssets.foreground} alt="" fetchPriority="high" decoding="async" width="1448" height="1086" style={{ transform: opening.foreground }}/>
      </div>
    </div></div>
    {children}
  </div>;
}
