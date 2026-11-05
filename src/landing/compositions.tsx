// Remotion compositions for the landing page. Everything is drawn in code; no video files.
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Bed, Check, CircleAlert, Download, PenLine, Pill, Thermometer } from 'lucide-react';
import { Lockup } from '../components/Brand';
import { C, HighlightRow, Label, Milestone, Node, SANS, SERIF, easeInOut, ramp, rise } from './anim';

const base = { fontFamily: SANS, color: C.ink, fontSize: 14, lineHeight: 1.45 } as const;

/* ------------------------------------------------------------------ */
/* Hero: entries land in the record, the brief fills, the page appears */
/* ------------------------------------------------------------------ */
export const HERO = { width: 1200, height: 660, fps: 30, durationInFrames: 390 };

const HERO_ENTRIES = [
  { at: 50, Icon: Thermometer, title: 'Fever 101.4 °F', date: 'Sep 29' },
  { at: 85, Icon: Bed, title: 'Ear infection, left', date: 'Sep 30' },
  { at: 120, Icon: CircleAlert, title: 'Hives after a peanut snack', date: 'Oct 18' },
];

export function HeroComp() {
  const f = useCurrentFrame();
  const fill = interpolate(f, [40, 60, 95, 130, 160, 200], [0, 0.25, 0.5, 0.75, 0.75, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut });
  const press = 1 - 0.04 * Math.sin(Math.PI * ramp(f, 205, 217));
  const sheetIn = ramp(f, 222, 258);
  const ready = f >= 200;

  return (
    <AbsoluteFill style={{ ...base, background: C.stage }}>
      {/* Phone */}
      <div style={{
        position: 'absolute', left: 150, top: 44, width: 316, height: 640, borderRadius: 46, background: C.paper,
        boxShadow: `0 0 0 1px #E5E5E5, 0 30px 80px rgba(35,28,24,.14)`, padding: '24px 22px', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', gap: 18, ...rise(f, 0, 24, 18),
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>LR</span>Layla
        </div>
        <div style={rise(f, 8)}>
          <Label>Next visit · in 7 days</Label>
          <div style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.2, margin: '6px 0 2px' }}>Thursday, Nov 12 at 9:30 am</div>
          <div style={{ color: C.muted, fontSize: 13 }}>4-year well visit · Dr. Okafor</div>
        </div>
        <div style={{ padding: 16, borderRadius: 16, background: C.soft, display: 'flex', flexDirection: 'column', gap: 14, ...rise(f, 16) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Milestone progress={fill} size={34} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.35, position: 'relative', minHeight: 38 }}>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{ready ? 'Your visit brief is ready' : `Visit brief ${Math.round(fill * 4)} of 4 ready`}</span>
              <span style={{ color: C.muted, fontSize: 12.5 }}>{ready ? 'One page for Dr. Okafor' : 'Updates as you log'}</span>
            </div>
          </div>
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', height: 42, borderRadius: 11, fontWeight: 500, fontSize: 14,
            background: C.pine, color: C.ground, transform: `scale(${press})`,
          }}>Compile visit brief</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Label style={rise(f, 30)}>Since the last visit</Label>
          {HERO_ENTRIES.map(({ at, Icon, title, date }) => (
            <div key={title} style={{ display: 'grid', gridTemplateColumns: '30px 1fr auto', gap: 12, alignItems: 'center', padding: '7px 0', ...rise(f, at, 20, 14) }}>
              <Node><Icon size={14} strokeWidth={1.75} /></Node>
              <span style={{ fontWeight: 500, fontSize: 13.5 }}>{title}</span>
              <span style={{ color: C.muted, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* The brief, handed over */}
      <div style={{
        position: 'absolute', left: 560, top: 70, width: 470, background: C.paper, borderRadius: 4, padding: '34px 38px',
        boxShadow: '0 0 0 1px #ECECEC, 0 24px 64px rgba(35,28,24,.10)', display: 'flex', flexDirection: 'column', gap: 14, fontSize: 12.5,
        opacity: sheetIn, transform: `translateX(${(1 - sheetIn) * 36}px)`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: `1px solid ${C.ink}` }}>
          <Lockup style={{ height: 14, width: 'auto', color: C.pine }} />
          <Label style={{ fontSize: 9.5 }}>Visit brief · Nov 12</Label>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.1 }}>Layla Rahman, 4 years 2 months</div>
        <Label style={{ fontSize: 9.5 }}>Since the last visit</Label>
        {[...HERO_ENTRIES].reverse().map((e, i) => (
          <HighlightRow key={e.title} progress={ramp(f, 255 + i * 12, 280 + i * 12)} right={e.date}><b style={{ fontWeight: 500 }}>{e.title}.</b></HighlightRow>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, ...rise(f, 300) }}>
          <div><Label style={{ fontSize: 9.5 }}>Allergies</Label><div style={{ padding: '6px 0', borderBottom: `1px solid ${C.lineSoft}` }}>Peanut, suspected</div></div>
          <div><Label style={{ fontSize: 9.5 }}>Vaccines due</Label><div style={{ padding: '6px 0', borderBottom: `1px solid ${C.lineSoft}` }}>DTaP 5 · MMR 2</div></div>
        </div>
        <div style={rise(f, 315)}>
          <Label style={{ fontSize: 9.5 }}>Questions from the family</Label>
          <div style={{ padding: '6px 0', borderBottom: `1px solid ${C.lineSoft}` }}><span style={{ color: C.muted }}>1.</span> Should we see an allergist?</div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ---------------------------------------- */
/* Step 1: log it when it happens            */
/* ---------------------------------------- */
export const STEP = { width: 560, height: 360, fps: 30, durationInFrames: 180 };

const TYPED = 'Fever 100.8 °F, ibuprofen at 7:15';

export function LogComp() {
  const f = useCurrentFrame();
  const chars = Math.round(interpolate(f, [26, 86], [0, TYPED.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const caret = f < 100 && Math.floor(f / 8) % 2 === 0;
  const press = 1 - 0.05 * Math.sin(Math.PI * ramp(f, 98, 108));
  const saved = ramp(f, 112, 134);
  const tiles = [
    { Icon: Thermometer, label: 'Symptom' },
    { Icon: Pill, label: 'Medicine' },
    { Icon: PenLine, label: 'Note' },
  ];
  return (
    <AbsoluteFill style={{ ...base, background: C.paper, padding: 30, boxSizing: 'border-box', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, ...rise(f, 0) }}>
        {tiles.map(({ Icon, label }, i) => {
          const on = i === 0 && f >= 12;
          return (
            <span key={label} style={{
              display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 12px', borderRadius: 10, fontWeight: 500, fontSize: 14,
              border: `1px solid ${on ? C.ink : '#E5E5E5'}`, boxShadow: on ? `inset 0 0 0 1px ${C.ink}` : 'none', color: on ? C.ink : C.ink2,
            }}>
              <Icon size={16} strokeWidth={1.75} color={on ? C.pine : C.faint} />{label}
            </span>
          );
        })}
      </div>
      <div style={{ height: 48, border: `1px solid ${f > 20 && f < 100 ? C.pine : '#DCE2DF'}`, borderRadius: 10, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 16, ...rise(f, 6) }}>
        {TYPED.slice(0, chars)}
        <span style={{ width: 1.5, height: 20, background: C.ink, marginLeft: 1, opacity: caret ? 1 : 0 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...rise(f, 10) }}>
        <span style={{ height: 40, padding: '0 18px', borderRadius: 9, background: C.pine, color: C.ground, display: 'flex', alignItems: 'center', fontWeight: 500, transform: `scale(${press})` }}>Save entry</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.pineDeep, fontWeight: 500, opacity: saved }}><Check size={16} strokeWidth={2} />Saved to Layla's timeline</span>
      </div>
      <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '30px 1fr auto', gap: 12, alignItems: 'center', paddingTop: 14, borderTop: `1px solid ${C.lineSoft}`, ...rise(f, 118, 22, 16) }}>
        <Node><Thermometer size={14} strokeWidth={1.75} /></Node>
        <span style={{ fontWeight: 500 }}>Fever 100.8 °F</span>
        <span style={{ color: C.muted, fontSize: 12.5 }}>Today</span>
      </div>
    </AbsoluteFill>
  );
}

/* ---------------------------------------- */
/* Step 2: Mira keeps the record             */
/* ---------------------------------------- */
export function RecordComp() {
  const f = useCurrentFrame();
  const rows = [
    { at: 8, Icon: PenLine, title: 'Snoring most nights', date: 'Oct 25' },
    { at: 26, Icon: CircleAlert, title: 'Hives after a peanut snack', date: 'Oct 18' },
    { at: 44, Icon: Pill, title: 'Finished amoxicillin', date: 'Oct 10' },
    { at: 62, Icon: Bed, title: 'Ear infection, left', date: 'Sep 30' },
  ];
  const line = ramp(f, 86, 126);
  return (
    <AbsoluteFill style={{ ...base, background: C.paper, padding: '26px 30px', boxSizing: 'border-box' }}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <span style={{ position: 'absolute', left: 14.5, top: 34, width: 1, height: `${ramp(f, 10, 80) * 190}px`, background: '#e9e2dc' }} />
        {rows.map(({ at, Icon, title, date }) => (
          <div key={title} style={{ display: 'grid', gridTemplateColumns: '30px 1fr auto', gap: 14, alignItems: 'center', padding: '8px 0', ...rise(f, at, 18, 12) }}>
            <Node><Icon size={14} strokeWidth={1.75} /></Node>
            <span style={{ fontWeight: 500, fontSize: 15 }}>{title}</span>
            <span style={{ color: C.muted, fontSize: 12.5, fontVariantNumeric: 'tabular-nums' }}>{date}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18, color: C.pineDeep, fontSize: 14, ...rise(f, 82) }}>
        <Milestone progress={0.75} size={26} />
        <b style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>Last visit, Aug 12</b>
        <span style={{ flex: 1, height: 1, background: '#f6d3bd', transformOrigin: 'left', transform: `scaleX(${line})` }} />
      </div>
      <span style={{ marginTop: 10, color: C.muted, fontSize: 13.5, ...rise(f, 120) }}>Everything above goes into the next brief.</span>
    </AbsoluteFill>
  );
}

/* ---------------------------------------- */
/* Step 3: hand over one page                */
/* ---------------------------------------- */
export function HandoverComp() {
  const f = useCurrentFrame();
  const fill = interpolate(f, [16, 52], [0.75, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut });
  const ready = f >= 52;
  const press = 1 - 0.05 * Math.sin(Math.PI * ramp(f, 76, 86));
  const sheet = ramp(f, 90, 126);
  return (
    <AbsoluteFill style={{ ...base, background: C.paper, padding: 30, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, ...rise(f, 0) }}>
        <Milestone progress={fill} size={44} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.35 }}>
          <span style={{ fontWeight: 500, fontSize: 16 }}>{ready ? 'Your visit brief is ready' : 'Visit brief 3 of 4 ready'}</span>
          <span style={{ color: C.muted, fontSize: 13.5 }}>{ready ? '6 updates · 2 questions · 1 page' : 'Adding your questions'}</span>
        </div>
      </div>
      <span style={{
        marginTop: 18, alignSelf: 'flex-start', height: 40, padding: '0 16px', borderRadius: 9, background: C.pine, color: C.ground,
        display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 500, transform: `scale(${press})`, opacity: ramp(f, 40, 60),
      }}><Download size={16} strokeWidth={1.75} />Save as PDF</span>
      <div style={{
        position: 'absolute', left: 30, right: 30, bottom: -20, height: 170, background: C.paper, borderRadius: '4px 4px 0 0',
        boxShadow: '0 0 0 1px #ECECEC, 0 -12px 40px rgba(35,28,24,.08)', padding: '18px 22px', boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12,
        opacity: sheet, transform: `translateY(${(1 - sheet) * 60}px)`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: `1px solid ${C.ink}` }}>
          <Lockup style={{ height: 12, width: 'auto', color: C.pine }} /><Label style={{ fontSize: 9 }}>Visit brief · Nov 12</Label>
        </div>
        <HighlightRow progress={ramp(f, 118, 140)} right="Oct 25"><b style={{ fontWeight: 500 }}>Snoring most nights.</b></HighlightRow>
        <HighlightRow progress={ramp(f, 128, 150)} right="Oct 18"><b style={{ fontWeight: 500 }}>Hives after a peanut snack.</b></HighlightRow>
      </div>
    </AbsoluteFill>
  );
}

/* ---------------------------------------- */
/* The visit brief, assembling itself        */
/* ---------------------------------------- */
export const BRIEF = { width: 620, height: 800, fps: 30, durationInFrames: 300 };

export function BriefComp() {
  const f = useCurrentFrame();
  const q2 = 'Is the nightly snoring worth checking?';
  const typed = Math.round(interpolate(f, [196, 240], [0, q2.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const row = { padding: '7px 8px', borderBottom: `1px solid ${C.lineSoft}`, display: 'flex', justifyContent: 'space-between', gap: 12 } as const;
  return (
    <AbsoluteFill style={{ ...base, background: C.stage, padding: 28, boxSizing: 'border-box' }}>
      <div style={{ flex: 1, background: C.paper, borderRadius: 4, boxShadow: '0 0 0 1px #ECECEC, 0 24px 64px rgba(35,28,24,.10)', padding: '40px 44px', display: 'flex', flexDirection: 'column', gap: 16, fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: `1px solid ${C.ink}`, ...rise(f, 0) }}>
          <Lockup style={{ height: 16, width: 'auto', color: C.pine }} /><Label style={{ fontSize: 10 }}>Visit brief · Nov 12, 2026</Label>
        </div>
        <div style={rise(f, 10)}>
          <div style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1.1, letterSpacing: '-0.01em' }}>Layla Rahman, 4 years 2 months</div>
          <div style={{ color: C.muted }}>4-year well visit with Dr. Amina Okafor · Last seen Aug 12</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Label style={{ fontSize: 10, ...rise(f, 24) }}>Since the last visit</Label>
          {[
            ['Snoring most nights.', 'About three weeks, no pauses.', 'Oct 25'],
            ['Hives after a peanut snack.', 'No breathing trouble.', 'Oct 18'],
            ['Finished amoxicillin.', 'Ten days, no side effects.', 'Oct 10'],
            ['Ear infection, left.', 'Urgent care visit.', 'Sep 30'],
          ].map(([t, d, date], i) => (
            <div key={t} style={rise(f, 30 + i * 10)}>
              <HighlightRow progress={ramp(f, 60 + i * 14, 86 + i * 14)} right={date}><b style={{ fontWeight: 500 }}>{t}</b> {d}</HighlightRow>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, ...rise(f, 130) }}>
            <Label style={{ fontSize: 10 }}>Allergies and medicines</Label>
            <div style={row}><span>Peanut, suspected</span></div>
            <div style={row}><span>Cetirizine 2.5 mg</span><span style={{ color: C.muted }}>As needed</span></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, ...rise(f, 150) }}>
            <Label style={{ fontSize: 10 }}>Vaccines due</Label>
            <div style={row}><span>DTaP 5 · IPV 4</span></div>
            <div style={row}><span>MMR 2 · Varicella 2</span></div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, ...rise(f, 172) }}>
          <Label style={{ fontSize: 10 }}>Questions from the family</Label>
          <div style={row}><span><span style={{ color: C.muted }}>1.</span> Should we see an allergist about the peanut reaction?</span></div>
          <div style={{ ...row, opacity: f >= 194 ? 1 : 0 }}><span><span style={{ color: C.muted }}>2.</span> {q2.slice(0, typed)}</span></div>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', color: C.muted, fontSize: 11, ...rise(f, 250) }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: C.tint }} />New since the last visit</span>
          <span>Example family</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}
