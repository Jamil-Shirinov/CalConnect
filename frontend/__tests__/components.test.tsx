import { fireEvent, render, screen } from '@testing-library/react-native';
import { TextField } from '../components/TextField';
import { TutorCard } from '../components/TutorCard';
import { makeState } from '../test-utils/render';

test('TextField shows error', () => {
  render(<TextField placeholder="Email" value="" onChangeText={() => {}} error="Email is required" />);
  expect(screen.getByText('Email is required')).toBeTruthy();
});

test('TutorCard request flow', () => {
  const onRequest = jest.fn();
  const t = makeState().tutors.find((x) => x.id === 't6')!;
  render(<TutorCard tutor={t} today="2026-10-19" onRequest={onRequest} />);
  fireEvent.press(screen.getByText('Request session'));
  expect(screen.queryByText('2026-10-17')).toBeNull();
  fireEvent.press(screen.getByText('Send request'));
  expect(onRequest).not.toHaveBeenCalled();
  fireEvent.press(screen.getByText('Stat 20'));
  fireEvent.press(screen.getByText('2026-11-08'));
  fireEvent.press(screen.getByText('Send request'));
  expect(onRequest).toHaveBeenCalledWith('2026-11-08', 'Stat 20');
  expect(screen.getByText('Request sent')).toBeTruthy();
});
