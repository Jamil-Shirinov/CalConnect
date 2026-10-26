import { router } from 'expo-router';
import { act, fireEvent, screen, within } from 'expo-router/testing-library';
import { makeState, renderApp } from '../test-utils/render';

afterEach(() => jest.restoreAllMocks());

test('tutors sorted by match score', async () => {
  await renderApp('/tutors', makeState());
  const names = screen.getAllByTestId('tutor-name').map(n => n.props.children);
  expect(names).toEqual(['Sarah Lin', 'Marcus Johnson', 'Priya Patel', 'Daniel Kim', 'Elena Garcia', 'Jordan Lee']);
});

test('requesting a session shows up once on Requests', async () => {
  await renderApp('/tutors', makeState());
  const card = screen.getAllByTestId('tutor-card')[3]; // Daniel Kim
  for (let i = 0; i < 2; i++) {
    fireEvent.press(within(card).getByText('Request session'));
    fireEvent.press(within(card).getByText('Data 100'));
    fireEvent.press(within(card).getByText('2026-10-24'));
    fireEvent.press(within(card).getByText('Send request'));
  }
  act(() => router.push('/requests'));
  expect(screen.getAllByText('Data 100')).toHaveLength(1);
  expect(screen.getAllByText('pending')).toHaveLength(3);
});

test('requests list newest first and empty state', async () => {
  await renderApp('/requests', makeState());
  expect(screen.getAllByTestId('request-row')).toHaveLength(4);
  expect(within(screen.getAllByTestId('request-row')[0]).getByText('CS 61C')).toBeTruthy();
});

test('requests empty state', async () => {
  await renderApp('/requests', { ...makeState(), requests: [] });
  expect(screen.getByText('No requests yet')).toBeTruthy();
});
