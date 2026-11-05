import { useEffect, useRef, useState, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import { Player, type PlayerRef } from '@remotion/player';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Speed multiplier for every landing animation. */
const PLAYBACK_RATE = 1.35;

/**
 * A Remotion composition that plays once when it first scrolls on screen.
 * With reduced motion it shows a single settled frame instead.
 */
export function Motion({ component, width, height, fps, durationInFrames, stillFrame, label, style }: {
  component: ComponentType; width: number; height: number; fps: number; durationInFrames: number;
  stillFrame: number; label: string; style?: CSSProperties;
}) {
  const ref = useRef<PlayerRef>(null);
  const box = useRef<HTMLDivElement>(null);
  const [reduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const el = box.current;
    if (!el || reduced) return;
    // Play once, the first time it scrolls into view, then hold the final frame.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        ref.current?.play();
        io.disconnect();
      }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div ref={box} role="img" aria-label={label} style={style}>
      <Player
        ref={ref}
        component={component}
        durationInFrames={durationInFrames}
        fps={fps}
        compositionWidth={width}
        compositionHeight={height}
        initialFrame={reduced ? stillFrame : 0}
        playbackRate={PLAYBACK_RATE}
        controls={false}
        clickToPlay={false}
        doubleClickToFullscreen={false}
        spaceKeyToPlayOrPause={false}
        moveToBeginningWhenEnded={false}
        acknowledgeRemotionLicense
        style={{ width: '100%', height: 'auto', aspectRatio: `${width} / ${height}` }}
      />
    </div>
  );
}

/** Soft, enterprise-quiet text reveal: a short fade and rise when the block enters the viewport. */
export function Reveal({ children, delay = 0, as: Tag = 'div', className, style }: {
  children: ReactNode; delay?: number; as?: 'div' | 'p' | 'h2' | 'h3' | 'span' | 'section'; className?: string; style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return setShown(true);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setShown(true);
        io.disconnect();
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Any = Tag as 'div';
  return (
    <Any ref={ref as never} className={`reveal${shown ? ' in' : ''}${className ? ` ${className}` : ''}`} style={{ ...style, transitionDelay: `${delay}ms` }}>
      {children}
    </Any>
  );
}

/** Headline that settles in word by word. */
export function SoftHeadline({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ');
  return (
    <h1 className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="word" style={{ animationDelay: `${120 + i * 70}ms` }}>{w}{i < words.length - 1 ? ' ' : ''}</span>
      ))}
    </h1>
  );
}
