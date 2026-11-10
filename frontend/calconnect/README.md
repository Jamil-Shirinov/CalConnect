# CalConnect app (Expo)

Mid-semester MVP. Styled from James's Figma mockup and wired to the real backend
(`server/` + Firebase emulators). Runs on web, iOS and Android; the demo uses web.

## Run it locally

Four terminals, from the repo root:

```sh
# 1. Firebase emulators (needs Java)
cd Backend && firebase emulators:start --only auth,firestore --project calconnect-1a99f

# 2. Demo data: resets the emulators and creates 12 accounts (password "calconnect")
cd server && npm install && npm run seed

# 3. API server
cd server && npm start

# 4. The app (opens at http://localhost:8081)
cd frontend/calconnect && npm install && npm run web
```

The app expects the API on `http://localhost:3000`. If that port is taken, start the
server with `PORT=3005` and create `frontend/calconnect/.env.local` containing
`EXPO_PUBLIC_API_URL=http://localhost:3005`, then restart step 4.

By default the app talks to the local emulators, never the real Firebase project.

## Demo script (about 60 seconds)

Run the seed right before recording so everyone starts fresh.

1. **Alex (student)**: Login → tap the *Alex · student* chip → Login.
   The dashboard shows matches, then open **Tutors**: Priya is a 100% match with reasons.
   Tap **Request Priya**. Log out (avatar, top right).
2. **Priya (tutor)**: log in with the *Priya · tutor* chip. **Students** shows
   Alex's request at the top → **Accept**.
3. **Book**: on Alex's card tap **Book a session** → *Tomorrow* → *6 PM* → **Propose session**.
   The server refuses: Priya already has a 6 PM session with Sam (conflict check).
   Pick *7 PM* → **Propose session** → success.
4. **Messages** → Sam Torres shows a live chat.
5. Log in as Alex again → **Sessions** → **Confirm**.

Tip: open Alex in a normal window and Priya in an incognito window side by side.
Requests, accepts and messages update live in both.

## Structure

- `src/app/`: screens (Expo Router; each file is a route)
- `src/components/`: shared UI in the mockup's style (`ui.tsx`, cards, headers)
- `src/lib/`: Firebase setup, API client, live data store, theme colours, time helpers

## Not in the MVP yet

Sign-up and onboarding (use the demo accounts), Google sign-in, profile editing,
announcements and the desktop admin layout from the mockup.
