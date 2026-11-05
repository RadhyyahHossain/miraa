import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Lockup, Milestone } from '../components/Brand';
import { Motion, Reveal, SoftHeadline } from './MotionPlayer';
import { HandoverComp, LogComp, RecordComp, STEP } from './compositions';
import './landing.css';

const STEPS = [
  { n: '01', title: 'Log it when it happens', body: 'A symptom, a medicine, a reaction, a growth check. A few seconds from your phone, with the date and the details.', comp: LogComp, label: 'Animation: logging a fever as a new entry' },
  { n: '02', title: 'Mira keeps the record', body: "A timeline for each child, plus allergies, medicines and vaccines due. Mira knows when the last visit was and what changed since.", comp: RecordComp, label: 'Animation: entries building up on a timeline since the last visit' },
  { n: '03', title: 'Hand over one page', body: 'Before the appointment, choose what to include, add your questions, and print it or show it on your phone.', comp: HandoverComp, label: 'Animation: the visit brief completing and saving as a PDF' },
];

export default function Landing() {
  return (
    <div className="lp">
      <header className="lp-wrap lp-nav">
        <Link to="/" aria-label="Mira home page"><Lockup style={{ height: 24, width: 'auto', color: 'var(--pine)' }} /></Link>
        <Link className="btn secondary" to="/app">Open Mira</Link>
      </header>

      <section className="lp-wrap lp-hero">
        <SoftHeadline className="lp-h1" text="Walk into every checkup with one page." />
        <p className="muted lp-lede fade-in" style={{ animationDelay: '380ms' }}>
          Mira is the health record you keep for your kids. Log <a href="#how">fevers, medicines and reactions</a> as they happen, and Mira turns everything since the last visit into <a href="#how">one page for your pediatrician</a>.
        </p>
        <div className="lp-cta fade-in" style={{ animationDelay: '500ms' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link className="btn primary lg" to="/app">Start your child's record<ArrowRight aria-hidden /></Link>
            <a className="btn secondary lg" href="#how">See how it works</a>
          </div>
          <span className="lp-trust"><Milestone value={4} size={12} />Free in beta · No account · Your data never leaves your device</span>
        </div>
      </section>

      <section className="lp-wrap" id="how" style={{ paddingTop: 'clamp(64px, 8vw, 112px)', paddingBottom: 'clamp(72px, 10vw, 140px)' }} aria-labelledby="how-h">
        <Reveal className="eyebrow">How it works</Reveal>
        <Reveal as="h2" className="lp-h2" delay={60} style={{ marginTop: 14, maxWidth: '16ch' }}><span id="how-h">Three steps, and the record keeps itself.</span></Reveal>
        <div className="lp-steps">
          {STEPS.map((s) => (
            <div key={s.n} className="lp-step">
              <Reveal className="lp-step-copy">
                <span className="lp-n num">{s.n}</span>
                <h3 className="lp-step-title">{s.title}</h3>
                <p className="muted lp-step-body">{s.body}</p>
              </Reveal>
              <Reveal delay={100} className="lp-stage">
                <Motion component={s.comp} {...STEP} stillFrame={150} label={s.label} style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 2px rgba(35,28,24,.06), 0 12px 32px rgba(35,28,24,.08)' }} />
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-wrap" style={{ paddingBottom: 'clamp(72px, 10vw, 120px)' }} aria-label="Get started">
        <Reveal className="lp-banner">
          <svg className="lp-banner-mark" viewBox="0 0 120 120" aria-hidden>
            <circle cx="30" cy="30" r="22" fill="none" stroke="currentColor" strokeWidth="4" />
            <g transform="translate(66 6)"><circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="4" /><path d="M24 0A24 24 0 0 1 24 48Z" fill="currentColor" /></g>
            <g transform="translate(6 66)"><circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="4" /><path d="M24 24V0A24 24 0 1 1 0 24Z" fill="currentColor" /></g>
            <circle cx="90" cy="90" r="24" fill="currentColor" />
          </svg>
          <div className="lp-banner-copy">
            <h2 className="lp-h2" style={{ maxWidth: '15ch' }}>
              Everything since the <span className="lp-mark">last visit</span>, on one page.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
              <Link className="btn lg lp-btn-light" to="/app">Start your child's record<ArrowRight aria-hidden /></Link>
              <span style={{ fontSize: 13.5, color: '#b8aaa0' }}>Takes about a minute. Free while in beta.</span>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="lp-wrap lp-foot">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Lockup style={{ height: 20, width: 'auto', color: 'var(--pine)', alignSelf: 'flex-start' }} />
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <a href="#how">How it works</a>
          <Link to="/app">Open Mira</Link>
        </div>
      </footer>
    </div>
  );
}
