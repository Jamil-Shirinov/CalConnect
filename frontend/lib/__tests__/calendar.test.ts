import { addDays, addMonths, inRange, monthGrid, monthLabel, selectDate } from '../calendar';

test('monthGrid Oct 2026 has 4 leading blanks, 35 cells', () => {
  const g = monthGrid(2026, 10);
  expect(g.slice(0, 5)).toEqual([null, null, null, null, '2026-10-01']);
  expect(g).toHaveLength(35);
  expect(g[34]).toBe('2026-10-31');
});
test('monthGrid Feb 2026 starts Sunday, exactly 4 weeks', () => {
  const g = monthGrid(2026, 2);
  expect(g[0]).toBe('2026-02-01'); expect(g).toHaveLength(28);
});
test('monthGrid Dec 2026 pads trailing to a full week', () => {
  const g = monthGrid(2026, 12);
  expect(g.length % 7).toBe(0); expect(g[2]).toBe('2026-12-01'); expect(g.at(-1)).toBeNull();
});
test('addMonths crosses year boundaries', () => {
  expect(addMonths(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
  expect(addMonths(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
});
test('addDays crosses month end', () => expect(addDays('2026-10-30', 3)).toBe('2026-11-02'));
test('selectDate: from, then to, earlier tap restarts, third tap restarts', () => {
  let r = selectDate({ from: null, to: null }, '2026-10-20');
  expect(r).toEqual({ from: '2026-10-20', to: null });
  expect(selectDate(r, '2026-10-18')).toEqual({ from: '2026-10-18', to: null });
  r = selectDate(r, '2026-10-25');
  expect(r).toEqual({ from: '2026-10-20', to: '2026-10-25' });
  expect(selectDate(r, '2026-10-22')).toEqual({ from: '2026-10-22', to: null });
});
test('inRange is inclusive and treats open range as single day', () => {
  const r = { from: '2026-10-20', to: '2026-10-25' };
  expect(inRange('2026-10-20', r) && inRange('2026-10-25', r)).toBe(true);
  expect(inRange('2026-10-26', r)).toBe(false);
  expect(inRange('2026-10-20', { from: '2026-10-20', to: null })).toBe(true);
  expect(inRange('2026-10-21', { from: '2026-10-20', to: null })).toBe(false);
});
test('monthLabel', () => expect(monthLabel(2026, 10)).toBe('October 2026'));
