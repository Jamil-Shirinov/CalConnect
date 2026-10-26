import { buildMockData } from '../mock';

const m = buildMockData('2026-10-19');

test('seed sizes and a session today', () => {
  expect(m.tutors).toHaveLength(6);
  expect(m.sessions.filter(s => s.date === '2026-10-19').length).toBeGreaterThanOrEqual(1);
  expect(m.tutors.find(t => t.id === 't6')!.availableDates).toEqual(['2026-10-17', '2026-11-08']);
});
