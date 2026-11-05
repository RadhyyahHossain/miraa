import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, FileUp, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { BACKUP_STALE_DAYS, BackupError, backupAgeDays, backupAgeLabel, createBackup, inspectBackup, readBackup, saveBackupFile } from '../lib/backup';

const ERRORS: Record<BackupError['reason'], string> = {
  'not-a-backup': 'That file is not a Miraa backup. Choose a file that ends in .miraa.',
  'wrong-passphrase': 'That passphrase does not open this backup. Check for typos and try again.',
  unsupported: 'This browser cannot encrypt files. Try a current version of Safari, Chrome or Firefox.',
};

export function CreateBackup({ onDone }: { onDone?: () => void }) {
  const { state, markBackedUp } = useStore();
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<'shared' | 'downloaded' | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (pass.length < 8) return setError('Use at least 8 characters.');
    if (pass !== confirm) return setError('The two passphrases do not match.');
    setBusy(true);
    setError('');
    try {
      const file = await createBackup(state, pass);
      const result = await saveBackupFile(file);
      if (result !== 'cancelled') {
        markBackedUp();
        setDone(result);
        setPass('');
        setConfirm('');
        onDone?.();
      }
    } catch (err) {
      setError(err instanceof BackupError ? ERRORS[err.reason] : 'Something went wrong creating the backup. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="panel" role="status">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><Check size={18} color="var(--pine)" aria-hidden />Backup saved</span>
        <span className="muted">
          {done === 'shared' ? 'Keep it somewhere you will find it again, like iCloud Drive, Google Drive or your email.' : 'Check your downloads folder. Move the file somewhere safe, like iCloud Drive or Google Drive.'}
        </span>
        <div><button className="btn ghost" type="button" onClick={() => setDone(null)}>Make another</button></div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="panel" noValidate>
      <div className="row2">
        <label className="field"><span>Passphrase</span><input id="backup-pass" className="input" type="password" autoComplete="new-password" value={pass} onChange={(e) => { setPass(e.target.value); setError(''); }} /></label>
        <label className="field"><span>Type it again</span><input id="backup-pass-2" className="input" type="password" autoComplete="new-password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(''); }} /></label>
      </div>
      <span className="hint">The file is encrypted with this passphrase. Miraa cannot recover it if you forget it, so write it down with your other important papers.</span>
      {error && <span className="hint" role="alert" style={{ color: '#B42318' }}>{error}</span>}
      <div><button className="btn primary" type="submit" disabled={busy}>{busy ? 'Encrypting…' : 'Save backup file'}</button></div>
    </form>
  );
}

export function RestoreBackup({ onCancel }: { onCancel?: () => void }) {
  const { state, replaceAll } = useStore();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [createdAt, setCreatedAt] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const hasData = state.children.length > 0;

  const choose = async (f: File | undefined) => {
    setError('');
    setFile(null);
    if (!f) return;
    const info = await inspectBackup(f);
    if (!info) return setError(ERRORS['not-a-backup']);
    setFile(f);
    setCreatedAt(info.createdAt);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { state: restored, createdAt: made } = await readBackup(file, pass);
      replaceAll({ ...restored, lastBackupAt: made });
      navigate('/app');
    } catch (err) {
      setError(err instanceof BackupError ? ERRORS[err.reason] : 'Something went wrong reading the backup. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const made = createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

  return (
    <form onSubmit={submit} className="panel" noValidate>
      <label className="filepick">
        <FileUp size={18} aria-hidden />
        <span>{file ? file.name : 'Choose a .miraa backup file'}</span>
        <input type="file" accept=".miraa,application/octet-stream,application/json" onChange={(e) => choose(e.target.files?.[0])} />
      </label>
      {file && (
        <>
          <span className="muted">Backup from {made}.</span>
          <label className="field"><span>Passphrase</span><input id="restore-pass" className="input" type="password" autoComplete="current-password" autoFocus value={pass} onChange={(e) => { setPass(e.target.value); setError(''); }} /></label>
          {hasData && <span className="hint">Restoring replaces everything currently on this device with this backup.</span>}
        </>
      )}
      {error && <span className="hint" role="alert" style={{ color: '#B42318' }}>{error}</span>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn primary" type="submit" disabled={!file || !pass || busy}>{busy ? 'Decrypting…' : hasData ? 'Replace and restore' : 'Restore'}</button>
        {onCancel && <button className="btn ghost" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

/** Small always-visible status, used in the sidebar. */
export function BackupStatus() {
  const { state } = useStore();
  if (state.example) return null;
  const days = backupAgeDays(state.lastBackupAt);
  const stale = days === null || days >= BACKUP_STALE_DAYS;
  const Icon = stale ? ShieldAlert : ShieldCheck;
  return (
    <Link to="/app/settings#backup" className="backup-status" data-stale={stale}>
      <Icon size={16} strokeWidth={1.75} aria-hidden />
      <span>{backupAgeLabel(state.lastBackupAt)}</span>
    </Link>
  );
}

/** Dismissible reminder shown at the top of pages when the backup is old or missing. */
export function BackupReminder() {
  const { state } = useStore();
  const [hidden, setHidden] = useState(() => {
    try { return sessionStorage.getItem('miraa:hide-backup-reminder') === '1'; } catch { return false; }
  });
  const days = backupAgeDays(state.lastBackupAt);
  const hasRecords = !state.example && state.entries.length + state.appointments.length > 0;
  if (hidden || !hasRecords || (days !== null && days < BACKUP_STALE_DAYS)) return null;
  const hide = () => {
    setHidden(true);
    try { sessionStorage.setItem('miraa:hide-backup-reminder', '1'); } catch { /* ignore */ }
  };
  return (
    <div className="reminder" role="status">
      <ShieldAlert size={18} strokeWidth={1.75} color="var(--ink-2)" aria-hidden />
      <span style={{ flex: 1 }}>
        <b style={{ fontWeight: 500 }}>{days === null ? 'No backup yet.' : `Last backup ${days} days ago.`}</b>{' '}
        <span className="muted">Records live only on this device. A backup file keeps them safe if the phone is lost or replaced.</span>
      </span>
      <Link className="btn secondary" to="/app/settings#backup">Back up now</Link>
      <button type="button" className="iconbtn" aria-label="Hide for now" onClick={hide} style={{ width: 32, height: 32 }}><X size={15} aria-hidden /></button>
    </div>
  );
}
