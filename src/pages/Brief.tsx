import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Download, Plus, Printer, ShieldCheck, X } from 'lucide-react';
import { backupAgeDays, backupAgeLabel } from '../lib/backup';
import { useStore } from '../lib/store';
import { childData, useActiveChild } from '../lib/derive';
import { fmtShort, fmtLong, parseDateTime, today } from '../lib/dates';
import { ENTRY_TYPES } from '../lib/entryTypes';
import { BriefSheet, useBriefContent } from '../components/BriefSheet';
import type { Appointment } from '../lib/types';

/** /brief picks the next appointment, or the most recent one. */
export function BriefIndex() {
  const { state } = useStore();
  const child = useActiveChild()!;
  const d = childData(state, child.id);
  const target = d.next ?? d.lastVisit;
  if (target) return <Navigate to={`/app/brief/${target.id}`} replace />;
  return (
    <div className="page narrow">
      <header><div className="eyebrow">{child.firstName} {child.lastName}</div><h1 className="display">Visit brief</h1></header>
      <div className="empty">
        <span className="serif">Add a visit first</span>
        <span className="muted">A brief is made for a specific visit. Miraa gathers everything logged since the last one into a single page for the doctor.</span>
        <Link className="btn secondary" to="/app/appointments/new" style={{ marginTop: 6 }}><Plus aria-hidden />Add a visit</Link>
      </div>
    </div>
  );
}

export function Brief() {
  const { id } = useParams();
  const { state } = useStore();
  const appt = state.appointments.find((a) => a.id === id);
  if (!appt) return <Navigate to="/app/brief" replace />;
  return <BriefEditor appt={appt} />;
}

function BriefEditor({ appt }: { appt: Appointment }) {
  const { add, remove, update, toggleBriefEntry } = useStore();
  const b = useBriefContent(appt);
  const [draft, setDraft] = useState('');
  const navigate = useNavigate();
  const { hash } = useLocation();
  const when = parseDateTime(appt.datetime);

  useEffect(() => {
    if (hash === '#questions') document.getElementById('question-input')?.focus();
  }, [hash]);

  const addQuestion = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    add('questions', { appointmentId: appt.id, text });
    setDraft('');
  };

  const savePdf = () => {
    update('appointments', appt.id, { briefSavedAt: today() });
    navigate(`/app/brief/${appt.id}/print`);
  };

  return (
    <div className="page" style={{ maxWidth: 1240 }}>
      <div className="brief-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <header>
            <div className="eyebrow">For {fmtLong(when)}</div>
            <h1 className="display">Visit brief</h1>
            <p className="muted" style={{ margin: '10px 0 0', maxWidth: '42ch' }}>
              One page for {appt.provider || 'the doctor'}. Choose what to include and add your questions.
            </p>
          </header>

          <section aria-label={b.prior ? 'Since the last visit' : 'Recent history'}>
            <div className="grp-h">
              <span className="serif" style={{ fontSize: 21 }}>{b.prior ? 'Since the last visit' : 'Recent history'}</span>
              <span className="muted num">{b.included.length} of {b.candidates.length} included</span>
            </div>
            {b.candidates.length === 0 ? (
              <p className="muted" style={{ margin: 0, padding: '12px 0', borderTop: '1px solid var(--line-soft)' }}>
                Nothing logged {b.prior ? `since ${fmtShort(b.prior.datetime)}` : 'yet'}. <Link to="/app/timeline/new">Add an entry</Link>
              </p>
            ) : b.candidates.map((e) => (
              <label key={e.id} className="check">
                <input type="checkbox" checked={!b.excluded.has(e.id)} onChange={() => toggleBriefEntry(appt.id, e.id)} />
                <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 500 }}>{e.title}</span>
                  <span className="muted" style={{ fontSize: 13 }}>{ENTRY_TYPES[e.type].label}</span>
                </span>
                <span className="muted num" style={{ fontSize: 13 }}>{fmtShort(e.date)}</span>
              </label>
            ))}
          </section>

          <section aria-label="Your questions" id="questions">
            <div className="grp-h">
              <span className="serif" style={{ fontSize: 21 }}>Your questions</span>
              <span className="muted num">{b.questions.length}</span>
            </div>
            {b.questions.map((q, i) => (
              <div key={q.id} className="check" style={{ cursor: 'default' }}>
                <span className="muted num">{i + 1}</span>
                <span>{q.text}</span>
                <button type="button" className="iconbtn" style={{ width: 28, height: 28 }} aria-label={`Remove question ${i + 1}`} onClick={() => remove('questions', q.id)}><X size={14} aria-hidden /></button>
              </div>
            ))}
            <form className="addq" onSubmit={addQuestion}>
              <input id="question-input" className="input" placeholder={`Add a question for ${appt.provider || 'the doctor'}`} aria-label="New question" value={draft} onChange={(e) => setDraft(e.target.value)} />
              <button className="btn secondary" type="submit" style={{ height: 44 }}>Add</button>
            </form>
          </section>

          <div className="brief-actions">
            <button className="btn primary lg" type="button" onClick={savePdf}><Download aria-hidden />Save as PDF</button>
            <button className="btn secondary lg" type="button" onClick={() => navigate(`/app/brief/${appt.id}/print`)}><Printer aria-hidden />Print</button>
          </div>
        </div>

        <div className="stage" aria-label="Preview">
          <BriefSheet appt={appt} />
        </div>
      </div>
    </div>
  );
}

export function BriefPrint() {
  const { id } = useParams();
  const { state } = useStore();
  const appt = state.appointments.find((a) => a.id === id);

  useEffect(() => {
    if (!appt) return;
    let cancelled = false;
    // Wait for web fonts so the PDF uses Newsreader and Geist.
    document.fonts.ready.then(() => { if (!cancelled) window.print(); });
    return () => { cancelled = true; };
  }, [appt]);

  if (!appt) return <Navigate to="/app/brief" replace />;
  return (
    <div className="print-root" style={{ minHeight: '100%', background: '#f6f1ec' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '16px 20px', maxWidth: 652, margin: '0 auto' }}>
        <Link className="link" to={`/app/brief/${appt.id}`} style={{ color: 'var(--muted)' }}><ChevronLeft size={16} aria-hidden />Back to the brief</Link>
        <button className="btn primary" type="button" onClick={() => window.print()}><Printer aria-hidden />Print or save PDF</button>
      </div>
      {(backupAgeDays(state.lastBackupAt) ?? Infinity) > 0 && (
        <div className="no-print panel" style={{ maxWidth: 612, margin: '0 auto 20px', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          <ShieldCheck size={20} color="var(--pine)" strokeWidth={1.75} aria-hidden />
          <span style={{ flex: 1, minWidth: 220 }}><b style={{ fontWeight: 500 }}>Good moment for a backup.</b> <span className="muted">{backupAgeLabel(state.lastBackupAt)}.</span></span>
          <Link className="btn secondary" to="/app/settings#backup">Save a backup</Link>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 16px 40px' }}>
        <BriefSheet appt={appt} />
      </div>
    </div>
  );
}
