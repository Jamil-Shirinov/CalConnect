import type { ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { Slot } from 'expo-router';
import { renderRouter } from 'expo-router/testing-library';
import { AppStoreProvider, createInitialState, type AppState } from '../store/AppStore';
import AuthLayout from '../app/(auth)/_layout';
import AuthIndex from '../app/(auth)/index';
import Login from '../app/(auth)/login';
import Signup from '../app/(auth)/signup';
import AppLayout from '../app/(app)/_layout';
import Dashboard from '../app/(app)/dashboard';
import Tutors from '../app/(app)/tutors';
import CheckIns from '../app/(app)/check-ins';
import Messages from '../app/(app)/messages';
import Requests from '../app/(app)/requests';
import Feedback from '../app/(app)/feedback';
import Booking from '../app/(app)/booking';
import Settings from '../app/(app)/settings';

export const TEST_TODAY = '2026-10-19';

export function makeState(overrides: Partial<AppState> = {}): AppState {
  return { ...createInitialState(TEST_TODAY), signedIn: true, ...overrides };
}

export function renderWithStore(ui: ReactElement, state: AppState = makeState()) {
  return render(<AppStoreProvider initialState={state}>{ui}</AppStoreProvider>);
}

export function renderApp(initialUrl: string, state: AppState = makeState()) {
  const Layout = () => (
    <AppStoreProvider initialState={state}>
      <Slot />
    </AppStoreProvider>
  );
  return renderRouter(
    {
      _layout: Layout,
      '(auth)/_layout': AuthLayout,
      '(auth)/index': AuthIndex,
      '(auth)/login': Login,
      '(auth)/signup': Signup,
      '(app)/_layout': AppLayout,
      '(app)/dashboard': Dashboard,
      '(app)/tutors': Tutors,
      '(app)/check-ins': CheckIns,
      '(app)/messages': Messages,
      '(app)/requests': Requests,
      '(app)/feedback': Feedback,
      '(app)/booking': Booking,
      '(app)/settings': Settings,
    },
    { initialUrl },
  );
}
