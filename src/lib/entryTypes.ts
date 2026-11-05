import { Bed, CircleAlert, PenLine, Pill, Ruler, Stethoscope, Thermometer, type LucideIcon } from 'lucide-react';
import type { EntryType } from './types';

export const ENTRY_TYPES: Record<EntryType, { label: string; plural: string; Icon: LucideIcon }> = {
  symptom: { label: 'Symptom', plural: 'Symptoms', Icon: Thermometer },
  illness: { label: 'Illness', plural: 'Illnesses', Icon: Bed },
  reaction: { label: 'Reaction', plural: 'Reactions', Icon: CircleAlert },
  medication: { label: 'Medication', plural: 'Medications', Icon: Pill },
  measurement: { label: 'Measurement', plural: 'Measurements', Icon: Ruler },
  note: { label: 'Note', plural: 'Notes', Icon: PenLine },
};

export const VisitIcon = Stethoscope;

export const TYPE_ORDER = Object.keys(ENTRY_TYPES) as EntryType[];
