// Resets the local emulators and loads demo accounts. Run `npm run seed`
// while `firebase emulators:start` is running (from the Backend folder).
// Refuses to run against the real Firebase project.
import "dotenv/config";
import { auth, db, usingEmulators, Timestamp } from "./firebase.js";
import { TIME_BLOCKS } from "./catalog.js";
import { scorePair } from "./matching.js";

if (!usingEmulators) {
  console.error("Seeding only runs against the emulators. Set FIRESTORE_EMULATOR_HOST in server/.env.");
  process.exit(1);
}

const PASSWORD = "calconnect";
const projectId = process.env.FIREBASE_PROJECT_ID;

const slots = (...pairs) => pairs.map(([day, block]) => ({ day, ...TIME_BLOCKS[block] }));
const answers = (pace, style, structure, feedback) => ({ pace, style, structure, feedback });

const PEOPLE = [
  // Demo accounts: log in as these during the demo
  { name: "Alex Kim", role: "student", courses: ["COMPSCI 61A", "MATH 54"],
    availability: slots(["tue", "evening"], ["thu", "evening"], ["wed", "afternoon"]),
    format: ["online", "in-person"], questionnaire: answers("steady", "practice", "flexible", "encouraging"),
    bio: "Second-year intended CS major. Recursion and linear algebra proofs are my weak spots." },
  { name: "Priya Nair", role: "tutor", courses: ["COMPSCI 61A", "COMPSCI 61B", "MATH 54", "DATA C8"],
    availability: slots(["tue", "evening"], ["thu", "evening"], ["mon", "afternoon"]),
    format: ["online", "in-person"], questionnaire: answers("steady", "practice", "flexible", "encouraging"),
    bio: "Former 61A tutor, also happy to help with 54. I like working through problems together until it clicks." },

  // Other tutors
  { name: "Ryan Park", role: "tutor", courses: ["COMPSCI 61A", "MATH 54", "PHYSICS 7B"],
    availability: slots(["wed", "afternoon"], ["thu", "evening"]),
    format: ["online"], questionnaire: answers("steady", "practice", "flexible", "direct"),
    bio: "EECS senior. Happy to help with 61A projects and 54 problem sets." },
  { name: "Elena Petrova", role: "tutor", courses: ["COMPSCI 61A", "COMPSCI 61C", "COMPSCI 70"],
    availability: slots(["tue", "afternoon"], ["thu", "afternoon"], ["sat", "morning"]),
    format: ["online"], questionnaire: answers("fast", "concepts", "structured", "direct"),
    bio: "Theory nerd. I'll make sure you understand why, not just how." },
  { name: "Marcus Johnson", role: "tutor", courses: ["MATH 1A", "MATH 1B", "MATH 53", "MATH 54"],
    availability: slots(["mon", "morning"], ["wed", "morning"], ["fri", "afternoon"]),
    format: ["in-person"], questionnaire: answers("slow", "concepts", "structured", "direct"),
    bio: "Math major, three semesters of tutoring lower-division math." },
  { name: "David Okafor", role: "tutor", courses: ["DATA C8", "DATA C100", "STAT 20"],
    availability: slots(["wed", "evening"], ["fri", "evening"]),
    format: ["online", "in-person"], questionnaire: answers("steady", "examples", "flexible", "encouraging"),
    bio: "Data science major. Pandas, probability and project help." },
  { name: "Sofia Martinez", role: "tutor", courses: ["CHEM 1A", "PHYSICS 7A"],
    availability: slots(["mon", "evening"], ["wed", "evening"]),
    format: ["in-person"], questionnaire: answers("slow", "examples", "structured", "encouraging"),
    bio: "Pre-med. Lots of worked examples and practice exams." },
  { name: "Kevin Tran", role: "tutor", courses: ["EECS 16A", "EECS 16B", "COMPSCI 61B"],
    availability: slots(["tue", "evening"], ["sun", "afternoon"]),
    format: ["online"], questionnaire: answers("fast", "practice", "flexible", "direct"),
    bio: "Circuits and Java. I move fast and assign practice." },
  { name: "Hannah Weiss", role: "tutor", courses: ["ECON 1", "STAT 20", "MATH 1A"],
    availability: slots(["thu", "morning"], ["fri", "morning"]),
    format: ["online", "in-person"], questionnaire: answers("steady", "concepts", "flexible", "encouraging"),
    bio: "Econ and stats, with real-world examples." },

  // Other students
  { name: "Sam Torres", role: "student", courses: ["COMPSCI 61A"],
    availability: slots(["tue", "evening"], ["thu", "evening"]),
    format: ["online"], questionnaire: answers("steady", "practice", "flexible", "encouraging"),
    bio: "Taking 61A for the first time." },
  { name: "Jordan Lee", role: "student", courses: ["COMPSCI 61B", "DATA C8"],
    availability: slots(["mon", "afternoon"]),
    format: ["in-person"], questionnaire: answers("fast", "practice", "structured", "direct"),
    bio: "Need help with 61B data structures." },
  { name: "Chloe Nguyen", role: "student", courses: ["MATH 53", "PHYSICS 7A"],
    availability: slots(["mon", "evening"], ["wed", "morning"]),
    format: ["in-person"], questionnaire: answers("slow", "examples", "structured", "encouraging"),
    bio: "Pre-engineering, struggling with multivariable calc." }
];

