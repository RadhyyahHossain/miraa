import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useStore } from '../lib/store';
import { sampleState } from '../lib/sample';
import { today } from '../lib/dates';
import { Lockup, Milestone } from '../components/Brand';
import { RestoreBackup } from '../components/Backup';
import type { Child } from '../lib/types';

export function ChildFields({ initial, submitLabel, onSubmit }: {
  initial?: Partial<Child>; submitLabel: string; onSubmit: (c: Omit<Child, 'id'>) => void;
}) {
  const [v, setV] = useState({
    firstName: initial?.firstName ?? '', lastName: initial?.lastName ?? '', dob: initial?.dob ?? '',
    pediatrician: initial?.pediatrician ?? '', clinic: initial?.clinic ?? '',
  });
  const [error, setError] = useState('');
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => { setV((x) => ({ ...x, [k]: e.target.value })); setError(''); };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!v.firstName.trim()) return setError('Add a first name.');
    if (!v.dob) return setError('Add a date of birth so Mira can show ages and milestones.');
    onSubmit({ firstName: v.firstName.trim(), lastName: v.lastName.trim(), dob: v.dob, pediatrician: v.pediatrician.trim(), clinic: v.clinic.trim() });
  };

  return (
    <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 560 }}>
      <div className="row2">
        <label className="field"><span>First name</span><input id="child-first" className="input" value={v.firstName} onChange={set('firstName')} autoComplete="off" /></label>
        <label className="field"><span>Last name</span><input id="child-last" className="input" value={v.lastName} onChange={set('lastName')} autoComplete="off" /></label>
      </div>
      <label className="field" style={{ maxWidth: 260 }}><span>Date of birth</span><input id="child-dob" className="input num" type="date" max={today()} value={v.dob} onChange={set('dob')} /></label>
      <div className="row2">
        <label className="field"><span>Pediatrician <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></span><input id="child-doc" className="input" placeholder="Dr. Okafor" value={v.pediatrician} onChange={set('pediatrician')} /></label>
        <label className="field"><span>Clinic <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></span><input id="child-clinic" className="input" placeholder="Riverside Pediatrics" value={v.clinic} onChange={set('clinic')} /></label>
      </div>
      {error && <span className="hint" role="alert" style={{ color: '#B42318' }}>{error}</span>}
      <div><button className="btn primary lg" type="submit">{submitLabel}</button></div>
    </form>
  );
}

/** First run: no children yet. One question at a time; the milestone fills a quarter per answer. */
export function Welcome() {
  const { add, replaceAll } = useStore();
  const [restoring, setRestoring] = useState(false);
  const [step, setStep] = useState(0);
  const [v, setV] = useState({ firstName: '', lastName: '', dob: '', pediatrician: '', clinic: '' });
  const [error, setError] = useState('');
  const name = v.firstName.trim();
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => { setV((x) => ({ ...x, [k]: e.target.value })); setError(''); };

  const next = (e: FormEvent) => {
    e.preventDefault();
    if (step === 0 && !name) return setError('What should we call them?');
    if (step === 1 && !v.dob) return setError(`Add ${name}'s birthday so Mira can track ages and milestones.`);
    if (step === 2) {
      setStep(3);
      // Let the circle complete before the app takes over.
      window.setTimeout(() => add('children', { firstName: name, lastName: v.lastName.trim(), dob: v.dob, pediatrician: v.pediatrician.trim(), clinic: v.clinic.trim() }), 1100);
      return;
    }
    setStep(step + 1);
  };

  const questions = [
    { title: "Let's start with your kid. What's their name?", sub: 'Just for you. Nothing leaves this device.' },
    { title: `Nice to meet ${name}. When were they born?`, sub: 'Mira uses this for ages, growth and well-visit timing.' },
    { title: `Who looks after ${name}?`, sub: 'Optional. It goes at the top of every visit brief.' },
    { title: `${name}'s record is ready.`, sub: 'Opening it now…' },
  ];
  const q = questions[step];

  return (
    <div className="welcome">
      <Link to="/" aria-label="Mira home page" style={{ alignSelf: 'flex-start' }}><Lockup style={{ height: 24, width: 'auto', color: 'var(--pine)' }} /></Link>
      {restoring ? <RestoreBackup onCancel={() => setRestoring(false)} /> : (
        <form onSubmit={next} noValidate className="ask" key={step}>
          <div className="ask-progress" aria-label={`Step ${Math.min(step + 1, 3)} of 3`}>
            <span className={step === 3 ? 'ask-done' : undefined}><Milestone value={step + 1} size={28} /></span>
            {step > 0 && step < 3 && <button type="button" className="ask-back" onClick={() => setStep(step - 1)}><ChevronLeft size={16} aria-hidden />Back</button>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h1 className="display ask-title">{q.title}</h1>
            <p className="muted" style={{ margin: 0, fontSize: 16.5 }}>{q.sub}</p>
          </div>
          {step === 0 && (
            <div className="row2">
              <label className="field"><span>First name</span><input autoFocus className="input lg" value={v.firstName} onChange={set('firstName')} autoComplete="off" placeholder="Layla" /></label>
              <label className="field"><span>Last name <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></span><input className="input lg" value={v.lastName} onChange={set('lastName')} autoComplete="off" /></label>
            </div>
          )}
          {step === 1 && (
            <label className="field" style={{ maxWidth: 280 }}><span>Birthday</span><input autoFocus className="input lg num" type="date" max={today()} value={v.dob} onChange={set('dob')} /></label>
          )}
          {step === 2 && (
            <div className="row2">
              <label className="field"><span>Pediatrician</span><input autoFocus className="input lg" placeholder="Dr. Okafor" value={v.pediatrician} onChange={set('pediatrician')} /></label>
              <label className="field"><span>Clinic</span><input className="input lg" placeholder="Riverside Pediatrics" value={v.clinic} onChange={set('clinic')} /></label>
            </div>
          )}
          {error && <span className="hint" role="alert" style={{ color: '#B42318' }}>{error}</span>}
          {step < 3 && (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn primary lg" type="submit">{step === 2 ? `Create ${name}'s record` : 'Continue'}</button>
              {step === 2 && !v.pediatrician && !v.clinic && <span className="muted" style={{ fontSize: 14 }}>You can skip this and add it later.</span>}
            </div>
          )}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <p className="muted" style={{ margin: 0 }}>
                Moving from another device? <button type="button" className="textlink" onClick={() => setRestoring(true)}>Restore from a backup file</button>
              </p>
              <p className="muted" style={{ margin: 0 }}>
                Just looking? <button type="button" className="textlink" onClick={() => replaceAll(sampleState())}>Explore with an example family</button>
              </p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

/** Adding another child from inside the app. */
export function AddChild() {
  const { add, setActiveChild } = useStore();
  const navigate = useNavigate();
  return (
    <div className="page narrow">
      <header>
        <Link to="/app" className="link" style={{ color: 'var(--muted)' }}><ChevronLeft size={16} aria-hidden />Home</Link>
        <h1 className="display" style={{ marginTop: 12 }}>Add a child</h1>
      </header>
      <ChildFields submitLabel="Add child" onSubmit={(c) => { const id = add('children', c); setActiveChild(id); navigate('/app'); }} />
    </div>
  );
}
