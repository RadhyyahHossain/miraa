// Shared pieces for the landing page's Remotion compositions.
import type { CSSProperties, ReactNode } from 'react';
import { Easing, interpolate } from 'remotion';

export const C = {
  ground: '#FFFFFF',
  paper: '#FFFFFF',
  stage: '#F7F7F7',
  ink: '#231C18',
  ink2: '#463D37',
  muted: '#6B625C',
  faint: '#938A83',
  line: '#ECECEC',
  lineSoft: '#F2F2F2',
  chip: '#F3F3F3',
  soft: '#F7F7F7',
  pine: '#C2410C',
  pineDeep: '#9A3412',
  tint: '#FDEEE3',
};

export const SERIF = "'Newsreader', Georgia, serif";
export const SANS = "'Geist', 'Helvetica Neue', Arial, sans-serif";

export const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0 to 1 between two frames, eased and clamped. */
export const ramp = (frame: number, from: number, to: number, easing = easeOut) =>
  interpolate(frame, [from, to], [0, 1], { easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

/** Soft rise-in used for every element: fade plus a short upward drift. */
export const rise = (frame: number, start: number, dur = 18, dist = 10): CSSProperties => {
  const p = ramp(frame, start, start + dur);
  return { opacity: p, transform: `translateY(${(1 - p) * dist}px)` };
};


/** A circle filled clockwise from 12 o'clock: the brand's milestone glyph at any progress. */
export function Milestone({ progress, size, color = C.pine }: { progress: number; size: number; color?: string }) {
  const p = Math.max(0, Math.min(1, progress));
  const r = 24;
  const a = p * Math.PI * 2;
  const x = 24 + r * Math.sin(a);
  const y = 24 - r * Math.cos(a);
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} style={{ flex: 'none', color }} aria-hidden>
      {p >= 0.999 ? (
        <circle cx="24" cy="24" r="24" fill="currentColor" />
      ) : (
        <>
          <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="4" />
          {p > 0.001 && <path d={`M24 24V0A24 24 0 ${p > 0.5 ? 1 : 0} 1 ${x} ${y}Z`} fill="currentColor" />}
        </>
      )}
    </svg>
  );
}

export const Label = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#776d66', ...style }}>{children}</span>
);

export const Node = ({ children }: { children: ReactNode }) => (
  <span style={{ width: 30, height: 30, borderRadius: '50%', background: C.chip, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#51463f', flex: 'none' }}>
    {children}
  </span>
);

/** A row that "highlights" with a left-to-right tint wipe, the way a parent marks what changed. */
export function HighlightRow({ progress, children, right }: { progress: number; children: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 8px', borderRadius: 4 }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: 4, background: C.tint, transformOrigin: 'left', transform: `scaleX(${progress})` }} />
      <span style={{ position: 'relative' }}>{children}</span>
      {right && <span style={{ position: 'relative', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{right}</span>}
    </div>
  );
}
