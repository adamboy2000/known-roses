'use client';
import { useEffect, useRef, type ReactNode } from 'react';

type Props = { frameDirectory: string; frameCount: number; sourceCrop?: number; smoothing?: number; poster: string; children: ReactNode };
export default function ScrollSequence({ frameDirectory, frameCount, sourceCrop = 40, smoothing = .2, poster, children }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const wrapper = wrapperRef.current!, canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const frames: (HTMLImageElement | null)[] = Array(frameCount).fill(null);
    let disposed = false, raf = 0, progress = 0, lastFrame = -1, loadingStarted = false;
    const pending = new Set<HTMLImageElement>();
    const clamp = (x: number) => Math.min(1, Math.max(0, x));
    const draw = (img: HTMLImageElement, index: number) => {
      const crop = Math.min(Math.max(sourceCrop, 0), img.naturalWidth - 1);
      const w = img.naturalWidth - crop, h = img.naturalHeight;
      const scale = Math.max(canvas.width / w, canvas.height / h);
      ctx.drawImage(img, crop, 0, w, h, (canvas.width - w * scale) / 2, (canvas.height - h * scale) / 2, w * scale, h * scale);
      lastFrame = index;
      canvas.dataset.frame = String(index + 1);
      canvas.style.opacity = '1';
    };
    const nearest = (index: number) => {
      for (let d = 0; d < frameCount; d++) {
        if (index - d >= 0 && frames[index - d]) return index - d;
        if (index + d < frameCount && frames[index + d]) return index + d;
      }
      return -1;
    };
    const tick = () => {
      raf = 0; if (disposed) return;
      const rect = wrapper.getBoundingClientRect();
      // Relative to this sequence's own travel, never the document height.
      const travel = rect.height - window.innerHeight;
      const target = motion.matches ? 0 : travel > 0 ? clamp(-rect.top / travel) : 0;
      progress += (target - progress) * Math.min(1, Math.max(.001, smoothing));
      const index = nearest(Math.round(progress * (frameCount - 1)));
      if (index >= 0 && index !== lastFrame) draw(frames[index]!, index);
      if (!motion.matches && Math.abs(target - progress) > .00001) wake();
    };
    function wake() { if (!disposed && !raf) raf = requestAnimationFrame(tick); }
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        if (lastFrame >= 0 && frames[lastFrame]) draw(frames[lastFrame]!, lastFrame);
      }
      wake();
    };
    const load = async (index: number) => {
      if (disposed) return;
      const img = new Image(); img.decoding = 'async'; img.fetchPriority = index === 0 ? 'high' : 'low'; pending.add(img);
      await new Promise<void>(resolve => {
        img.onload = () => resolve(); img.onerror = () => resolve();
        img.src = `${frameDirectory}/frame-${String(index + 1).padStart(3, '0')}.jpg`;
      });
      if (disposed) return;
      if (img.naturalWidth) {
        try { await img.decode(); } catch { /* onload already confirmed a drawable image */ }
        if (!disposed) { frames[index] = img; if (lastFrame < 0) draw(img, index); wake(); }
      }
      pending.delete(img);
    };
    const preload = async () => {
      if (loadingStarted || motion.matches || disposed) return;
      loadingStarted = true;
      let next = 1;
      // Six background workers avoid starving HTML, CSS and font requests.
      await Promise.all(Array.from({ length: 6 }, async () => { while (next < frameCount && !disposed) await load(next++); }));
    };
    const onMotion = () => { progress = 0; wake(); void preload(); };
    resize(); void load(0).then(preload);
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('resize', resize);
    motion.addEventListener('change', onMotion);
    const observer = new ResizeObserver(resize); observer.observe(wrapper); observer.observe(canvas);
    return () => {
      disposed = true; cancelAnimationFrame(raf); observer.disconnect();
      window.removeEventListener('scroll', wake); window.removeEventListener('resize', resize);
      window.visualViewport?.removeEventListener('resize', resize); motion.removeEventListener('change', onMotion);
      for (const img of pending) { img.onload = null; img.onerror = null; img.src = ''; }
      frames.fill(null);
    };
  }, [frameDirectory, frameCount, sourceCrop, smoothing]);
  return <div className="scrollSequence" ref={wrapperRef}>
    <div className="bgVideoHolder" aria-hidden="true"><div className="sequenceViewport" style={{ backgroundImage: `url("${poster}")` }}><canvas ref={canvasRef} className="bgVideo" /></div></div>
    {children}
  </div>;
}