/** A time `daysFromNow` days ahead at `hour`:00 Pacific time. */
function pacific(daysFromNow, hour) {
  const date = new Date(Date.now() + daysFromNow * 86400e3);
  const ymd = date.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  const offset = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", timeZoneName: "shortOffset" })
    .formatToParts(date).find((p) => p.type === "timeZoneName").value; // e.g. "GMT-7"
  const hours = Number(offset.replace("GMT", "") || 0);
  const sign = hours <= 0 ? "-" : "+";
  return new Date(`${ymd}T${String(hour).padStart(2, "0")}:00:00${sign}${String(Math.abs(hours)).padStart(2, "0")}:00`);
}

async function clearEmulators() {
  const urls = [
    `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${projectId}/databases/(default)/documents`,
    `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/emulator/v1/projects/${projectId}/accounts`
  ];
  for (const url of urls) {
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) throw new Error(`Couldn't clear ${url} (${res.status}). Are the emulators running?`);
  }
}

async function main() {
  await clearEmulators();

  const byName = {};
  for (const p of PEOPLE) {
    const email = `${p.name.split(" ")[0].toLowerCase()}@berkeley.edu`;
    const { uid } = await auth.createUser({ email, password: PASSWORD, displayName: p.name, emailVerified: true });
    const profile = {
      uid, email, name: p.name, photoURL: null, role: p.role, onboardingComplete: true,
      courses: p.courses, availability: p.availability, format: p.format,
      questionnaire: p.questionnaire, bio: p.bio, rate: p.role === "tutor" ? 0 : null,
      createdAt: Timestamp.now()
    };
    await db.doc(`users/${uid}`).set(profile);
    byName[p.name.split(" ")[0]] = profile;
  }

  const { Priya, Sam, Jordan } = byName;
  const matchDoc = (student, tutor, status, requestedBy) => ({
    studentId: student.uid, tutorId: tutor.uid, participants: [student.uid, tutor.uid],
    status, requestedBy, ...scorePair(student, tutor),
    createdAt: Timestamp.now(), updatedAt: Timestamp.now()
  });

  // Sam and Priya already work together: chat history and a session tomorrow
  // evening. Booking Alex with Priya at the same time shows the conflict check.
  const samMatch = `${Sam.uid}_${Priya.uid}`;
  await db.doc(`matches/${samMatch}`).set(matchDoc(Sam, Priya, "accepted", Sam.uid));
  const chat = [
    [Sam, "Hi Priya! Could we go over the Hog project this week?"],
    [Priya, "Of course. Tomorrow at 6 works for me, I'll send a Zoom link."],
    [Sam, "Perfect, thank you!"]
  ];
  for (const [i, [from, text]] of chat.entries()) {
    await db.collection(`matches/${samMatch}/messages`).add({
      senderId: from.uid, text, createdAt: Timestamp.fromMillis(Date.now() - (chat.length - i) * 3600e3)
    });
  }
  await db.collection("sessions").add({
    matchId: samMatch, studentId: Sam.uid, tutorId: Priya.uid, participants: [Sam.uid, Priya.uid],
    course: "COMPSCI 61A", start: Timestamp.fromDate(pacific(1, 18)), end: Timestamp.fromDate(pacific(1, 19)),
    format: "online", location: "Zoom", notes: "Hog project", status: "confirmed",
    proposedBy: Sam.uid, createdAt: Timestamp.now()
  });

  // Jordan has asked Priya for help, so Priya has a request to accept.
  await db.doc(`matches/${Jordan.uid}_${Priya.uid}`).set(matchDoc(Jordan, Priya, "requested", Jordan.uid));

  console.log(`Seeded ${PEOPLE.length} accounts. Every password is "${PASSWORD}".`);
  console.table(PEOPLE.map((p) => ({ name: p.name, role: p.role, email: byName[p.name.split(" ")[0]].email })));
  console.log("Demo: log in as alex@berkeley.edu (student) and priya@berkeley.edu (tutor).");
}

main().then(() => process.exit(0), (err) => {
  console.error(err.message);
  process.exit(1);
});
