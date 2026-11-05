import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { childData, entriesForBrief, useActiveChild } from '../lib/derive';
import { fmtShort, today } from '../lib/dates';
import { ENTRY_TYPES, TYPE_ORDER } from '../lib/entryTypes';
import { Lockup } from '../components/Brand';
import type { EntryType } from '../lib/types';

export function EntryForm() {
  const { id } = useParams();
  const { state, add, update, remove } = useStore();
  const child = useActiveChild()!;
  const navigate = useNavigate();
  const existing = id ? state.entries.find((e) => e.id === id) : undefined;

  const [type, setType] = useState<EntryType>(existing?.type ?? 'symptom');
  const [date, setDate] = useState(existing?.date ?? today());
  const [title, setTitle] = useState(existing?.title ?? '');
  const [details, setDetails] = useState(existing?.details ?? '');
  const [weight, setWeight] = useState(existing?.weightKg?.toString() ?? '');
  const [height, setHeight] = useState(existing?.heightCm?.toString() ?? '');
  const [include, setInclude] = useState(existing?.includeInBrief ?? true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (id && !existing) {
    return (
      <div className="page narrow">
        <div className="empty"><span className="serif">This entry no longer exists</span><Link className="link" to="/app/timeline">Back to the timeline</Link></div>
      </div>
    );
  }

  const next = childData(state, child.id).next;
  const briefRows = next ? entriesForBrief(state, next).filter((e) => e.id !== id).slice(0, 4) : [];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Give the entry a short title, like "Fever 101 °F".');
      return;
    }
    const data = {
      childId: existing?.childId ?? child.id,
      type, date, title: title.trim(), details: details.trim(), includeInBrief: include,
      weightKg: type === 'measurement' && weight ? Number(weight) : undefined,
      heightCm: type === 'measurement' && height ? Number(height) : undefined,
    };
    if (existing) update('entries', existing.id, data);
    else add('entries', data);
    navigate('/app/timeline');
  };

  return (
    <div className="page">
      <header>
        <Link to="/app/timeline" className="link" style={{ color: 'var(--muted)' }}><ChevronLeft size={16} aria-hidden />Timeline</Link>
        <h1 className="display" style={{ marginTop: 12 }}>{existing ? 'Edit entry' : 'New entry'}</h1>
      </header>

      <div className="split">
        <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 600 }}>
          <div className="field">
            <span id="type-label">What happened</span>
            <div className="types" role="radiogroup" aria-labelledby="type-label">
              {TYPE_ORDER.map((t) => {
                const T = ENTRY_TYPES[t];
                return (
                  <button key={t} type="button" role="radio" aria-checked={type === t} className="type" onClick={() => setType(t)}>
                    <T.Icon strokeWidth={1.75} aria-hidden />{T.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="row2" style={{ gridTemplateColumns: 'minmax(0, 180px) minmax(0, 1fr)' }}>
            <label className="field"><span>Date</span><input id="entry-date" className="input num" type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} required /></label>
            <label className="field">
              <span>Title</span>
              <input id="entry-title" className="input" type="text" value={title} placeholder="Fever 101 °F" onChange={(e) => { setTitle(e.target.value); setError(''); }} aria-invalid={!!error} aria-describedby={error ? 'title-error' : undefined} />
            </label>
          </div>
          {error && <span id="title-error" className="hint" style={{ color: '#B42318', marginTop: -16 }}>{error}</span>}

          {type === 'measurement' && (
            <div className="row2">
              <label className="field"><span>Weight (kg)</span><input id="entry-weight" className="input num" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value.replace(/[^\d.]/g, ''))} placeholder="16.8" /></label>
              <label className="field"><span>Height (cm)</span><input id="entry-height" className="input num" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value.replace(/[^\d.]/g, ''))} placeholder="104" /></label>
            </div>
          )}

          <label className="field">
            <span>Details</span>
            <textarea id="entry-details" className="input" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="What you noticed, what you gave, and when." />
          </label>

          <div className="switchrow">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 500 }}>Include in the next visit brief</span>
              <span className="muted">{next ? `${fmtShort(next.datetime)}, ${next.title}` : 'Applies to the next appointment you add'}</span>
            </div>
            <button type="button" className="toggle" role="switch" aria-checked={include} aria-label="Include in the next visit brief" onClick={() => setInclude((v) => !v)} />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn primary lg" type="submit">{existing ? 'Save changes' : 'Save entry'}</button>
            <Link className="btn ghost lg" to="/app/timeline">Cancel</Link>
            {existing && (
              confirmDelete ? (
                <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  <span className="muted">Delete this entry?</span>
                  <button type="button" className="btn danger" onClick={() => { remove('entries', existing.id); navigate('/app/timeline'); }}>Delete</button>
                  <button type="button" className="btn ghost" onClick={() => setConfirmDelete(false)}>Keep</button>
                </span>
              ) : (
                <button type="button" className="btn danger" style={{ marginLeft: 'auto' }} onClick={() => setConfirmDelete(true)}><Trash2 aria-hidden />Delete</button>
              )
            )}
          </div>
        </form>

        <aside className="aside-preview" aria-label="Preview on the visit brief">
          <div className="eyebrow">On the visit brief</div>
          <div className="sheet" style={{ minHeight: 0, padding: '28px 26px', gap: 10, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--ink)' }}>
              <Lockup style={{ height: 13, width: 'auto', color: 'var(--pine)' }} />
              <span className="sk">{next ? `Visit brief · ${fmtShort(next.datetime)}` : 'Visit brief'}</span>
            </div>
            <span className="serif" style={{ fontSize: 18 }}>Since the last visit</span>
            {include && (
              <div className="srow new"><span><b style={{ fontWeight: 500 }}>{title || 'Your entry'}.</b> {details.slice(0, 60)}{details.length > 60 ? '…' : ''}</span><span className="num">{fmtShort(date)}</span></div>
            )}
            {briefRows.map((e) => (
              <div key={e.id} className="srow"><span>{e.title}</span><span className="num muted">{fmtShort(e.date)}</span></div>
            ))}
          </div>
          <span className="muted" style={{ fontSize: 13 }}>
            {include ? `New entries are highlighted so ${next?.provider || 'the doctor'} sees what changed first.` : 'This entry stays in the timeline but is left off the brief.'}
          </span>
        </aside>
      </div>
    </div>
  );
}
