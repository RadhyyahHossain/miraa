import { useStore } from '../lib/store';
import { childData, entriesForBrief, priorVisit } from '../lib/derive';
import { age, fmtShort, parseDateTime } from '../lib/dates';
import { Lockup } from './Brand';
import type { Appointment } from '../lib/types';

export function useBriefContent(appt: Appointment) {
  const { state } = useStore();
  const child = state.children.find((c) => c.id === appt.childId)!;
  const d = childData(state, appt.childId);
  const excluded = new Set(state.briefExcluded[appt.id] ?? []);
  const candidates = entriesForBrief(state, appt);
  return {
    child,
    candidates,
    excluded,
    included: candidates.filter((e) => !excluded.has(e.id)),
    prior: priorVisit(state, appt),
    questions: state.questions.filter((q) => q.appointmentId === appt.id),
    allergies: d.allergies,
    meds: d.medications.filter((m) => m.active),
    conditions: d.conditions,
    vaccines: d.vaccines,
  };
}

export function BriefSheet({ appt }: { appt: Appointment }) {
  const b = useBriefContent(appt);
  const when = parseDateTime(appt.datetime);
  const empty = <div className="srow"><span className="muted">None recorded</span><span /></div>;

  return (
    <article className="sheet" aria-label="Visit brief">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--ink)' }}>
        <Lockup style={{ height: 16, width: 'auto', color: 'var(--pine)' }} />
        <span className="sk">Visit brief · {when.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className="serif" style={{ fontSize: 24, lineHeight: 1.1, letterSpacing: '-0.01em' }}>{b.child.firstName} {b.child.lastName}, {age(b.child.dob)}</span>
        <span className="muted">
          {appt.title}{appt.provider ? ` with ${appt.provider}` : ''}
          {b.prior ? ` · Last seen ${fmtShort(b.prior.datetime)}` : ''}
          {` · Born ${fmtShort(b.child.dob)}`}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span className="sk">{b.prior ? 'Since the last visit' : 'Recent history'}</span>
        {b.included.length ? b.included.map((e) => (
          <div key={e.id} className="srow new">
            <span><b style={{ fontWeight: 500 }}>{e.title}.</b> {e.details}</span>
            <span className="num">{fmtShort(e.date)}</span>
          </div>
        )) : <div className="srow"><span className="muted">Nothing new reported.</span><span /></div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="sk">Allergies</span>
          {b.allergies.length ? b.allergies.map((a) => (
            <div key={a.id} className="srow"><span>{a.name}{a.reaction ? `: ${a.reaction}` : ''}</span><span className="muted">{a.status === 'suspected' ? 'Suspected' : ''}</span></div>
          )) : empty}
          <span className="sk" style={{ marginTop: 8 }}>Current medications</span>
          {b.meds.length ? b.meds.map((m) => (
            <div key={m.id} className="srow"><span>{m.name} {m.dose}</span><span className="muted">{m.schedule}</span></div>
          )) : empty}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="sk">Vaccines due</span>
          {b.vaccines.length ? b.vaccines.map((v) => (
            <div key={v.id} className="srow"><span>{v.name}</span><span className="muted num">{/^\d{4}-/.test(v.due) ? fmtShort(v.due) : v.due}</span></div>
          )) : empty}
          {b.conditions.length > 0 && (
            <>
              <span className="sk" style={{ marginTop: 8 }}>Ongoing conditions</span>
              {b.conditions.map((c) => <div key={c.id} className="srow"><span>{c.name}</span><span className="muted">{c.notes}</span></div>)}
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span className="sk">Questions from the family</span>
        {b.questions.length ? b.questions.map((q, i) => (
          <div key={q.id} className="srow"><span><span className="num muted">{i + 1}.</span> {q.text}</span><span /></div>
        )) : <div className="srow"><span className="muted">No questions added.</span><span /></div>}
      </div>

      <div className="muted" style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--pine-tint)' }} />New since the last visit</span>
        <span>Recorded by the family in Mira</span>
      </div>
    </article>
  );
}
