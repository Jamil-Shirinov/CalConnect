import { validateFeedback, validateLogin, validateSignup } from '../validation';

test('login requires both fields', () =>
  expect(validateLogin({ email: '', password: '' })).toEqual({ email: 'Email is required', password: 'Password is required' }));
test('login rejects bad email, accepts padded good email', () => {
  expect(validateLogin({ email: 'alex@', password: 'x' })).toEqual({ email: 'Enter a valid email' });
  expect(validateLogin({ email: '  alex@berkeley.edu ', password: 'x' })).toEqual({});
});
test('whitespace-only counts as empty', () =>
  expect(validateFeedback({ name: '  ', email: 'a@b.co', subject: 'Hi', message: '\n' }))
    .toEqual({ name: 'Name is required', message: 'Message is required' }));
test('signup: short password and mismatch', () => {
  expect(validateSignup({ email: 'a@b.co', password: 'short', confirm: 'short' }))
    .toEqual({ password: 'Password must be at least 8 characters' });
  expect(validateSignup({ email: 'a@b.co', password: 'longenough', confirm: 'longenougH' }))
    .toEqual({ confirm: 'Passwords do not match' });
});
