import { buildMockData, Tutor } from '../../data/mock';
import { filterTutors, parseRate } from '../filters';

const { tutors } = buildMockData('2026-10-19');
const names = (ts: Tutor[]) => ts.map(t => t.name);
const week = { from: '2026-10-19', to: '2026-10-24' };

test('date range only, sorted by score', () =>
  expect(names(filterTutors(tutors, { location: '', range: week, maxRate: null })))
    .toEqual(['Sarah Lin', 'Marcus Johnson', 'Priya Patel', 'Daniel Kim']));
test('location is case-insensitive substring', () =>
  expect(names(filterTutors(tutors, { location: ' moffitt ', range: week, maxRate: null }))).toEqual(['Sarah Lin']));
test('max rate inclusive', () =>
  expect(names(filterTutors(tutors, { location: '', range: week, maxRate: 25 }))).toEqual(['Marcus Johnson', 'Daniel Kim']));
test('no range returns all, sorted', () =>
  expect(filterTutors(tutors, { location: '', range: { from: null, to: null }, maxRate: null })).toHaveLength(6));
test('parseRate', () => {
  expect(parseRate(' 30 ')).toBe(30);
  expect(parseRate('')).toBeNull(); expect(parseRate('abc')).toBeNull(); expect(parseRate('-5')).toBeNull();
});
