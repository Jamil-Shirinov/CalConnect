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

test('TutorCard limits offered dates to the given range', () => {
  const t = makeState().tutors.find((x) => x.id === 't1')!;
  render(<TutorCard tutor={t} today="2026-10-19" onRequest={jest.fn()} range={{ from: '2026-10-19', to: '2026-10-24' }} />);
  fireEvent.press(screen.getByText('Request session'));
  expect(screen.getByText('2026-10-20')).toBeTruthy();
  expect(screen.getByText('2026-10-22')).toBeTruthy();
  expect(screen.queryByText('2026-10-27')).toBeNull();
});

test('TutorCard says what is missing when Send request is pressed early', () => {
  const t = makeState().tutors.find((x) => x.id === 't6')!;
  render(<TutorCard tutor={t} today="2026-10-19" onRequest={jest.fn()} />);
  fireEvent.press(screen.getByText('Request session'));
  fireEvent.press(screen.getByText('Send request'));
  expect(screen.getByText('Choose a course and a date')).toBeTruthy();
  fireEvent.press(screen.getByText('Stat 20'));
  fireEvent.press(screen.getByText('Send request'));
  expect(screen.getByText('Choose a date')).toBeTruthy();
  fireEvent.press(screen.getByText('2026-11-08'));
  expect(screen.queryByText('Choose a date')).toBeNull();
});
