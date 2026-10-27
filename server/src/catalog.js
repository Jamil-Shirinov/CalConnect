// Shared lists used by onboarding, matching and the seed data.
// The frontend keeps a copy in src/lib/catalog.ts; change both together.

export const COURSES = [
  "COMPSCI 61A", "COMPSCI 61B", "COMPSCI 61C", "COMPSCI 70",
  "DATA C8", "DATA C100", "EECS 16A", "EECS 16B",
  "MATH 1A", "MATH 1B", "MATH 53", "MATH 54",
  "PHYSICS 7A", "PHYSICS 7B", "CHEM 1A", "STAT 20", "ECON 1"
];

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

// Availability is picked as day + block; stored as {day, start, end} slots.
export const TIME_BLOCKS = {
  morning: { start: "09:00", end: "12:00" },
  afternoon: { start: "12:00", end: "17:00" },
  evening: { start: "17:00", end: "21:00" }
};

// Students answer how they like to learn, tutors how they like to teach.
// Matching rewards the same answer.
export const QUESTIONS = [
  {
    key: "pace",
    student: "How fast do you like to go?",
    tutor: "How fast do you usually go?",
    options: { slow: "Slow and thorough", steady: "Steady", fast: "Fast, skip what I know" }
  },
  {
    key: "style",
    student: "How do you learn best?",
    tutor: "How do you teach best?",
    options: { examples: "Worked examples", concepts: "Big-picture concepts", practice: "Hands-on practice" }
  },
  {
    key: "structure",
    student: "What kind of sessions do you want?",
    tutor: "What kind of sessions do you run?",
    options: { structured: "Planned agenda", flexible: "Whatever I'm stuck on" }
  },
  {
    key: "feedback",
    student: "How should a tutor give feedback?",
    tutor: "How do you give feedback?",
    options: { direct: "Direct and blunt", encouraging: "Gentle and encouraging" }
  }
];
