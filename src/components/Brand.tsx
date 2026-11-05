import type { CSSProperties } from 'react';

const MarkShapes = () => (
  <g fill="currentColor">
    <circle cx="30" cy="30" r="22" fill="none" stroke="currentColor" strokeWidth="4" />
    <circle cx="90" cy="30" r="22" fill="none" stroke="currentColor" strokeWidth="4" />
    <path d="M90 6A24 24 0 0 1 90 54Z" />
    <circle cx="30" cy="90" r="22" fill="none" stroke="currentColor" strokeWidth="4" />
    <path d="M30 90V66A24 24 0 1 1 6 90Z" />
    <circle cx="90" cy="90" r="24" />
  </g>
);

const WordShapes = () => (
  <>
    <g fill="none" stroke="currentColor" strokeWidth="8">
      <path d="M4 40V16A12 12 0 0 1 28 16V40M28 16A12 12 0 0 1 52 16V40" />
      <path d="M70 0V40" />
      <path d="M88 40V16A12 12 0 0 1 100 4H104" />
      <circle cx="126" cy="20" r="16" />
      <path d="M142 0V40" />
      <circle cx="174" cy="20" r="16" />
      <path d="M190 0V40" />
    </g>
    <circle cx="70" cy="-11" r="5" fill="currentColor" />
  </>
);

type Props = { className?: string; style?: CSSProperties; title?: string };

export const Mark = ({ className, style, title = 'Miraa' }: Props) => (
  <svg viewBox="0 0 120 120" className={className} style={style} role="img" aria-label={title}>
    <MarkShapes />
  </svg>
);

export const Lockup = ({ className, style, title = 'Miraa' }: Props) => (
  <svg viewBox="3 -6 277 63" className={className} style={style} role="img" aria-label={title}>
    <g transform="scale(.5)">
      <MarkShapes />
    </g>
    <g transform="translate(84 10)">
      <WordShapes />
    </g>
  </svg>
);

const FILLS = [
  null,
  'M24 24V0A24 24 0 0 1 48 24Z',
  'M24 0A24 24 0 0 1 24 48Z',
  'M24 24V0A24 24 0 1 1 0 24Z',
];

/** The brand's progress glyph: a circle filled clockwise from 12 in quarters (0 to 4). */
export function Milestone({ value, size = 24, muted = false }: { value: number; size?: number; muted?: boolean }) {
  const v = Math.max(0, Math.min(4, Math.round(value)));
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} style={{ color: muted ? '#D9CFC7' : 'var(--pine)', flex: 'none' }} aria-hidden="true">
      {v === 4 ? (
        <circle cx="24" cy="24" r="24" fill="currentColor" />
      ) : (
        <>
          <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="4" />
          {FILLS[v] && <path d={FILLS[v]!} fill="currentColor" />}
        </>
      )}
    </svg>
  );
}
