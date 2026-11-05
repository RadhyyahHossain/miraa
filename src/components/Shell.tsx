import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Calendar, ClipboardPlus, House, Plus } from 'lucide-react';
import { Lockup, Mark } from './Brand';
import { ChildSwitcher } from './ChildSwitcher';
import { BackupReminder, BackupStatus } from './Backup';
import { emptyState, useStore } from '../lib/store';

const RECORD_NAV = [
  { to: '/app/timeline', label: 'Timeline', Icon: Activity },
  { to: '/app/appointments', label: 'Visits', Icon: Calendar },
  { to: '/app/health', label: 'Health', Icon: ClipboardPlus },
];

/** Shown while the seeded example family is loaded. Starting your own record clears it. */
function ExampleBanner() {
  const { state, replaceAll } = useStore();
  const navigate = useNavigate();
  if (!state.example) return null;
  const names = state.children.map((c) => c.firstName).join(' and ');
  return (
    <div className="example-banner" role="status">
      <span><strong>This is an example family.</strong> <span className="muted">{names} show what Miraa looks like after a few months of use. Look around, then start your own.</span></span>
      <button type="button" className="btn primary" onClick={() => { replaceAll(emptyState()); navigate('/app'); }}>Start my own record<ArrowRight aria-hidden /></button>
    </div>
  );
}

export function Shell() {
  const { pathname } = useLocation();
  const onHome = pathname === '/app';

  return (
    <div className="shell">
      <aside className="side">
        <Link to="/" className="logo-link" aria-label="Miraa home page"><Lockup className="logo" title="Miraa" /></Link>
        <nav className="nav" aria-label="Family">
          <NavLink to="/app" end><House size={18} strokeWidth={1.75} aria-hidden />Home</NavLink>
        </nav>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="navlabel">Record</span>
          <ChildSwitcher />
          <nav className="nav" aria-label="Record">
            {RECORD_NAV.map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => (isActive || (to === '/app/appointments' && pathname.startsWith('/app/brief')) ? 'active' : '')}>
                <Icon size={18} strokeWidth={1.75} aria-hidden />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div style={{ marginTop: 'auto' }}><BackupStatus /></div>
      </aside>

      <header className="mhead">
        {onHome ? <Link to="/" aria-label="Miraa home page"><Lockup style={{ height: 19, width: 'auto', color: 'var(--pine)' }} /></Link> : <ChildSwitcher compact />}
        {!onHome && <Link to="/" aria-label="Miraa home page" style={{ display: 'flex' }}><Mark style={{ width: 24, height: 24, color: 'var(--pine)' }} /></Link>}
      </header>

      <main className="main">
        <ExampleBanner />
        <BackupReminder />
        <Outlet />
      </main>

      <nav className="tabs" aria-label="Main">
        <NavLink to="/app" end><House size={20} strokeWidth={1.75} aria-hidden />Home</NavLink>
        <NavLink to="/app/timeline" end><Activity size={20} strokeWidth={1.75} aria-hidden />Timeline</NavLink>
        <NavLink to="/app/timeline/new" aria-label="New entry"><span className="plus"><Plus size={20} strokeWidth={2} aria-hidden /></span></NavLink>
        <NavLink to="/app/appointments"><Calendar size={20} strokeWidth={1.75} aria-hidden />Visits</NavLink>
        <NavLink to="/app/health"><ClipboardPlus size={20} strokeWidth={1.75} aria-hidden />Health</NavLink>
      </nav>
    </div>
  );
}
