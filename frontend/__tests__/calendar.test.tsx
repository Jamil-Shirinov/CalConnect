import { fireEvent, render, screen } from '@testing-library/react-native';
import { DualMonthCalendar } from '../components/DualMonthCalendar';

test('past days disabled, paging crosses year', () => {
  const onSelect = jest.fn();
  render(<DualMonthCalendar range={{ from: null, to: null }} onSelect={onSelect} today="2026-10-19" months={1} />);
  fireEvent.press(screen.getByTestId('day-2026-10-18'));
  expect(onSelect).not.toHaveBeenCalled();
  fireEvent.press(screen.getByTestId('day-2026-10-19'));
  expect(onSelect).toHaveBeenCalledWith('2026-10-19');
  for (let i = 0; i < 3; i++) fireEvent.press(screen.getByTestId('cal-next'));
  expect(screen.getByText('January 2027')).toBeTruthy();
});

test('two months side by side', () => {
  render(<DualMonthCalendar range={{ from: null, to: null }} onSelect={() => {}} today="2026-10-19" months={2} />);
  expect(screen.getByText('October 2026')).toBeTruthy();
  expect(screen.getByText('November 2026')).toBeTruthy();
});
