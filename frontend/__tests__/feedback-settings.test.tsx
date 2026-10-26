import { fireEvent, screen } from 'expo-router/testing-library';
import { makeState, renderApp } from '../test-utils/render';

test('feedback validates then submits and resets', async () => {
  await renderApp('/feedback', makeState());
  fireEvent.press(screen.getByText('Submit'));
  expect(screen.getByText('Name is required')).toBeTruthy();
  for (const [p, v] of [
    ['Name', 'Alex'],
    ['Email', 'alex@berkeley.edu'],
    ['Subject', 'Hi'],
    ['Message', 'Great app'],
  ]) {
    fireEvent.changeText(screen.getByPlaceholderText(p), v);
  }
  fireEvent.press(screen.getByText('Submit'));
  expect(screen.getByText('Thanks! Your feedback was sent.')).toBeTruthy();
  expect(screen.getByPlaceholderText('Name').props.value).toBe('');
  fireEvent.changeText(screen.getByPlaceholderText('Name'), 'A');
  expect(screen.queryByText('Thanks! Your feedback was sent.')).toBeNull();
});

test('settings save updates welcome name; log out goes home', async () => {
  await renderApp('/settings', makeState());
  fireEvent.changeText(screen.getByPlaceholderText('Name'), 'Alex C.');
  fireEvent.changeText(screen.getByPlaceholderText('Courses'), 'CS 61B, , Math 54');
  fireEvent.press(screen.getByText('Save'));
  expect(screen.getByText('Profile saved')).toBeTruthy();
  expect(screen.getByText('Alex C.', { exact: false })).toBeTruthy();
  expect(screen.getByPlaceholderText('Courses').props.value).toBe('CS 61B, Math 54');
  fireEvent.changeText(screen.getByPlaceholderText('Major'), 'EECS');
  expect(screen.queryByText('Profile saved')).toBeNull();
  fireEvent.press(screen.getByText('Log out'));
  expect(screen).toHavePathname('/');
});

test('settings mode chips toggle selection', async () => {
  await renderApp('/settings', makeState());
  const online = screen.getByRole('button', { name: 'Online' });
  fireEvent.press(online);
  expect(screen.getByRole('button', { name: 'Online' }).props.accessibilityState.selected).toBe(true);
  expect(screen.getByRole('button', { name: 'In-person' }).props.accessibilityState.selected).toBe(false);
});

test('settings keeps previous name when saved blank', async () => {
  await renderApp('/settings', makeState());
  const original = makeState().student.name;
  fireEvent.changeText(screen.getByPlaceholderText('Name'), '   ');
  fireEvent.press(screen.getByText('Save'));
  expect(screen.getByText(original)).toBeTruthy();
});
