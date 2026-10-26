import { fireEvent, screen, within } from 'expo-router/testing-library';
import { makeState, renderApp } from '../test-utils/render';

afterEach(() => jest.restoreAllMocks());

test('dashboard stats and cards from seed', async () => {
  await renderApp('/dashboard', makeState());
  expect(screen.getByText('Welcome back,', { exact: false })).toBeTruthy();
  expect(within(screen.getByTestId('stat-Upcoming sessions')).getByText('3')).toBeTruthy();
  expect(within(screen.getByTestId('stat-Unread messages')).getByText('2')).toBeTruthy();
  expect(within(screen.getByTestId('stat-Pending requests')).getByText('2')).toBeTruthy();
  expect(within(screen.getByTestId('stat-Matched tutors')).getByText('6')).toBeTruthy();
  expect(screen.getByText('16:00–17:00', { exact: false })).toBeTruthy();
});

test('View Now goes to booking', async () => {
  await renderApp('/dashboard', makeState());
  fireEvent.press(screen.getByText('View Now'));
  expect(screen).toHavePathname('/booking');
});

test('empty today shows empty state', async () => {
  const state = makeState();
  await renderApp('/dashboard', { ...state, sessions: state.sessions.filter(s => s.date !== state.today) });
  expect(screen.getByText('No sessions today')).toBeTruthy();
});

test("Today's Sessions are sorted by start time", async () => {
  await renderApp('/dashboard', makeState());
  const flat = JSON.stringify(screen.toJSON());
  expect(flat.indexOf('10:00–11:00')).toBeGreaterThan(-1);
  expect(flat.indexOf('10:00–11:00')).toBeLessThan(flat.indexOf('16:00–17:00'));
});
