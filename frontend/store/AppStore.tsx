import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import { buildMockData, type MockData, type Session, type Student, type Thread } from '../data/mock';
import { todayISO } from '../lib/calendar';

export interface FeedbackForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface AppState extends MockData {
  signedIn: boolean;
  today: string;
  feedback: FeedbackForm[];
}

export function createInitialState(today: string): AppState {
  return { ...buildMockData(today), signedIn: false, today, feedback: [] };
}

export type Action =
  | { type: 'signIn'; email: string }
  | { type: 'signOut' }
  | { type: 'sendRequest'; tutorId: string; date: string; course: string }
  | { type: 'checkIn'; sessionId: string }
  | { type: 'sendMessage'; threadId: string; text: string; at: string }
  | { type: 'submitFeedback'; form: FeedbackForm }
  | { type: 'updateProfile'; partial: Partial<Student> };

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'signIn':
      return { ...state, signedIn: true, student: { ...state.student, email: action.email.trim() } };
    case 'signOut':
      return { ...state, signedIn: false };
    case 'sendRequest': {
      const { tutorId, date, course } = action;
      const duplicate = state.requests.some(
        r => r.status === 'pending' && r.tutorId === tutorId && r.date === date && r.course === course,
      );
      if (duplicate) return state;
      const id = 'req-' + (state.requests.length + 1);
      return { ...state, requests: [...state.requests, { id, tutorId, date, course, status: 'pending' }] };
    }
    case 'checkIn':
      return {
        ...state,
        sessions: state.sessions.map(s => (s.id === action.sessionId ? { ...s, checkedIn: true } : s)),
      };
    case 'sendMessage': {
      const text = action.text.trim();
      if (!text) return state;
      return {
        ...state,
        threads: state.threads.map(t =>
          t.id === action.threadId ? { ...t, messages: [...t.messages, { from: 'me', text, at: action.at }] } : t,
        ),
      };
    }
    case 'submitFeedback':
      return { ...state, feedback: [...state.feedback, action.form] };
    case 'updateProfile':
      return { ...state, student: { ...state.student, ...action.partial } };
  }
}

export function isUnread(thread: Thread): boolean {
  return thread.messages.at(-1)?.from === 'them';
}

export function upcomingSessions(state: Pick<AppState, 'sessions' | 'today'>): Session[] {
  return state.sessions
    .filter(s => s.date >= state.today && !s.checkedIn)
    .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
}

export interface AppStore {
  state: AppState;
  signIn(email: string): void;
  signOut(): void;
  sendRequest(tutorId: string, date: string, course: string): void;
  checkIn(sessionId: string): void;
  sendMessage(threadId: string, text: string): void;
  submitFeedback(form: FeedbackForm): void;
  updateProfile(partial: Partial<Student>): void;
}

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ initialState, children }: { initialState?: AppState; children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, init => init ?? createInitialState(todayISO()));
  const store = useMemo<AppStore>(
    () => ({
      state,
      signIn: email => dispatch({ type: 'signIn', email }),
      signOut: () => dispatch({ type: 'signOut' }),
      sendRequest: (tutorId, date, course) => dispatch({ type: 'sendRequest', tutorId, date, course }),
      checkIn: sessionId => dispatch({ type: 'checkIn', sessionId }),
      sendMessage: (threadId, text) =>
        dispatch({ type: 'sendMessage', threadId, text, at: new Date().toISOString() }),
      submitFeedback: form => dispatch({ type: 'submitFeedback', form }),
      updateProfile: partial => dispatch({ type: 'updateProfile', partial }),
    }),
    [state],
  );
  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStore {
  const store = useContext(AppStoreContext);
  if (!store) throw new Error('useAppStore must be used within an AppStoreProvider');
  return store;
}
