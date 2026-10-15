// Security rules tests. Run with `npm run test:rules` (starts and stops the
// Firestore emulator). No real accounts or data are involved.
import { readFileSync } from "node:fs";
import { before, after, beforeEach, describe, test } from "node:test";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails
} from "@firebase/rules-unit-testing";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection,
  query, where, getDocs, serverTimestamp, Timestamp
} from "firebase/firestore";

const STUDENT = "student1";
const TUTOR = "tutor1";
const STRANGER = "stranger1";
const MATCH_ID = `${STUDENT}_${TUTOR}`;

let env;

const as = (uid, email = `${uid}@berkeley.edu`) =>
  env.authenticatedContext(uid, { email, email_verified: true }).firestore();
const anon = () => env.unauthenticatedContext().firestore();

// Write starting data as the server would (rules bypassed).
const seed = (path, data) =>
  env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), path), data));

const match = (status, requestedBy = null) => ({
  studentId: STUDENT, tutorId: TUTOR, participants: [STUDENT, TUTOR],
  status, requestedBy, score: 0.8, reasons: [], courses: ["COMPSCI 61A"],
  createdAt: Timestamp.now(), updatedAt: Timestamp.now()
});

const session = (status, proposedBy = STUDENT, end = new Date(Date.now() + 3600e3)) => ({
  matchId: MATCH_ID, studentId: STUDENT, tutorId: TUTOR, participants: [STUDENT, TUTOR],
  course: "COMPSCI 61A", start: Timestamp.fromMillis(end.getTime() - 3600e3),
  end: Timestamp.fromDate(end), format: "online", location: "zoom", notes: "",
  status, proposedBy, createdAt: Timestamp.now()
});

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-calconnect",
    firestore: { rules: readFileSync(new URL("../firestore.rules", import.meta.url), "utf8") }
  });
});
after(() => env.cleanup());
beforeEach(() => env.clearFirestore());

describe("users", () => {
  const profile = (uid, extra = {}) => ({
    uid, email: `${uid}@berkeley.edu`, name: "Test", role: "student",
    onboardingComplete: false, createdAt: serverTimestamp(), ...extra
  });

  test("signed-in users can read profiles, signed-out users can't", async () => {
    await seed(`users/${TUTOR}`, { uid: TUTOR, role: "tutor" });
    await assertSucceeds(getDoc(doc(as(STUDENT), `users/${TUTOR}`)));
    await assertFails(getDoc(doc(anon(), `users/${TUTOR}`)));
  });

  test("a user can create their own Berkeley profile", async () => {
    await assertSucceeds(setDoc(doc(as(STUDENT), `users/${STUDENT}`), profile(STUDENT)));
  });

  test("a user can't create someone else's profile", async () => {
    await assertFails(setDoc(doc(as(STUDENT), `users/${TUTOR}`), profile(TUTOR)));
  });

  test("non-Berkeley emails are rejected", async () => {
    const db = as(STUDENT, "someone@gmail.com");
    await assertFails(setDoc(doc(db, `users/${STUDENT}`),
      profile(STUDENT, { email: "someone@gmail.com" })));
  });

  test("role must be student or tutor", async () => {
    await assertFails(setDoc(doc(as(STUDENT), `users/${STUDENT}`),
      profile(STUDENT, { role: "admin" })));
  });

  test("a user can edit their profile but not change their role", async () => {
    await seed(`users/${STUDENT}`, { uid: STUDENT, email: `${STUDENT}@berkeley.edu`, role: "student", bio: "" });
    const db = as(STUDENT);
    await assertSucceeds(updateDoc(doc(db, `users/${STUDENT}`), { bio: "Hi!" }));
    await assertFails(updateDoc(doc(db, `users/${STUDENT}`), { role: "tutor" }));
  });
});

describe("matches", () => {
  test("only participants can read a match, including by query", async () => {
    await seed(`matches/${MATCH_ID}`, match("suggested"));
    await assertSucceeds(getDoc(doc(as(STUDENT), `matches/${MATCH_ID}`)));
    await assertSucceeds(getDocs(query(collection(as(TUTOR), "matches"),
      where("participants", "array-contains", TUTOR))));
    await assertFails(getDoc(doc(as(STRANGER), `matches/${MATCH_ID}`)));
  });

  test("clients can't create matches", async () => {
    await assertFails(setDoc(doc(as(STUDENT), `matches/${MATCH_ID}`), match("accepted")));
  });

  test("a participant can request a suggested match", async () => {
    await seed(`matches/${MATCH_ID}`, match("suggested"));
    await assertSucceeds(updateDoc(doc(as(STUDENT), `matches/${MATCH_ID}`),
      { status: "requested", requestedBy: STUDENT, updatedAt: serverTimestamp() }));
  });

  test("the other person can accept, the requester can't", async () => {
    await seed(`matches/${MATCH_ID}`, match("requested", STUDENT));
    const accept = { status: "accepted", updatedAt: serverTimestamp() };
    await assertFails(updateDoc(doc(as(STUDENT), `matches/${MATCH_ID}`), accept));
    await assertSucceeds(updateDoc(doc(as(TUTOR), `matches/${MATCH_ID}`), accept));
  });

  test("can't skip straight from suggested to accepted", async () => {
    await seed(`matches/${MATCH_ID}`, match("suggested"));
    await assertFails(updateDoc(doc(as(TUTOR), `matches/${MATCH_ID}`),
      { status: "accepted", updatedAt: serverTimestamp() }));
  });

  test("participants can't change the score", async () => {
    await seed(`matches/${MATCH_ID}`, match("suggested"));
    await assertFails(updateDoc(doc(as(STUDENT), `matches/${MATCH_ID}`),
      { score: 1, updatedAt: serverTimestamp() }));
  });
});

