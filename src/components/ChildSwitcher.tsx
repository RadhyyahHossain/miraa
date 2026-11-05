import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronsUpDown, Settings, UserPlus } from 'lucide-react';
import { useStore } from '../lib/store';
import { useActiveChild } from '../lib/derive';
import { age } from '../lib/dates';

export const initials = (first: string, last: string) => `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();

export function ChildSwitcher({ compact = false }: { compact?: boolean }) {
  const { state, setActiveChild } = useStore();
  const child = useActiveChild();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  if (!child) return null;
  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="switch" ref={ref}>
      <button className="kid" type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} style={compact ? { width: 'auto', paddingRight: 10 } : undefined}>
        <span className="av">{initials(child.firstName, child.lastName)}</span>
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, lineHeight: 1.3 }}>
          <span style={{ fontWeight: 500 }}>{compact ? child.firstName : `${child.firstName} ${child.lastName}`}</span>
          {!compact && <span className="muted" style={{ fontSize: 12 }}>{age(child.dob, true)}</span>}
        </span>
        <ChevronsUpDown size={16} color="var(--faint)" aria-hidden />
      </button>
      {open && (
        <div className="menu" role="menu">
          {state.children.map((c) => (
            <button key={c.id} role="menuitem" type="button" onClick={() => { setActiveChild(c.id); setOpen(false); }}>
              <span className="av">{initials(c.firstName, c.lastName)}</span>
              <span style={{ flex: 1 }}>{c.firstName} {c.lastName}</span>
              {c.id === child.id && <Check size={16} color="var(--pine)" aria-label="Selected" />}
            </button>
          ))}
          <hr />
          <button role="menuitem" type="button" onClick={() => go('/app/children/new')}><UserPlus size={16} color="var(--faint)" aria-hidden />Add a child</button>
          <button role="menuitem" type="button" onClick={() => go('/app/settings')}><Settings size={16} color="var(--faint)" aria-hidden />Settings</button>
        </div>
      )}
    </div>
  );
}
