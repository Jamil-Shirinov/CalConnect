// Rule-based compatibility score between a student and a tutor.
// Pure functions so they're easy to test and to swap for an AI scorer later.
import { QUESTIONS } from "./catalog.js";

const WEIGHTS = { courses: 0.45, availability: 0.3, format: 0.1, questionnaire: 0.15 };

// Hours of shared availability that count as "fully compatible".
const FULL_OVERLAP_HOURS = 6;

const DAY_NAMES = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

const toHours = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h + m / 60;
};

/** Shared free time between two weekly availability lists. */
export function availabilityOverlap(a = [], b = []) {
  let hours = 0;
  const days = new Set();
  for (const x of a) {
    for (const y of b) {
      if (x.day !== y.day) continue;
      const shared = Math.min(toHours(x.end), toHours(y.end)) - Math.max(toHours(x.start), toHours(y.start));
      if (shared > 0) {
        hours += shared;
        days.add(x.day);
      }
    }
  }
  return { hours, days: [...days] };
}

const listOf = (items) =>
  items.length <= 2 ? items.join(" and ") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

/**
 * Score a student/tutor pair. Returns { score: 0..1, courses, reasons }.
 * A pair with no shared course scores 0 and should not be suggested.
 */
export function scorePair(student, tutor) {
  const tutorCourses = new Set(tutor.courses ?? []);
  const courses = (student.courses ?? []).filter((c) => tutorCourses.has(c));
  if (courses.length === 0) return { score: 0, courses, reasons: [] };

  const reasons = [`Teaches ${listOf(courses)}`];

  const courseFit = courses.length / Math.max(1, student.courses.length);

  const overlap = availabilityOverlap(student.availability, tutor.availability);
  const availabilityFit = Math.min(overlap.hours / FULL_OVERLAP_HOURS, 1);
  if (overlap.hours > 0) {
    const days = overlap.days.map((d) => DAY_NAMES[d]);
    reasons.push(`${Math.round(overlap.hours)} hours of shared free time (${listOf(days)})`);
  } else {
    reasons.push("No shared free time yet");
  }

  const sharedFormats = (student.format ?? []).filter((f) => (tutor.format ?? []).includes(f));
  const formatFit = sharedFormats.length > 0 ? 1 : 0;
  if (sharedFormats.length === 1) reasons.push(`Both prefer ${sharedFormats[0]}`);

  const sameAnswers = QUESTIONS.filter(
    (q) => student.questionnaire?.[q.key] && student.questionnaire[q.key] === tutor.questionnaire?.[q.key]
  );
  const questionnaireFit = sameAnswers.length / QUESTIONS.length;
  if (sameAnswers.length >= 2) {
    const labels = sameAnswers.map((q) => {
      const label = q.options[student.questionnaire[q.key]];
      return label[0].toLowerCase() + label.slice(1);
    });
    reasons.push(`Same style: ${listOf(labels)}`);
  }

  const score =
    WEIGHTS.courses * courseFit +
    WEIGHTS.availability * availabilityFit +
    WEIGHTS.format * formatFit +
    WEIGHTS.questionnaire * questionnaireFit;

  return { score: Math.round(score * 100) / 100, courses, reasons };
}
