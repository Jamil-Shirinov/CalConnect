# CalConnect Frontend — Design Spec (v1)

**Date:** 2026-10-19
**Status:** Approved in conversation; pending written-spec review

## Goal

A clickable, student-facing CalConnect frontend that runs on web and mobile from one
codebase, faithful to the Figma mockups, using mock data only. Success = every nav
section is a working screen, the demo flow (Home → Login → Dashboard → find/book a tutor
→ feedback) works end to end in a browser and in Expo Go, and tests + type-check pass.

## Scope

**In:** Home, Login, Signup, and an app shell with 8 sections: Dashboard, Tutors, Check-Ins,
Messages, Requests, Feedback, Booking Calendar, Settings. Responsive web + phone layouts.
In-memory mock state.

**Out (later phases):** Firebase Auth/Firestore, real Google sign-in, Gemini match scoring,
admin/tutor views, push notifications, persistence across reloads, dark mode, E2E tests.

## Stack

- Expo (latest SDK) + Expo Router (file-based routing) + TypeScript (strict)
- react-native-web for the browser target
- `@expo-google-fonts/inter` for typography
- Plain `StyleSheet` + theme tokens; no UI component library
- Tests: `jest-expo` + `@testing-library/react-native`

## Project Layout

```
frontend/
  app/
    _layout.tsx               root: fonts, AppStoreProvider, auth redirect
    (auth)/
      index.tsx               Home (logo, Login, Sign up)
      login.tsx
      signup.tsx
    (app)/
      _layout.tsx             AppShell: sidebar (wide) / drawer (narrow)
      dashboard.tsx
      tutors.tsx
      check-ins.tsx
      messages.tsx
      requests.tsx
      feedback.tsx
      booking.tsx
      settings.tsx
  components/                 Sidebar, BrandHeader, Button, TextField, Card,
                              StatTile, DualMonthCalendar, TutorCard, EmptyState
  hooks/useIsWide.ts          width >= 768
  lib/                        calendar.ts (month grid, range logic),
                              filters.ts (tutor filtering), validation.ts
  store/AppStore.tsx          React context + reducer
  data/mock.ts                typed sample data
  theme/                      colors.ts, spacing.ts, typography.ts
  assets/calconnect-logo.png  moved from "frontend/CalConnect Logo.png"
```

## Theme

| Token        | Value     | Use                                      |
|--------------|-----------|------------------------------------------|
| `navy`       | `#1B0A5C` | auth backgrounds, headings, nav text     |
| `gold`       | `#C4A74F` | primary buttons, avatar                  |
| `goldBright` | `#E8C245` | calendar fields, Update/Submit buttons   |
| `cream`      | `#F8E9A8` | sidebar, banners, booking panel          |
| `skyLight`   | `#CFE8EC` | stat tile                                |
| `grey`       | `#D9D9D9` | input fills, card bodies                 |
| `greyDark`   | `#A6A6A6` | card headers                             |
| `white`      | `#FFFFFF` | content background, secondary button     |

Font: Inter (400/600/700). Spacing scale 4/8/12/16/24/32.

## Layout

- `useIsWide()` → wide (≥768px): fixed cream sidebar (logo, 8 nav links, avatar + name at
  bottom) beside content. Narrow: header with hamburger opening the same sidebar as a drawer.
- Every app screen starts with `BrandHeader` (bear + "CalConnect") and "Welcome back, **Name**!".
- Auth screens: navy full-bleed background, centered column ~280px wide on all sizes.

## Data Model (`data/mock.ts`)

Shapes follow `ai/data.json` so Firestore can replace them later.

