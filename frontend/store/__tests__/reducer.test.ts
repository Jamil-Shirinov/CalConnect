import { appReducer, isUnread, upcomingSessions } from '../AppStore';
import { makeState } from '../../test-utils/render';

const s0 = makeState();
test('signIn / signOut', () => {
  const s = appReducer({ ...s0, signedIn: false }, { type: 'signIn', email: ' me@berkeley.edu ' });
  expect(s.signedIn).toBe(true); expect(s.student.email).toBe('me@berkeley.edu');
  expect(appReducer(s, { type: 'signOut' }).signedIn).toBe(false);
});
test('sendRequest appends pending and dedupes', () => {
  const a = { type: 'sendRequest', tutorId: 't4', date: '2026-10-24', course: 'Data 8' } as const;
  const s1 = appReducer(s0, a);
  expect(s1.requests.at(-1)).toMatchObject({ tutorId: 't4', status: 'pending', id: 'req-5' });
  expect(appReducer(s1, a)).toBe(s1);
});
test('sendMessage trims and ignores blank', () => {
  const blank = appReducer(s0, { type: 'sendMessage', threadId: 'th1', text: '   ', at: 'x' });
  expect(blank).toBe(s0);
  const s = appReducer(s0, { type: 'sendMessage', threadId: 'th1', text: ' hi ', at: 'x' });
  expect(s.threads.find(t => t.id === 'th1')!.messages.at(-1)).toEqual({ from: 'me', text: 'hi', at: 'x' });
});
test('checkIn, submitFeedback, updateProfile', () => {
  expect(appReducer(s0, { type: 'checkIn', sessionId: 's1' }).sessions.find(x => x.id === 's1')!.checkedIn).toBe(true);
  const f = { name: 'A', email: 'a@b.co', subject: 'S', message: 'M' };
  expect(appReducer(s0, { type: 'submitFeedback', form: f }).feedback).toEqual([f]);
  expect(appReducer(s0, { type: 'updateProfile', partial: { major: 'Math' } }).student.major).toBe('Math');
});
test('selectors', () => {
  expect(s0.threads.filter(isUnread).map(t => t.id)).toEqual(['th1', 'th3']);
  expect(upcomingSessions(s0).map(x => x.id)).toEqual(['s1', 's3', 's4']);
});
