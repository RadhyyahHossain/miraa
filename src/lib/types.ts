export type EntryType = 'symptom' | 'illness' | 'reaction' | 'medication' | 'measurement' | 'note';

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dob: string; // YYYY-MM-DD
  pediatrician: string;
  clinic: string;
}

export interface Entry {
  id: string;
  childId: string;
  type: EntryType;
  date: string; // YYYY-MM-DD
  title: string;
  details: string;
  weightKg?: number;
  heightCm?: number;
  includeInBrief: boolean;
}

export interface Appointment {
  id: string;
  childId: string;
  datetime: string; // YYYY-MM-DDTHH:mm, local time
  title: string;
  provider: string;
  location: string;
  notes: string;
  briefSavedAt?: string;
}

export interface Allergy {
  id: string;
  childId: string;
  name: string;
  reaction: string;
  status: 'suspected' | 'confirmed';
}

export interface Medication {
  id: string;
  childId: string;
  name: string;
  dose: string;
  schedule: string;
  active: boolean;
}

export interface Condition {
  id: string;
  childId: string;
  name: string;
  notes: string;
}

export interface Vaccine {
  id: string;
  childId: string;
  name: string;
  due: string; // YYYY-MM-DD or free text like "This season"
}

export interface Question {
  id: string;
  appointmentId: string;
  text: string;
}

export interface Collections {
  children: Child;
  entries: Entry;
  appointments: Appointment;
  allergies: Allergy;
  medications: Medication;
  conditions: Condition;
  vaccines: Vaccine;
  questions: Question;
}

export type CollectionName = keyof Collections;

export type State = {
  /** True while the app shows the seeded example family; cleared when the parent starts their own record. */
  example?: boolean;
  version: 1;
  activeChildId: string | null;
  briefExcluded: Record<string, string[]>;
  lastBackupAt: string | null; // ISO timestamp of the last encrypted backup
} & {
  [K in CollectionName]: Collections[K][];
};