```ts
type Mode = 'In-person' | 'Online';
interface Student { id; name; email; major; courses: string[]; mode: Mode;
  location: string; maxRate: number; style: string; availability: string[] }
interface Tutor { id; name; major; coursesTaught: string[]; mode: Mode;
  location: string; rate: number; style: string; availability: string[];
  availableDates: string[] /* ISO dates */; matchScore: number /* 1-10, mocked */ }
interface Session { id; tutorId; date: string; start: string; end: string;
  location: string; course: string; checkedIn: boolean }
interface Thread { id; tutorId; messages: { from: 'me' | 'them'; text: string; at: string }[] }
interface SessionRequest { id; tutorId; date: string; course: string;
  status: 'pending' | 'accepted' | 'declined' }
```

Seed: 1 student, ~6 tutors (Berkeley courses: CS 61A/61B/70, Math 54, Data 8…),
~5 sessions (≥1 today relative to the current date), ~4 threads, ~4 requests.

## State (`store/AppStore.tsx`)

React context + `useReducer`, initialized from `mock.ts`, memory-only (reload resets).
Actions: `signIn(email)`, `signOut`, `sendRequest(tutorId, date, course)`,
`checkIn(sessionId)`, `sendMessage(threadId, text)`, `submitFeedback(form)`,
`updateProfile(partial)`. Root layout redirects to `(auth)` when signed out and to
`/dashboard` when signed in.

## Screens

- **Home** — logo, "CalConnect", white **Login** and gold **Sign up** buttons.
- **Login** — "Welcome, / Glad to see you!", email, password, "Forgot password?" (no-op
  alert), gold Login, Google button (mock sign-in), "Sign Up Now" link. Validation:
  required fields, email format. Any valid input signs in.
- **Signup** — "Create Account / to get started now!", email, password, confirm, gold
  Sign Up, Google button, "Login Now" link. Validation: email format, password ≥ 8 chars,
  passwords match.
- **Dashboard** — cream banner with gold **View Now** (→ Booking); 4 stat tiles (upcoming
  sessions, unread messages, pending requests, matched tutors) in cream/navy/gold/sky;
  "Today's Sessions" and "Recent Messages" cards. Narrow: stacked single column.
- **Tutors** — tutor cards sorted by match score: name, major, courses, rate, mode,
  location, availability, score badge; **Request session** opens course/date picker
  → `sendRequest`.
- **Check-Ins** — Today / Upcoming / Past sections; today's unchecked sessions show
  **Check in** → `checkIn`.
- **Messages** — wide: thread list + open thread side by side; narrow: list, tap to open
  thread with back button. Composer appends a message.
- **Requests** — list with status chips (pending/accepted/declined).
- **Feedback** — Name, Email, Subject, Message (multiline), gold **Submit**; validation
  (all required, email format); success message and form reset.
- **Booking Calendar** — filter bar: Location (text), From date, To date, gold **Update**.
  Panel: `DualMonthCalendar` (two months side by side on wide, one on narrow; ‹ › paging;
  past days dimmed; today bold), "Filter by max rate" checkbox + rate input, From → To
  summary, **Reset Dates**, **Done**, **Cancel**. Tapping dates sets From then To (tapping
  before From restarts range). Done/Update shows tutors available in range matching
  location and rate (`lib/filters.ts`) as `TutorCard`s with Request buttons.
- **Settings** — editable profile (name, major, courses, learning style, mode, location,
  availability), Save → `updateProfile`; **Log out** → `signOut`.

## Error Handling

Validation runs on submit; buttons stay enabled and errors render inline under each
invalid field, clearing when that field is edited. Empty states via `EmptyState` (e.g., "No tutors match these dates").
No network errors exist in v1.

## Testing

- Unit: `lib/calendar.ts` (month grid, leading blanks, range selection), `lib/filters.ts`,
  `lib/validation.ts`.
- Component (RNTL): Login/Signup validation and sign-in redirect, Feedback submit +
  reset, Booking range selection + Update filtering, Tutors request flow, Check-In button,
  Messages send.
- Gates: `npx jest` and `npx tsc --noEmit` pass.
- Manual: `npx expo start` → `w` (web, wide + narrow window) and Expo Go on a phone.

## Running

```
cd frontend
npm install
npx expo start      # w = web, scan QR with Expo Go for phone
```
