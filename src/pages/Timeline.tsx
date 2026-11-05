import { Fragment, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListFilter, Plus, Search } from 'lucide-react';
import { useStore } from '../lib/store';
import { childData, useActiveChild } from '../lib/derive';
import { fmtMonth, fmtShort } from '../lib/dates';
import { ENTRY_TYPES, TYPE_ORDER, VisitIcon } from '../lib/entryTypes';
import { Milestone } from '../components/Brand';
import type { EntryType } from '../lib/types';

type Filter = 'all' | EntryType | 'visit';
type Row = { id: string; date: string; kind: Filter; title: string; detail: string; href: string; isLastVisit?: boolean };

export function Timeline() {
  const { state } = useStore();
  const child = useActiveChild()!;
  const d = childData(state, child.id);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const rows = useMemo<Row[]>(() => {
    const entries: Row[] = d.entries.map((e) => ({ id: e.id, date: e.date, kind: e.type, title: e.title, detail: e.details, href: `/app/timeline/${e.id}` }));
    const visits: Row[] = d.past.map((a, i) => ({
      id: a.id, date: a.datetime.slice(0, 10), kind: 'visit', title: a.title,
      detail: [a.provider, a.notes].filter(Boolean).join('. '), href: `/app/appointments/${a.id}`, isLastVisit: i === 0,
    }));
    return [...entries, ...visits].sort((a, b) => b.date.localeCompare(a.date));
  }, [d.entries, d.past]);

  const q = query.trim().toLowerCase();
  const shown = rows.filter((r) => (filter === 'all' || r.kind === filter) && (!q || `${r.title} ${r.detail}`.toLowerCase().includes(q)));
  const groups: { month: string; rows: Row[] }[] = [];
  for (const r of shown) {
    const m = fmtMonth(r.date);
    if (groups.at(-1)?.month !== m) groups.push({ month: m, rows: [] });
    groups.at(-1)!.rows.push(r);
  }

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    ...TYPE_ORDER.map((t) => ({ key: t as Filter, label: ENTRY_TYPES[t].plural })),
    { key: 'visit', label: 'Visits' },
  ];
  const count = (k: Filter) => (k === 'all' ? rows.length : rows.filter((r) => r.kind === k).length);

  return (
    <div className="page narrow">
      <header className="top">
        <div><div className="eyebrow">{child.firstName} {child.lastName}</div><h1 className="display">Timeline</h1></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <label className="search">
            <Search size={16} aria-hidden />
            <input type="search" placeholder="Search entries" aria-label="Search entries" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <button type="button" className="btn secondary" aria-expanded={showFilters} onClick={() => { setShowFilters((v) => !v); setFilter('all'); }}>
            <ListFilter aria-hidden />{filter === 'all' ? 'Filter' : 'Filtered'}
          </button>
          <Link className="btn secondary" to="/app/timeline/new"><Plus aria-hidden />New entry</Link>
        </div>
      </header>

      {showFilters && (
        <div className="filters" role="tablist" aria-label="Filter by type">
          {tabs.filter((t) => t.key === 'all' || count(t.key) > 0).map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={filter === t.key} onClick={() => setFilter(t.key)}>
              {t.label}<small className="num">{count(t.key)}</small>
            </button>
          ))}
        </div>
      )}

      <div>
        {groups.length === 0 && (
          <div className="empty">
            <span className="serif">{rows.length ? 'No matching entries' : 'Nothing logged yet'}</span>
            <span className="muted">{rows.length ? 'Try another filter or search.' : 'Add symptoms, illnesses, medicines and notes as they happen. Mira gathers them into the next visit brief.'}</span>
            {!rows.length && <Link className="btn secondary" to="/app/timeline/new" style={{ marginTop: 6 }}><Plus aria-hidden />New entry</Link>}
          </div>
        )}
        {groups.map((g) => (
          <Fragment key={g.month}>
            <h2 className="month">{g.month}</h2>
            <ol className="tl" style={{ marginBottom: 20 }}>
              {g.rows.map((r) => {
                const Icon = r.kind === 'visit' ? VisitIcon : ENTRY_TYPES[r.kind as EntryType].Icon;
                const label = r.kind === 'visit' ? 'Visit' : ENTRY_TYPES[r.kind as EntryType].label;
                return (
                  <Fragment key={r.id}>
                    {r.isLastVisit && filter === 'all' && !q && (
                      <li className="marker-li">
                        <div className="marker" role="note">
                          <span className="num num-col" style={{ textAlign: 'right', fontSize: 13, fontWeight: 500 }}>{fmtShort(r.date)}</span>
                          <Milestone value={3} size={32} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>Last visit</span>
                            <span className="line" />
                            <span style={{ fontSize: 13 }}>Everything above goes into the next brief</span>
                          </div>
                        </div>
                      </li>
                    )}
                    <li>
                      <span className="date num">{fmtShort(r.date)}</span>
                      <span className="node"><Icon strokeWidth={1.75} aria-hidden /></span>
                      <Link className="body" to={r.href}>
                        <span className="title">{r.title}</span>
                        {r.detail && <span className="muted">{r.detail}</span>}
                        <span className="mobile-meta num">{fmtShort(r.date)} · {label}</span>
                      </Link>
                      <span />
                    </li>
                  </Fragment>
                );
              })}
            </ol>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
