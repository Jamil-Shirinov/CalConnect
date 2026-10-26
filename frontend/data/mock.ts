import { addDays } from '../lib/calendar';

export type Mode = 'In-person' | 'Online';

export interface Student {
  id: string;
  name: string;
  email: string;
  major: string;
  courses: string[];
  mode: Mode;
  location: string;
  maxRate: number;
  style: string;
  availability: string[];
}

export interface Tutor {
  id: string;
  name: string;
  major: string;
  coursesTaught: string[];
  mode: Mode;
  location: string;
  rate: number;
  style: string;
  availability: string[];
  availableDates: string[];
  matchScore: number;
}

export interface Session {
  id: string;
  tutorId: string;
  date: string;
  start: string;
  end: string;
  location: string;
  course: string;
  checkedIn: boolean;
}

export interface Thread {
  id: string;
  tutorId: string;
  messages: { from: 'me' | 'them'; text: string; at: string }[];
}

export interface SessionRequest {
  id: string;
  tutorId: string;
  date: string;
  course: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface MockData {
  student: Student;
  tutors: Tutor[];
  sessions: Session[];
  threads: Thread[];
  requests: SessionRequest[];
}

export function buildMockData(today: string): MockData {
  const d = (n: number) => addDays(today, n);
  const dates = (...offsets: number[]) => offsets.map(d);

  const student: Student = {
    id: 'stu-1',
    name: 'Alex Chen',
    email: 'alex.chen@berkeley.edu',
    major: 'EECS (Sophomore)',
    courses: ['CS 61B', 'CS 70'],
    mode: 'In-person',
    location: 'Moffitt Library',
    maxRate: 35,
    style: 'project-debugging',
    availability: ['Tue 4-7 PM', 'Thu 5-8 PM'],
  };

  const tutors: Tutor[] = [
    {
      id: 't1', name: 'Sarah Lin', major: 'CS & Data Science (Senior)',
      coursesTaught: ['CS 61A', 'CS 61B'], mode: 'In-person', location: 'Moffitt Library',
      rate: 30, style: 'project-debugging', availability: ['Tue 4-6 PM', 'Fri 1-4 PM'],
      availableDates: dates(1, 3, 8), matchScore: 9,
    },
    {
      id: 't2', name: 'Marcus Johnson', major: 'EECS (Junior)',
      coursesTaught: ['CS 61B', 'CS 70'], mode: 'Online', location: 'Zoom',
      rate: 25, style: 'concept-review', availability: ['Mon 6-9 PM'],
      availableDates: dates(2, 9), matchScore: 8,
    },
    {
      id: 't3', name: 'Priya Patel', major: 'Applied Math (Senior)',
      coursesTaught: ['Math 54', 'Math 53'], mode: 'In-person', location: 'Evans Hall',
      rate: 40, style: 'practice-problems', availability: ['Wed 3-6 PM'],
      availableDates: dates(4, 11), matchScore: 7,
    },
    {
      id: 't4', name: 'Daniel Kim', major: 'Data Science (Junior)',
      coursesTaught: ['Data 8', 'Data 100'], mode: 'Online', location: 'Zoom',
      rate: 20, style: 'project-debugging', availability: ['Thu 2-5 PM'],
      availableDates: dates(0, 5), matchScore: 6,
    },
    {
      id: 't5', name: 'Elena Garcia', major: 'Computer Science (Senior)',
      coursesTaught: ['CS 61A', 'CS 61C'], mode: 'In-person', location: 'Main Stacks',
      rate: 35, style: 'concept-review', availability: ['Sat 10 AM-1 PM'],
      availableDates: dates(6, 13), matchScore: 5,
    },
    {
      id: 't6', name: 'Jordan Lee', major: 'Statistics (Sophomore)',
      coursesTaught: ['Data 8', 'Stat 20'], mode: 'In-person', location: 'Moffitt Library',
      rate: 18, style: 'practice-problems', availability: ['Tue 12-3 PM'],
      availableDates: dates(-2, 20), matchScore: 4,
    },
  ];

  const sessions: Session[] = [
    { id: 's1', tutorId: 't1', date: d(0), start: '16:00', end: '17:00', location: 'Moffitt Library', course: 'CS 61B', checkedIn: false },
    { id: 's2', tutorId: 't4', date: d(0), start: '10:00', end: '11:00', location: 'Zoom', course: 'Data 8', checkedIn: true },
    { id: 's3', tutorId: 't2', date: d(2), start: '18:00', end: '19:00', location: 'Zoom', course: 'CS 70', checkedIn: false },
    { id: 's4', tutorId: 't3', date: d(4), start: '15:00', end: '16:00', location: 'Evans Hall', course: 'Math 54', checkedIn: false },
    { id: 's5', tutorId: 't1', date: d(-3), start: '16:00', end: '17:00', location: 'Moffitt Library', course: 'CS 61B', checkedIn: true },
  ];

  const at = (n: number, time: string) => `${d(n)}T${time}`;
  const threads: Thread[] = [
    {
      id: 'th1', tutorId: 't1',
      messages: [
        { from: 'me', text: 'Hi Sarah, can we focus on the Ants project?', at: at(-2, '14:05:00') },
        { from: 'them', text: 'Sure! Bring your current code and we will debug it together.', at: at(-1, '15:30:00') },
      ],
    },
    {
      id: 'th2', tutorId: 't2',
      messages: [
        { from: 'them', text: 'Happy to go over graph theory before the midterm.', at: at(-3, '19:10:00') },
        { from: 'me', text: 'Great, does Monday evening work?', at: at(-2, '09:45:00') },
        { from: 'me', text: 'I can also do Wednesday if that is easier.', at: at(-1, '09:50:00') },
      ],
    },
    {
      id: 'th3', tutorId: 't3',
      messages: [
        { from: 'me', text: 'Could you help with eigenvalues and diagonalization?', at: at(-2, '12:20:00') },
        { from: 'them', text: 'Absolutely, I have a few practice problems ready.', at: at(0, '08:15:00') },
      ],
    },
    {
      id: 'th4', tutorId: 't4',
      messages: [
        { from: 'them', text: 'Thanks for the session today!', at: at(-2, '11:30:00') },
        { from: 'me', text: 'Thank you, the pandas tips were really helpful.', at: at(-1, '17:00:00') },
      ],
    },
  ];

  const requests: SessionRequest[] = [
    { id: 'r1', tutorId: 't1', date: d(3), course: 'CS 61A', status: 'accepted' },
    { id: 'r2', tutorId: 't2', date: d(9), course: 'CS 70', status: 'pending' },
    { id: 'r3', tutorId: 't3', date: d(11), course: 'Math 53', status: 'declined' },
    { id: 'r4', tutorId: 't5', date: d(6), course: 'CS 61C', status: 'pending' },
  ];

  return { student, tutors, sessions, threads, requests };
}
