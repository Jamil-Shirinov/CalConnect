import { fireEvent, screen } from 'expo-router/testing-library';
import { makeState, renderApp } from '../test-utils/render';

afterEach(() => jest.restoreAllMocks());

test('narrow drawer navigates and closes', async () => {
  await renderApp('/dashboard', makeState()); // jest window is 750 wide → narrow
  fireEvent.press(screen.getByLabelText('Open menu'));
  fireEvent.press(screen.getByText('Settings'));
  expect(screen).toHavePathname('/settings');
  expect(screen.queryByText('Booking Calendar')).toBeNull();
});

test('wide layout shows sidebar without menu button', async () => {
  jest.spyOn(require('../hooks/useIsWide'), 'useIsWide').mockReturnValue(true);
  await renderApp('/dashboard', makeState());
  expect(screen.queryByLabelText('Open menu')).toBeNull();
  expect(screen.getByText('Booking Calendar')).toBeTruthy();
});

test('signed-out visit to app route redirects to landing', async () => {
  await renderApp('/dashboard', makeState({ signedIn: false }));
  expect(screen).toHavePathname('/');
});
