import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Download, Share, Smartphone } from 'lucide-react';
import { emptyState, useStore } from '../lib/store';
import { useActiveChild } from '../lib/derive';
import { backupAgeLabel } from '../lib/backup';
import { useInstall } from '../lib/install';
import { ChildFields } from './ChildForm';
import { CreateBackup, RestoreBackup } from '../components/Backup';

export function Settings() {
  const { state, update, remove, replaceAll } = useStore();
  const child = useActiveChild()!;
  const navigate = useNavigate();
  const { hash } = useLocation();
  const install = useInstall();
  const [saved, setSaved] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [confirm, setConfirm] = useState<'child' | 'all' | null>(null);

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash]);

  const lastBackup = state.lastBackupAt
    ? new Date(state.lastBackupAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="page narrow">
      <header><div className="eyebrow">Settings</div><h1 className="display">{child.firstName}'s details</h1></header>

      <section>
        <ChildFields key={child.id} initial={child} submitLabel={saved ? 'Saved' : 'Save details'}
          onSubmit={(c) => { update('children', child.id, c); setSaved(true); setTimeout(() => setSaved(false), 1800); }} />
      </section>

      <section id="backup" className="settings-sec" aria-labelledby="backup-h">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
          <h2 className="h2" id="backup-h">Backup</h2>
          <span className="muted">{backupAgeLabel(state.lastBackupAt)}{lastBackup ? ` · ${lastBackup}` : ''}</span>
        </div>
        <p className="muted" style={{ margin: 0, maxWidth: '60ch' }}>
          Mira has no account because there is nothing for us to store. Your records live on this device. A backup is an encrypted file you keep,
          like a folder of your child's papers. Save it to iCloud Drive, Google Drive or email, and restore it on any device.
        </p>
        <CreateBackup />
        {restoring ? <RestoreBackup onCancel={() => setRestoring(false)} /> : (
          <div><button className="btn ghost" type="button" onClick={() => setRestoring(true)}><Download aria-hidden />Restore from a backup file</button></div>
        )}
      </section>

      <section id="install" className="settings-sec" aria-labelledby="install-h">
        <h2 className="h2" id="install-h">Install on this device</h2>
        {install.installed ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Check size={18} color="var(--pine)" aria-hidden />Mira is installed and opens like an app.</span>
        ) : (
          <>
            <p className="muted" style={{ margin: 0, maxWidth: '60ch' }}>
              Add Mira to your home screen so it opens like an app and works offline. On iPhone this also stops Safari from clearing
              the records after a few weeks without a visit.
            </p>
            {install.canPrompt ? (
              <div><button className="btn secondary" type="button" onClick={install.prompt}><Smartphone aria-hidden />Install Mira</button></div>
            ) : install.ios ? (
              <ol className="install-steps">
                <li>Open Mira in Safari.</li>
                <li>Tap <Share size={15} aria-label="Share" style={{ verticalAlign: '-2px' }} /> Share.</li>
                <li>Choose <b style={{ fontWeight: 500 }}>Add to Home Screen</b>.</li>
              </ol>
            ) : (
              <span className="muted">Use your browser's menu and choose Install or Add to Home Screen.</span>
            )}
          </>
        )}
      </section>

      <section className="settings-sec" aria-labelledby="remove-h">
        <h2 className="h2" id="remove-h">Remove</h2>
        {confirm === null && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn danger" type="button" onClick={() => setConfirm('child')}>Delete {child.firstName}'s record</button>
            <button className="btn danger" type="button" onClick={() => setConfirm('all')}>Delete all data on this device</button>
          </div>
        )}
        {confirm && (
          <div className="panel" role="alert">
            <span style={{ fontWeight: 500 }}>
              {confirm === 'child' ? `Delete ${child.firstName}'s record, entries and appointments?` : 'Delete every record on this device?'} This cannot be undone unless you have a backup.
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn danger" type="button" style={{ background: '#B42318', color: '#fff' }}
                onClick={() => { if (confirm === 'child') remove('children', child.id); else replaceAll(emptyState()); setConfirm(null); navigate('/app'); }}>
                Delete
              </button>
              <button className="btn ghost" type="button" onClick={() => setConfirm(null)}>Keep</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
