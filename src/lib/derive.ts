import { useStore } from './store';
import { parseDateTime, parseDay } from './dates';
import type { Appointment, Entry, State } from './types';

export function useActiveChild() {
  const { state } = useStore();
  return state.children.find((c) => c.id === state.activeChildId) ?? state.children[0] ?? null;
}

const byChild = <T extends { childId: string }>(list: T[], childId: string) => list.filter((x) => x.childId === childId);

export function childData(state: State, childId: string) {
  const now = Date.now();
  const appointments = byChild(state.appointments, childId).sort((a, b) => a.datetime.localeCompare(b.datetime));
  const past = appointments.filter((a) => parseDateTime(a.datetime).getTime() < now).reverse();
  const upcoming = appointments.filter((a) => parseDateTime(a.datetime).getTime() >= now);
  const entries = byChild(state.entries, childId).sort((a, b) => b.date.localeCompare(a.date));
  return {
    appointments,
    past,
    upcoming,
    next: upcoming[0] ?? null,
    lastVisit: past[0] ?? null,
    entries,
    allergies: byChild(state.allergies, childId),
    medications: byChild(state.medications, childId),
    conditions: byChild(state.conditions, childId),
    vaccines: byChild(state.vaccines, childId),
  };
}

/** Entries logged after the most recent visit before `appt` (or all entries if there was none). */
export function entriesForBrief(state: State, appt: Appointment): Entry[] {
  const { entries, appointments } = childData(state, appt.childId);
  const apptTime = parseDateTime(appt.datetime).getTime();
  const prior = appointments.filter((a) => a.id !== appt.id && parseDateTime(a.datetime).getTime() < apptTime).pop();
  const since = prior ? parseDay(prior.datetime).getTime() : -Infinity;
  return entries.filter((e) => e.includeInBrief && parseDay(e.date).getTime() > since && parseDay(e.date).getTime() <= apptTime);
}

export function priorVisit(state: State, appt: Appointment) {
  const apptTime = parseDateTime(appt.datetime).getTime();
  return childData(state, appt.childId).appointments
    .filter((a) => a.id !== appt.id && parseDateTime(a.datetime).getTime() < apptTime)
    .pop() ?? null;
}

export function readiness(state: State, appt: Appointment) {
  const d = childData(state, appt.childId);
  const steps = [
    { label: 'Since the last visit', done: entriesForBrief(state, appt).length > 0 },
    { label: 'Medications and allergies', done: d.medications.length + d.allergies.length > 0 },
    { label: 'Vaccines', done: d.vaccines.length > 0 },
    { label: 'Your questions', done: state.questions.some((q) => q.appointmentId === appt.id) },
  ];
  return { steps, done: steps.filter((s) => s.done).length };
}

export function latestMeasurement(entries: Entry[]) {
  const withWeight = entries.find((e) => e.weightKg != null);
  const withHeight = entries.find((e) => e.heightCm != null);
  return { weight: withWeight, height: withHeight };
}
