import { fireEvent, screen } from 'expo-router/testing-library';
import { makeState, renderApp } from '../test-utils/render';

afterEach(() => jest.restoreAllMocks());

const openPanel = () => fireEvent.press(screen.getByText('From'));

test('range selection, Done filters, Request works', async () => {
  await renderApp('/booking', makeState());
  openPanel();
  fireEvent.press(screen.getByTestId('day-2026-10-19'));
  fireEvent.press(screen.getByTestId('day-2026-10-24'));
  expect(screen.getByTestId('range-summary').props.children).toContain('2026-10-24');
  fireEvent.press(screen.getByText('Done'));
  expect(screen.getAllByTestId('tutor-name').map(n => n.props.children)).toEqual([
    'Sarah Lin', 'Marcus Johnson', 'Priya Patel', 'Daniel Kim',
  ]);
});

test('Update applies location and rate; bad rate text ignored', async () => {
  await renderApp('/booking', makeState());
  openPanel();
  fireEvent.press(screen.getByRole('checkbox'));
  fireEvent.changeText(screen.getByPlaceholderText('Max rate'), 'abc');
  fireEvent.press(screen.getByText('Done'));
  expect(screen.getAllByTestId('tutor-name')).toHaveLength(6);
  fireEvent.changeText(screen.getByPlaceholderText('Location'), 'zoom');
  openPanel();
  fireEvent.changeText(screen.getByPlaceholderText('Max rate'), '20');
  fireEvent.press(screen.getByText('Done'));
  expect(screen.getAllByTestId('tutor-name').map(n => n.props.children)).toEqual(['Daniel Kim']);
});

test('Cancel restores range; empty result shows empty state', async () => {
  await renderApp('/booking', makeState());
  openPanel();
  fireEvent.press(screen.getByTestId('day-2026-10-29'));
  fireEvent.press(screen.getByText('Cancel'));
  expect(screen.getAllByText('Select date').length).toBeGreaterThan(0);
  openPanel();
  fireEvent.press(screen.getByTestId('day-2026-10-29'));
  fireEvent.press(screen.getByText('Done'));
  expect(screen.getByText('No tutors match these dates')).toBeTruthy();
});

test('pressing From again while open keeps the original range for Cancel', async () => {
  await renderApp('/booking', makeState());
  openPanel();
  fireEvent.press(screen.getByTestId('day-2026-10-24'));
  openPanel();
  fireEvent.press(screen.getByText('Cancel'));
  expect(screen.getAllByText('Select date').length).toBeGreaterThan(0);
  expect(screen.queryByText('2026-10-24')).toBeNull();
});

test('Request session from a result card sends a request', async () => {
  await renderApp('/booking', makeState());
  openPanel();
  fireEvent.press(screen.getByTestId('day-2026-10-19'));
  fireEvent.press(screen.getByTestId('day-2026-10-24'));
  fireEvent.press(screen.getByText('Done'));
  fireEvent.press(screen.getAllByText('Request session')[0]);
  fireEvent.press(screen.getByRole('button', { name: 'CS 61A' }));
  fireEvent.press(screen.getByRole('button', { name: '2026-10-20' }));
  fireEvent.press(screen.getByText('Send request'));
  expect(screen.getByText('Request sent')).toBeTruthy();
});
