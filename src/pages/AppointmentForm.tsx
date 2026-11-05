import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';
import { useActiveChild } from '../lib/derive';
import { today } from '../lib/dates';

export function AppointmentForm() {
  const { id } = useParams();
  const { state, add, update, remove } = useStore();
  const child = useActiveChild()!;
  const navigate = useNavigate();
  const existing = id ? state.appointments.find((a) => a.id === id) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [date, setDate] = useState(existing?.datetime.slice(0, 10) ?? today());
  const [time, setTime] = useState(existing?.datetime.slice(11, 16) ?? '09:00');
  const [provider, setProvider] = useState(existing?.provider ?? child.pediatrician);
  const [location, setLocation] = useState(existing?.location ?? child.clinic);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (id && !existing) {
    return <div className="page narrow"><div className="empty"><span className="serif">This appointment no longer exists</span><Link className="link" to="/app/appointments">Back to visits</Link></div></div>;
  }

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError('Name the visit, like "4-year well visit" or "Sick visit".');
    const data = { childId: existing?.childId ?? child.id, title: title.trim(), datetime: `${date}T${time || '09:00'}`, provider: provider.trim(), location: location.trim(), notes: notes.trim() };
    if (existing) update('appointments', existing.id, data);
    else add('appointments', data);
    navigate('/app/appointments');
  };

  return (
    <div className="page narrow">
      <header>
        <Link to="/app/appointments" className="link" style={{ color: 'var(--muted)' }}><ChevronLeft size={16} aria-hidden />Visits</Link>
        <h1 className="display" style={{ marginTop: 12 }}>{existing ? 'Edit visit' : 'New visit'}</h1>
      </header>
      <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 600 }}>
        <label className="field">
          <span>Visit</span>
          <input id="appt-title" className="input" value={title} placeholder="4-year well visit" onChange={(e) => { setTitle(e.target.value); setError(''); }} aria-invalid={!!error} aria-describedby={error ? 'appt-error' : undefined} />
          {error && <span id="appt-error" className="hint" style={{ color: '#B42318' }}>{error}</span>}
        </label>
        <div className="row2">
          <label className="field"><span>Date</span><input id="appt-date" className="input num" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <label className="field"><span>Time</span><input id="appt-time" className="input num" type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label>
        </div>
        <div className="row2">
          <label className="field"><span>Doctor or provider</span><input id="appt-provider" className="input" value={provider} placeholder="Dr. Okafor" onChange={(e) => setProvider(e.target.value)} /></label>
          <label className="field"><span>Location</span><input id="appt-location" className="input" value={location} placeholder="Riverside Pediatrics" onChange={(e) => setLocation(e.target.value)} /></label>
        </div>
        <label className="field">
          <span>Notes</span>
          <textarea id="appt-notes" className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="After the visit: what the doctor said, anything prescribed." />
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn primary lg" type="submit">{existing ? 'Save changes' : 'Save visit'}</button>
          <Link className="btn ghost lg" to="/app/appointments">Cancel</Link>
          {existing && (confirmDelete ? (
            <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <span className="muted">Delete this visit and its questions?</span>
              <button type="button" className="btn danger" onClick={() => { remove('appointments', existing.id); navigate('/app/appointments'); }}>Delete</button>
              <button type="button" className="btn ghost" onClick={() => setConfirmDelete(false)}>Keep</button>
            </span>
          ) : (
            <button type="button" className="btn danger" style={{ marginLeft: 'auto' }} onClick={() => setConfirmDelete(true)}><Trash2 aria-hidden />Delete</button>
          ))}
        </div>
      </form>
    </div>
  );
}
