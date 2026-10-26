import type { Tutor } from '../data/mock';
import { DateRange, inRange } from './calendar';

export interface TutorFilter {
  location: string;
  range: DateRange;
  maxRate: number | null;
}

export function sortByMatch(tutors: Tutor[]): Tutor[] {
  return [...tutors].sort((a, b) => b.matchScore - a.matchScore);
}

export function filterTutors(tutors: Tutor[], f: TutorFilter): Tutor[] {
  const needle = f.location.trim().toLowerCase();
  const kept = tutors.filter(
    t =>
      t.location.toLowerCase().includes(needle) &&
      (f.range.from === null || t.availableDates.some(iso => inRange(iso, f.range))) &&
      (f.maxRate === null || t.rate <= f.maxRate),
  );
  return sortByMatch(kept);
}

export function parseRate(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  const n = Number(trimmed);
  return Number.isFinite(n) && n > 0 ? n : null;
}
