import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import { useStore } from '../lib/store';
import { childData, readiness } from '../lib/derive';
import { age, fmtLong, fmtShort, fmtTime, isoDay, parseDateTime, parseDay } from '../lib/dates';
import { Milestone } from '../components/Brand';
import { initials } from '../components/ChildSwitcher';

const BRIEF_WINDOW_DAYS = 7;

export function FamilyHome() {
  const { state, setActiveChild } = useStore();
  const navigate = useNavigate();
  const now = Date.now();

  const upcoming = state.appointments
    .filter((a) => parseDateTime(a.datetime).getTime() >= now)
    .sort((a, b) => a.datetime.localeCompare(b.datetime))
    .slice(0, 6);

  const openChild = (id: string, path: string) => {
    setActiveChild(id);
    navigate(path);
  };

  return (
    <div className="page calm">
      <header>
        <div className="eyebrow">{fmtLong(new Date())}</div>
        <h1 className="display">{state.children.length > 1 ? 'Your family' : `${state.children[0].firstName}'s record`}</h1>
      </header>

      <section aria-labelledby="coming-up">
        <h2 className="h2" id="coming-up" style={{ marginBottom: 14 }}>Coming up</h2>
        {upcoming.length === 0 ? (
          <div className="empty">
            <span className="muted">No visits scheduled. Add the next one and Miraa will start preparing a brief for it.</span>
            <Link className="btn secondary" to="/app/appointments/new" style={{ marginTop: 6 }}><Plus aria-hidden />Add a visit</Link>
          </div>
        ) : (
          <div className="visits">
            {upcoming.map((a) => {
              const child = state.children.find((c) => c.id === a.childId);
              if (!child) return null;
              const when = parseDateTime(a.datetime);
              const opens = new Date(when);
              opens.setDate(opens.getDate() - BRIEF_WINDOW_DAYS);
              const open = opens.getTime() <= now;
              const r = readiness(state, a);
              return (
                <div className="visit" key={a.id}>
                  <button type="button" className="datebox plain" onClick={() => openChild(child.id, `/app/appointments/${a.id}`)} aria-label={`Edit ${a.title}`}>
                    <small>{when.toLocaleDateString('en-US', { month: 'short' })}</small>
                    <b className="num">{when.getDate()}</b>
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                    {state.children.length > 1 && <span className="who"><span className="av sm">{initials(child.firstName, child.lastName)}</span>{child.firstName}</span>}
                    <span style={{ fontSize: 17, fontWeight: 500 }}>{a.title}</span>
                    <span className="muted" style={{ fontSize: 14 }}>
                      {when.toLocaleDateString('en-US', { weekday: 'long' })}, {fmtTime(when)}{a.provider ? ` · ${a.provider}` : ''}
                    </span>
                  </div>
                  {open ? (
                    <button type="button" className="briefchip" data-ready={r.done === 4 || undefined} onClick={() => openChild(child.id, `/app/brief/${a.id}`)}>
                      <Milestone value={r.done} size={24} />
                      {r.done === 4 ? 'Brief ready' : 'Finish brief'}
                    </button>
                  ) : (
                    <span className="muted brief-later">Brief opens {fmtShort(isoDay(opens))}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="children-h">
        <h2 className="h2" id="children-h" style={{ marginBottom: 14 }}>{state.children.length > 1 ? 'Children' : 'Record'}</h2>
        <div className="kids">
          {state.children.map((c) => {
            const d = childData(state, c.id);
            const since = d.lastVisit ? parseDay(d.lastVisit.datetime).getTime() : -Infinity;
            const fresh = d.entries.filter((e) => parseDay(e.date).getTime() > since).length;
            return (
              <div className="kid-card" key={c.id}>
                <button type="button" className="kid-open" onClick={() => openChild(c.id, '/app/timeline')}>
                  <span className="av lg">{initials(c.firstName, c.lastName)}</span>
                  <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3, flex: 1, minWidth: 0 }}>
                    <span className="serif" style={{ fontSize: 24 }}>{c.firstName}</span>
                    <span className="muted" style={{ fontSize: 14 }}>{age(c.dob)}</span>
                  </span>
                  <ChevronRight size={18} color="var(--faint)" aria-hidden />
                </button>
                <span className="muted">
                  {fresh === 0 ? 'Nothing new since the last visit' : `${fresh} ${fresh === 1 ? 'entry' : 'entries'} since ${d.lastVisit ? `the last visit on ${fmtShort(d.lastVisit.datetime)}` : 'you started'}`}
                </span>
                <div>
                  <button type="button" className="btn ghost" style={{ marginLeft: -10 }} onClick={() => openChild(c.id, '/app/timeline/new')}><Plus aria-hidden />Add entry</button>
                </div>
              </div>
            );
          })}
          <Link className="add-kid" to="/app/children/new"><Plus size={18} aria-hidden />Add a child</Link>
        </div>
      </section>
    </div>
  );
}
