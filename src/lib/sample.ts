import { emptyState, newId } from './store';
import { isoDay } from './dates';
import type { State } from './types';

// Example record for exploring the app. Dates are relative to today so it always looks current.
export function sampleState(): State {
  const day = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return isoDay(d);
  };
  const dob = new Date();
  dob.setFullYear(dob.getFullYear() - 4, dob.getMonth() - 2);

  const childId = newId();
  const next = newId();
  const s = emptyState();
  s.example = true;
  s.activeChildId = childId;
  s.children = [
    { id: childId, firstName: 'Layla', lastName: 'Rahman', dob: isoDay(dob), pediatrician: 'Dr. Amina Okafor', clinic: 'Riverside Pediatrics' },
  ];
  s.appointments = [
    { id: next, childId, datetime: `${day(7)}T09:30`, title: '4-year well visit', provider: 'Dr. Amina Okafor', location: 'Riverside Pediatrics', notes: '' },
    { id: newId(), childId, datetime: `${day(70)}T15:00`, title: 'Dental cleaning', provider: 'Bright Smiles', location: 'Bright Smiles Pediatric Dental', notes: '' },
    { id: newId(), childId, datetime: `${day(-85)}T10:15`, title: 'Sick visit', provider: 'Dr. Amina Okafor', location: 'Riverside Pediatrics', notes: 'Cough, viral. No medication needed.', briefSavedAt: day(-86) },
    { id: newId(), childId, datetime: `${day(-275)}T16:00`, title: 'Sick visit', provider: 'Dr. Amina Okafor', location: 'Riverside Pediatrics', notes: 'Croup. Dexamethasone, one dose.' },
    { id: newId(), childId, datetime: `${day(-443)}T09:00`, title: '3-year well visit', provider: 'Dr. Amina Okafor', location: 'Riverside Pediatrics', notes: 'On track. Flu shot given.' },
  ];
  const entry = (offset: number, type: State['entries'][number]['type'], title: string, details: string, extra = {}) => ({
    id: newId(), childId, type, date: day(offset), title, details, includeInBrief: true, ...extra,
  });
  s.entries = [
    entry(-11, 'note', 'Snoring most nights', 'For about three weeks. Loud, no pauses in breathing noticed.'),
    entry(-18, 'reaction', 'Hives after a peanut snack', 'At daycare, face and arms. No breathing trouble. Cetirizine 2.5 mg, cleared in about two hours.'),
    entry(-26, 'medication', 'Finished amoxicillin', 'Ten day course completed, no side effects.'),
    entry(-36, 'illness', 'Ear infection, left', 'Urgent care. Amoxicillin 400 mg twice a day for ten days.'),
    entry(-37, 'symptom', 'Fever 101.4 °F', 'Pulling at left ear, fussy at bedtime. Ibuprofen 7.5 ml at 9:10 pm.'),
    entry(-52, 'measurement', 'Weight and height', 'Home scale.', { weightKg: 16.8, heightCm: 104 }),
  ];
  s.allergies = [{ id: newId(), childId, name: 'Peanut', reaction: 'Hives on face and arms, no breathing trouble.', status: 'suspected' }];
  s.medications = [
    { id: newId(), childId, name: 'Cetirizine', dose: '2.5 mg', schedule: 'As needed for hives or itching', active: true },
    { id: newId(), childId, name: 'Amoxicillin', dose: '400 mg', schedule: 'Twice a day for ten days', active: false },
  ];
  s.vaccines = [
    { id: newId(), childId, name: 'DTaP, dose 5', due: day(7) },
    { id: newId(), childId, name: 'IPV (polio), dose 4', due: day(7) },
    { id: newId(), childId, name: 'MMR, dose 2', due: day(7) },
    { id: newId(), childId, name: 'Varicella, dose 2', due: day(7) },
    { id: newId(), childId, name: 'Influenza', due: 'This season' },
  ];

  // A younger sibling, so the family view has more than one child.
  const omar = newId();
  const omarDob = new Date();
  omarDob.setMonth(omarDob.getMonth() - 18);
  s.children.push({ id: omar, firstName: 'Omar', lastName: 'Rahman', dob: isoDay(omarDob), pediatrician: 'Dr. Amina Okafor', clinic: 'Riverside Pediatrics' });
  s.appointments.push(
    { id: newId(), childId: omar, datetime: `${day(21)}T10:00`, title: '18-month well visit', provider: 'Dr. Amina Okafor', location: 'Riverside Pediatrics', notes: '' },
    { id: newId(), childId: omar, datetime: `${day(-63)}T11:30`, title: '15-month well visit', provider: 'Dr. Amina Okafor', location: 'Riverside Pediatrics', notes: 'On track. Hep A dose 1 given.', briefSavedAt: day(-64) },
  );
  s.entries.push(
    { id: newId(), childId: omar, type: 'note', date: day(-9), title: 'Says about 10 words', details: 'Mama, dada, ball, dog, more, up, bye, no, milk, Layla.', includeInBrief: true },
    { id: newId(), childId: omar, type: 'symptom', date: day(-24), title: 'Diaper rash', details: 'Cleared in four days with zinc cream.', includeInBrief: true },
  );
  s.vaccines.push(
    { id: newId(), childId: omar, name: 'Hepatitis A, dose 2', due: day(21) },
    { id: newId(), childId: omar, name: 'Influenza', due: 'This season' },
  );
  return s;
}
