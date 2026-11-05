import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CircleAlert, ClipboardPlus, Pencil, Pill, Plus, Syringe, X, type LucideIcon } from 'lucide-react';
import { useStore } from '../lib/store';
import { childData, latestMeasurement, useActiveChild } from '../lib/derive';
import { age, fmtShort, parseDay } from '../lib/dates';

export function Health() {
  const { state, add, update, remove } = useStore();
  const child = useActiveChild()!;
  const d = childData(state, child.id);
  const { weight, height } = latestMeasurement(d.entries);
  const meds = [...d.medications].sort((a, b) => Number(b.active) - Number(a.active));

  return (
    <div className="page">
      <header className="top">
        <div><div className="eyebrow">{child.firstName} {child.lastName}</div><h1 className="display">Health</h1></div>
      </header>

      <div className="cols">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Section title="Allergies" Icon={CircleAlert} empty="No allergies recorded." addLabel="Add allergy"
            form={(done) => (
              <MiniForm fields={[{ name: 'name', label: 'Allergy', placeholder: 'Peanut' }, { name: 'reaction', label: 'Reaction', placeholder: 'Hives, no breathing trouble' }]}
                onSave={(v) => { add('allergies', { childId: child.id, name: v.name, reaction: v.reaction, status: 'suspected' }); done(); }} onCancel={done} />
            )}>
            {d.allergies.map((a) => (
              <div className="item" key={a.id}>
                <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontWeight: 500, fontSize: 15 }}>{a.name}</span>{a.reaction && <span className="muted">{a.reaction}</span>}</div>
                <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                  <button type="button" className="tag" style={{ border: 0, cursor: 'pointer' }} title="Change status" onClick={() => update('allergies', a.id, { status: a.status === 'suspected' ? 'confirmed' : 'suspected' })}>
                    {a.status === 'suspected' ? 'Suspected' : 'Confirmed'}
                  </button>
                  <RemoveButton label={`Remove ${a.name}`} onClick={() => remove('allergies', a.id)} />
                </span>
              </div>
            ))}
          </Section>

          <Section title="Medications" Icon={Pill} empty="No medications recorded." addLabel="Add medication"
            form={(done) => (
              <MiniForm fields={[{ name: 'name', label: 'Medication', placeholder: 'Cetirizine' }, { name: 'dose', label: 'Dose', placeholder: '2.5 mg' }, { name: 'schedule', label: 'When', placeholder: 'As needed for itching' }]}
                onSave={(v) => { add('medications', { childId: child.id, name: v.name, dose: v.dose, schedule: v.schedule, active: true }); done(); }} onCancel={done} />
            )}>
            {meds.map((m) => (
              <div className="item" key={m.id}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 500, fontSize: 15, color: m.active ? undefined : 'var(--muted)' }}>{m.name} {m.dose}</span>
                  {m.schedule && <span className="muted">{m.schedule}</span>}
                </div>
                <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                  <button type="button" className="tag" style={{ border: 0, cursor: 'pointer', background: m.active ? undefined : 'transparent', color: m.active ? undefined : 'var(--faint)' }} title="Change status" onClick={() => update('medications', m.id, { active: !m.active })}>
                    {m.active ? 'Current' : 'Past'}
                  </button>
                  <RemoveButton label={`Remove ${m.name}`} onClick={() => remove('medications', m.id)} />
                </span>
              </div>
            ))}
          </Section>

          <Section title="Ongoing conditions" Icon={ClipboardPlus} empty="None recorded. Add one if a doctor diagnoses something that needs tracking, like asthma or eczema." addLabel="Add condition"
            form={(done) => (
              <MiniForm fields={[{ name: 'name', label: 'Condition', placeholder: 'Eczema' }, { name: 'notes', label: 'Notes', placeholder: 'Flares in winter' }]}
                onSave={(v) => { add('conditions', { childId: child.id, name: v.name, notes: v.notes }); done(); }} onCancel={done} />
            )}>
            {d.conditions.map((c) => (
              <div className="item" key={c.id}>
                <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontWeight: 500, fontSize: 15 }}>{c.name}</span>{c.notes && <span className="muted">{c.notes}</span>}</div>
                <RemoveButton label={`Remove ${c.name}`} onClick={() => remove('conditions', c.id)} />
              </div>
            ))}
          </Section>

          <Section title="Vaccines due" Icon={Syringe} empty="No vaccines due recorded. Your pediatrician's office can tell you what is next." addLabel="Add vaccine"
            form={(done) => (
              <MiniForm fields={[{ name: 'name', label: 'Vaccine', placeholder: 'MMR, dose 2' }, { name: 'due', label: 'Due', placeholder: 'Next visit', type: 'date' }]}
                onSave={(v) => { add('vaccines', { childId: child.id, name: v.name, due: v.due }); done(); }} onCancel={done} />
            )}>
            {d.vaccines.map((v) => (
              <div className="item" key={v.id}>
                <span style={{ fontWeight: 500, fontSize: 15 }}>{v.name}</span>
                <span style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}>
                  <span className="muted num">{v.due ? (/^\d{4}-/.test(v.due) ? `Due ${fmtShort(v.due)}` : v.due) : ''}</span>
                  <RemoveButton label={`Mark ${v.name} as given`} onClick={() => remove('vaccines', v.id)} />
                </span>
              </div>
            ))}
          </Section>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="eyebrow">About {child.firstName}</div>
              <Link to="/app/settings" className="iconbtn" aria-label="Edit details" style={{ width: 32, height: 32 }}><Pencil size={15} aria-hidden /></Link>
            </div>
            <dl style={{ margin: 0 }}>
              <div className="kv num"><dt>Born</dt><dd>{parseDay(child.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</dd></div>
              <div className="kv"><dt>Age</dt><dd>{age(child.dob)}</dd></div>
              <div className="kv num"><dt>Weight</dt><dd>{weight ? <>{weight.weightKg} kg <span className="muted">· {fmtShort(weight.date)}</span></> : <span className="muted">Not recorded</span>}</dd></div>
              <div className="kv num"><dt>Height</dt><dd>{height ? <>{height.heightCm} cm <span className="muted">· {fmtShort(height.date)}</span></> : <span className="muted">Not recorded</span>}</dd></div>
            </dl>
          </div>
          <div className="panel">
            <div className="eyebrow">Pediatrician</div>
            {child.pediatrician ? (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span className="av" style={{ width: 36, height: 36 }}>{child.pediatrician.replace(/^Dr\.?\s*/i, '').split(/\s+/).map((p) => p[0] ?? '').join('').slice(0, 2).toUpperCase()}</span>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.35 }}><span style={{ fontWeight: 500 }}>{child.pediatrician}</span>{child.clinic && <span className="muted">{child.clinic}</span>}</div>
              </div>
            ) : <Link className="link" to="/app/settings">Add your pediatrician</Link>}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, Icon, empty, addLabel, form, children }: {
  title: string; Icon: LucideIcon; empty: string; addLabel: string;
  form: (done: () => void) => ReactNode; children: ReactNode[];
}) {
  const [adding, setAdding] = useState(false);
  return (
    <section aria-label={title} className="card-sec">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <span className="ico"><Icon size={17} strokeWidth={1.75} aria-hidden /></span>
        <h2 className="h2" style={{ fontSize: 22, flex: 1 }}>{title}</h2>
        {!adding && <button type="button" className="btn ghost" onClick={() => setAdding(true)} aria-label={addLabel}><Plus aria-hidden /><span className="hide-sm">{addLabel}</span></button>}
      </div>
      {children.length === 0 && !adding && <p className="muted" style={{ margin: 0, padding: '14px 0 12px', borderTop: '1px solid var(--line-soft)' }}>{empty}</p>}
      {children}
      {adding && form(() => setAdding(false))}
    </section>
  );
}

function MiniForm({ fields, onSave, onCancel }: {
  fields: { name: string; label: string; placeholder: string; type?: string }[];
  onSave: (v: Record<string, string>) => void; onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!values[fields[0].name]?.trim()) return;
    onSave(Object.fromEntries(fields.map((f) => [f.name, (values[f.name] ?? '').trim()])));
  };
  return (
    <form onSubmit={submit} className="panel" style={{ marginTop: 12 }}>
      <div className="row2" style={{ gridTemplateColumns: `repeat(${Math.min(fields.length, 3)}, minmax(0, 1fr))` }}>
        {fields.map((f, i) => (
          <label className="field" key={f.name}>
            <span>{f.label}</span>
            <input className="input" type={f.type ?? 'text'} placeholder={f.placeholder} autoFocus={i === 0} value={values[f.name] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} />
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn secondary" type="submit">Save</button>
        <button className="btn ghost" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" className="iconbtn" style={{ width: 32, height: 32 }} aria-label={label} title={label} onClick={onClick}><X size={15} aria-hidden /></button>;
}
