import { screen } from '@testing-library/react-native';
import { renderApp, makeState } from '../test-utils/render';

test('renderApp renders the auth index route', async () => {
  await renderApp('/', makeState({ signedIn: false }));
  expect(screen.getByText('CalConnect')).toBeTruthy();
});
