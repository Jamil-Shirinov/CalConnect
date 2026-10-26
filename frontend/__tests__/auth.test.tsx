import { StyleSheet } from 'react-native';
import { fireEvent, screen } from 'expo-router/testing-library';
import { colors } from '../theme/colors';
import { makeState, renderApp } from '../test-utils/render';

const signedOut = () => makeState({ signedIn: false });

test('login validation shows inline errors that clear on edit', async () => {
  await renderApp('/login', signedOut());
  fireEvent.press(screen.getByRole('button', { name: 'Login' }));
  expect(screen.getByText('Email is required')).toBeTruthy();
  fireEvent.changeText(screen.getByPlaceholderText('Email'), 'a');
  expect(screen.queryByText('Email is required')).toBeNull();
  expect(screen.getByText('Password is required')).toBeTruthy();
});

test('valid login redirects to dashboard', async () => {
  await renderApp('/login', signedOut());
  fireEvent.changeText(screen.getByPlaceholderText('Email'), 'alex@berkeley.edu');
  fireEvent.changeText(screen.getByPlaceholderText('Password'), 'anything');
  fireEvent.press(screen.getByRole('button', { name: 'Login' }));
  expect(screen).toHavePathname('/dashboard');
});

test('signup mismatch error; valid signup redirects', async () => {
  await renderApp('/signup', signedOut());
  fireEvent.changeText(screen.getByPlaceholderText('Email'), 'a@b.co');
  fireEvent.changeText(screen.getByPlaceholderText('Password'), 'longenough');
  fireEvent.changeText(screen.getByPlaceholderText('Confirm password'), 'different1');
  fireEvent.press(screen.getByRole('button', { name: 'Sign Up' }));
  expect(screen.getByText('Passwords do not match')).toBeTruthy();
  fireEvent.changeText(screen.getByPlaceholderText('Confirm password'), 'longenough');
  fireEvent.press(screen.getByRole('button', { name: 'Sign Up' }));
  expect(screen).toHavePathname('/dashboard');
});

test('guards: signed-out /dashboard → /, signed-in / → /dashboard', async () => {
  await renderApp('/dashboard', signedOut());
  expect(screen).toHavePathname('/');
  screen.unmount();
  await renderApp('/', makeState());
  expect(screen).toHavePathname('/dashboard');
});

test('auth error text is not navy on the navy background', async () => {
  await renderApp('/login', signedOut());
  fireEvent.press(screen.getByRole('button', { name: 'Login' }));
  const style = StyleSheet.flatten(screen.getByText('Email is required').props.style);
  expect(style.color).not.toBe(colors.navy);
  expect(style.color).toBe(colors.goldBright);
});

test('login and signup have a Back link to home; email fields use email keyboard', async () => {
  await renderApp('/login', signedOut());
  expect(screen.getByPlaceholderText('Email').props.keyboardType).toBe('email-address');
  expect(screen.getByPlaceholderText('Email').props.autoCapitalize).toBe('none');
  fireEvent.press(screen.getByText('‹ Back'));
  expect(screen).toHavePathname('/');
  screen.unmount();
  await renderApp('/signup', signedOut());
  fireEvent.press(screen.getByText('‹ Back'));
  expect(screen).toHavePathname('/');
});

test('forgot password uses window.alert on web', async () => {
  const rn = require('react-native');
  const alertSpy = jest.fn();
  (globalThis as any).window = Object.assign((globalThis as any).window ?? {}, { alert: alertSpy });
  const original = rn.Platform.OS;
  rn.Platform.OS = 'web';
  try {
    await renderApp('/login', signedOut());
    fireEvent.press(screen.getByText('Forgot password?'));
    expect(alertSpy).toHaveBeenCalledWith('Password reset: coming soon');
  } finally {
    rn.Platform.OS = original;
  }
});
