import { fireEvent, screen } from 'expo-router/testing-library';
import { makeState, renderApp } from '../test-utils/render';

afterEach(() => jest.restoreAllMocks());

test('check in today session', async () => {
  await renderApp('/check-ins', makeState());
  fireEvent.press(screen.getByText('Check in'));
  expect(screen.queryByText('Check in')).toBeNull();
  expect(screen.getAllByText('Checked in')).toHaveLength(2);
});

test('narrow messages: open, send, blank ignored, back', async () => {
  await renderApp('/messages', makeState());
  fireEvent.press(screen.getByText('Sarah Lin'));
  const input = screen.getByPlaceholderText('Type a message');
  fireEvent.changeText(input, '   ');
  fireEvent.press(screen.getByText('Send'));
  const before = screen.getAllByTestId('bubble').length;
  fireEvent.changeText(input, 'See you at 4!');
  fireEvent.press(screen.getByText('Send'));
  expect(screen.getAllByTestId('bubble')).toHaveLength(before + 1);
  expect(screen.getByText('See you at 4!')).toBeTruthy();
  expect(input.props.value).toBe('');
  fireEvent.press(screen.getByText('‹ Back'));
  expect(screen.queryByPlaceholderText('Type a message')).toBeNull();
});

test('wide messages shows list and first thread together', async () => {
  jest.spyOn(require('../hooks/useIsWide'), 'useIsWide').mockReturnValue(true);
  await renderApp('/messages', makeState());
  expect(screen.getByPlaceholderText('Type a message')).toBeTruthy();
  expect(screen.getByText('Marcus Johnson')).toBeTruthy();
});

test('wide: switching threads clears the draft', async () => {
  jest.spyOn(require('../hooks/useIsWide'), 'useIsWide').mockReturnValue(true);
  await renderApp('/messages', makeState());
  fireEvent.changeText(screen.getByPlaceholderText('Type a message'), 'for Sarah');
  fireEvent.press(screen.getByText('Marcus Johnson'));
  expect(screen.getByPlaceholderText('Type a message').props.value).toBe('');
});

test('narrow: Back clears the draft', async () => {
  await renderApp('/messages', makeState());
  fireEvent.press(screen.getByText('Sarah Lin'));
  fireEvent.changeText(screen.getByPlaceholderText('Type a message'), 'unsent');
  fireEvent.press(screen.getByText('‹ Back'));
  fireEvent.press(screen.getByText('Marcus Johnson'));
  expect(screen.getByPlaceholderText('Type a message').props.value).toBe('');
});
