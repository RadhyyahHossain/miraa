// Encrypted backup files (.mira). Everything is encrypted on the device with a passphrase:
// PBKDF2-SHA256 derives an AES-GCM key, so the file is unreadable without the passphrase.
import { isoDay } from './dates';
import { normalize } from './store';
import type { State } from './types';

const FORMAT = 'mira-backup';
const ITERATIONS = 310_000;

interface BackupFile {
  format: typeof FORMAT;
  v: 1;
  createdAt: string;
  kdf: { name: 'PBKDF2'; hash: 'SHA-256'; iterations: number; salt: string };
  cipher: { name: 'AES-GCM'; iv: string };
  data: string;
}

export class BackupError extends Error {
  constructor(public reason: 'not-a-backup' | 'wrong-passphrase' | 'unsupported') {
    super(reason);
  }
}

const toB64 = (bytes: Uint8Array) => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
const fromB64 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

async function deriveKey(passphrase: string, salt: Uint8Array, iterations: number) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function createBackup(state: State, passphrase: string): Promise<File> {
  if (!crypto?.subtle) throw new BackupError('unsupported');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt, ITERATIONS);
  const createdAt = new Date().toISOString();
  const plain = new TextEncoder().encode(JSON.stringify({ ...state, lastBackupAt: createdAt }));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
  const file: BackupFile = {
    format: FORMAT,
    v: 1,
    createdAt,
    kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: ITERATIONS, salt: toB64(salt) },
    cipher: { name: 'AES-GCM', iv: toB64(iv) },
    data: toB64(cipher),
  };
  return new File([JSON.stringify(file)], `mira-backup-${isoDay(new Date())}.mira`, { type: 'application/octet-stream' });
}

export async function readBackup(file: File, passphrase: string): Promise<{ state: State; createdAt: string }> {
  let parsed: BackupFile;
  try {
    parsed = JSON.parse(await file.text());
    if (parsed.format !== FORMAT || parsed.v !== 1) throw new Error();
  } catch {
    throw new BackupError('not-a-backup');
  }
  if (!crypto?.subtle) throw new BackupError('unsupported');
  let plain: ArrayBuffer;
  try {
    const key = await deriveKey(passphrase, fromB64(parsed.kdf.salt), parsed.kdf.iterations);
    plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(parsed.cipher.iv) }, key, fromB64(parsed.data));
  } catch {
    // AES-GCM fails authentication when the passphrase is wrong.
    throw new BackupError('wrong-passphrase');
  }
  const state = normalize(JSON.parse(new TextDecoder().decode(plain)));
  if (!state) throw new BackupError('not-a-backup');
  return { state, createdAt: parsed.createdAt };
}

/** Peek at a file without decrypting it: is it a Mira backup, and when was it made? */
export async function inspectBackup(file: File): Promise<{ createdAt: string } | null> {
  try {
    const parsed = JSON.parse(await file.text()) as BackupFile;
    return parsed.format === FORMAT ? { createdAt: parsed.createdAt } : null;
  } catch {
    return null;
  }
}

/**
 * Hand the file to the system share sheet where available (on iOS: Save to Files, iCloud Drive,
 * AirDrop, email). Falls back to a normal download on desktop.
 */
export async function saveBackupFile(file: File): Promise<'shared' | 'downloaded' | 'cancelled'> {
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Mira backup' });
      return 'shared';
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return 'cancelled';
      // Some browsers refuse share at the last step; fall through to download.
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
}

/** Days since the last backup, or null if there has never been one. */
export function backupAgeDays(lastBackupAt: string | null) {
  if (!lastBackupAt) return null;
  return Math.floor((Date.now() - new Date(lastBackupAt).getTime()) / 86_400_000);
}

export function backupAgeLabel(lastBackupAt: string | null) {
  const d = backupAgeDays(lastBackupAt);
  if (d === null) return 'Never backed up';
  if (d === 0) return 'Backed up today';
  if (d === 1) return 'Backed up yesterday';
  return `Backed up ${d} days ago`;
}

export const BACKUP_STALE_DAYS = 14;
