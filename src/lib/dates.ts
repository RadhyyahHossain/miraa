// All dates are stored as local calendar strings (YYYY-MM-DD, or YYYY-MM-DDTHH:mm).

export const parseDay = (d: string) => {
  const [y, m, day] = d.slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, day || 1);
};

export const parseDateTime = (dt: string) => {
  const [date, time = '00:00'] = dt.split('T');
  const d = parseDay(date);
  const [h, min] = time.split(':').map(Number);
  d.setHours(h || 0, min || 0, 0, 0);
  return d;
};

export const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const today = () => isoDay(new Date());

const isDayString = (s: string) => /^\d{4}-\d{2}-\d{2}/.test(s);

export const fmtShort = (s: string) => {
  if (!isDayString(s)) return s;
  const d = parseDay(s);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString('en-US', sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' });
};

export const fmtLong = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

export const fmtTime = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace('AM', 'am').replace('PM', 'pm');

export const fmtMonth = (s: string) => parseDay(s).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export const daysUntil = (d: Date) => {
  const start = parseDay(today());
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((end.getTime() - start.getTime()) / 86400000);
};

export const inDays = (n: number) => (n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n < 0 ? `${-n} days ago` : `In ${n} days`);

export function age(dob: string, short = false) {
  const b = parseDay(dob);
  const now = new Date();
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  if (months < 0) return '';
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return short ? `${m} mos` : `${m} month${m === 1 ? '' : 's'}`;
  if (short) return m ? `${y} yrs ${m} mos` : `${y} yrs`;
  return m ? `${y} year${y === 1 ? '' : 's'}, ${m} month${m === 1 ? '' : 's'}` : `${y} year${y === 1 ? '' : 's'}`;
}
