import { Link } from 'react-router-dom';
import { Clock, FileText, MapPin, Plus } from 'lucide-react';
import { useStore } from '../lib/store';
import { childData, readiness, useActiveChild } from '../lib/derive';
import { fmtShort, fmtTime, isoDay, parseDateTime, parseDay } from '../lib/dates';
import { Milestone } from '../components/Brand';

export function Appointments() {
  const { state } = useStore();
  const child = useActiveChild()!;
  const d = childData(state, child.id);
  const next = d.next;

  return (
    <div className="page narrow">
      <header className="top">
        <div><div className="eyebrow">{child.firstName} {child.lastName}</div><h1 className="display">Visits</h1></div>
        <Link className="btn secondary" to="/app/appointments/new"><Plus aria-hidden />Add a visit</Link>
      </header>

      <section aria-label="Upcoming">
        <h2 className="h2" style={{ marginBottom: 18 }}>Upcoming</h2>
        {d.upcoming.length === 0 ? (
          <div className="empty"><span className="muted">No upcoming visits. Add one and Miraa will gather everything since the last visit into a brief.</span></div>
        ) : (
          <div className="appts">
            {d.upcoming.map((a) => {
              const when = parseDateTime(a.datetime);
              const r = readiness(state, a);
              const opensOn = new Date(when);
              opensOn.setDate(opensOn.getDate() - 7);
              const isNext = a.id === next?.id;
              return (
                <div key={a.id} className="appt">
                  <Link to={`/app/appointments/${a.id}`} className="datebox" aria-label={`Edit ${a.title}`}>
                    <small>{when.toLocaleDateString('en-US', { month: 'short' })}</small>
                    <b className="num">{when.getDate()}</b>
                  </Link>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                    <Link to={`/app/appointments/${a.id}`} style={{ fontSize: 17, fontWeight: 500, color: 'var(--ink)' }}>{a.title}</Link>
                    <div className="meta-row">
                      <span><Clock size={15} aria-hidden />{when.toLocaleDateString('en-US', { weekday: 'long' })}, {fmtTime(when)}{when.getFullYear() !== new Date().getFullYear() ? ` · ${when.getFullYear()}` : ''}</span>
                      {(a.provider || a.location) && <span><MapPin size={15} aria-hidden />{[a.provider, a.location].filter(Boolean).join(', ')}</span>}
                    </div>
                  </div>
                  {isNext ? (
                    <Link to={`/app/brief/${a.id}`} className="briefchip" data-ready={r.done === 4 || undefined}>
                      <Milestone value={r.done} size={26} />
                      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.35 }}>
                        <span style={{ fontWeight: 500 }}>{r.done === 4 ? 'Brief ready' : `Brief ${r.done} of 4 ready`}</span>
                        <span style={{ color: 'var(--pine-deep)', fontSize: 13, fontWeight: 500 }}>{r.done === 4 ? 'Open brief' : 'Finish brief'}</span>
                      </span>
                    </Link>
                  ) : (
                    <span className="muted briefchip" style={{ background: 'transparent' }}><Milestone value={0} size={26} muted />Brief opens {fmtShort(isoDay(opensOn))}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section aria-label="Past visits">
        <h2 className="h2" style={{ marginBottom: 18 }}>Past visits</h2>
        {d.past.length === 0 ? (
          <div className="empty"><span className="muted">Past visits will appear here after their date.</span></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr><th scope="col">Date</th><th scope="col">Visit</th><th scope="col">Provider</th><th scope="col">Brief</th></tr></thead>
              <tbody>
                {d.past.map((a) => (
                  <tr key={a.id}>
                    <td className="num muted" style={{ whiteSpace: 'nowrap' }}>{parseDay(a.datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td><Link to={`/app/appointments/${a.id}`} style={{ color: 'var(--ink)', fontWeight: 500 }}>{a.title}</Link>{a.notes && <div className="muted">{a.notes}</div>}</td>
                    <td className="muted">{a.provider}</td>
                    <td>{a.briefSavedAt ? <Link to={`/app/brief/${a.id}`} className="link" style={{ color: 'var(--ink)' }}><FileText size={16} color="var(--pine)" aria-hidden />Saved</Link> : <span className="muted">None</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