describe("messages", () => {
  const message = (senderId) => ({ senderId, text: "Hi!", createdAt: serverTimestamp() });

  test("participants can chat once the match is accepted", async () => {
    await seed(`matches/${MATCH_ID}`, match("accepted", STUDENT));
    const db = as(TUTOR);
    await assertSucceeds(addDoc(collection(db, `matches/${MATCH_ID}/messages`), message(TUTOR)));
    await assertSucceeds(getDocs(collection(db, `matches/${MATCH_ID}/messages`)));
  });

  test("no chat before the match is accepted", async () => {
    await seed(`matches/${MATCH_ID}`, match("requested", STUDENT));
    await assertFails(addDoc(collection(as(STUDENT), `matches/${MATCH_ID}/messages`), message(STUDENT)));
  });

  test("outsiders can't read or send, and nobody can pose as the other person", async () => {
    await seed(`matches/${MATCH_ID}`, match("accepted", STUDENT));
    await assertFails(getDocs(collection(as(STRANGER), `matches/${MATCH_ID}/messages`)));
    await assertFails(addDoc(collection(as(STUDENT), `matches/${MATCH_ID}/messages`), message(TUTOR)));
  });
});

describe("sessions", () => {
  const path = "sessions/s1";

  test("clients can't create sessions", async () => {
    await assertFails(setDoc(doc(as(STUDENT), path), session("proposed")));
  });

  test("only participants can read a session", async () => {
    await seed(path, session("proposed"));
    await assertSucceeds(getDoc(doc(as(TUTOR), path)));
    await assertFails(getDoc(doc(as(STRANGER), path)));
  });

  test("the other person confirms, the proposer can't", async () => {
    await seed(path, session("proposed", STUDENT));
    await assertFails(updateDoc(doc(as(STUDENT), path), { status: "confirmed" }));
    await assertSucceeds(updateDoc(doc(as(TUTOR), path), { status: "confirmed" }));
  });

  test("either participant can cancel", async () => {
    await seed(path, session("confirmed"));
    await assertSucceeds(updateDoc(doc(as(STUDENT), path), { status: "cancelled" }));
  });

  test("can't move the time, only the status", async () => {
    await seed(path, session("confirmed"));
    await assertFails(updateDoc(doc(as(TUTOR), path), { location: "elsewhere" }));
  });

  test("completed only after the session has ended", async () => {
    await seed(path, session("confirmed"));
    await assertFails(updateDoc(doc(as(TUTOR), path), { status: "completed" }));
    await seed("sessions/s2", session("confirmed", STUDENT, new Date(Date.now() - 60e3)));
    await assertSucceeds(updateDoc(doc(as(TUTOR), "sessions/s2"), { status: "completed" }));
  });
});

describe("announcements", () => {
  const announcement = {
    tutorId: TUTOR, title: "No class Friday", description: "", category: "schedule",
    audience: [STUDENT], sendEmail: false, emailSent: false, createdAt: Timestamp.now()
  };

  test("the audience and the tutor can read, others can't", async () => {
    await seed("announcements/a1", announcement);
    await assertSucceeds(getDocs(query(collection(as(STUDENT), "announcements"),
      where("audience", "array-contains", STUDENT))));
    await assertSucceeds(getDocs(query(collection(as(TUTOR), "announcements"),
      where("tutorId", "==", TUTOR))));
    await assertFails(getDoc(doc(as(STRANGER), "announcements/a1")));
  });

  test("clients can't post announcements", async () => {
    await assertFails(setDoc(doc(as(TUTOR), "announcements/a2"), announcement));
  });

  test("only the posting tutor can delete", async () => {
    await seed("announcements/a1", announcement);
    await assertFails(deleteDoc(doc(as(STUDENT), "announcements/a1")));
    await assertSucceeds(deleteDoc(doc(as(TUTOR), "announcements/a1")));
  });
});

describe("everything else", () => {
  test("feedback is closed for now", async () => {
    await assertFails(setDoc(doc(as(STUDENT), "feedback/s1"), { rating: 5 }));
  });
});
