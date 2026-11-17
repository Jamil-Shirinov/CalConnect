// Creating and editing the signed-in user's profile (users/{uid}).
// The fields match what server/src/seed.js writes; the security rules only
// let users create their own doc with their @berkeley.edu email, and never
// change uid, email, role or createdAt afterwards.
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

import { refreshMatches } from "./api";
import { QUESTIONS, TIME_BLOCKS, type Block } from "./catalog";
import { auth, db } from "./firebase";
import type { Format, Profile, Role, Slot } from "./types";

export type Questionnaire = Record<string, string>;

/** What the profile form edits. */
export type ProfileDraft = {
  name: string;
  courses: string[];
  /** "tue:evening" style keys, one per picked day + block. */
  blocks: string[];
  /** Saved slots that don't line up with a block; kept as they are. */
  otherSlots: Slot[];
  format: Format[];
  questionnaire: Questionnaire;
  bio: string;
};

export const BIO_MAX = 500;

export const blockKey = (day: string, block: Block) => `${day}:${block}`;

export function draftFrom(profile?: Profile & { questionnaire?: Questionnaire }): ProfileDraft {
  const blocks: string[] = [];
  const otherSlots: Slot[] = [];
  for (const slot of profile?.availability ?? []) {
    const block = (Object.keys(TIME_BLOCKS) as Block[]).find(
      (b) => TIME_BLOCKS[b].start === slot.start && TIME_BLOCKS[b].end === slot.end
    );
    if (block) blocks.push(blockKey(slot.day, block));
    else otherSlots.push(slot);
  }
  return {
    name: profile?.name ?? "",
    courses: profile?.courses ?? [],
    blocks,
    otherSlots,
    format: profile?.format ?? [],
    questionnaire: profile?.questionnaire ?? {},
    bio: profile?.bio ?? ""
  };
}

const toSlots = (draft: ProfileDraft): Slot[] => [
  ...draft.blocks.map((key) => {
    const [day, block] = key.split(":") as [string, Block];
    return { day, ...TIME_BLOCKS[block] };
  }),
  ...draft.otherSlots
];

/** The first thing missing from the form, worded for the user, or null. */
export function profileProblem(draft: ProfileDraft): string | null {
  if (!draft.name.trim()) return "Add your name.";
  if (draft.courses.length === 0) return "Pick at least one course.";
  if (draft.blocks.length + draft.otherSlots.length === 0) return "Pick at least one time you're free.";
  if (draft.format.length === 0) return "Pick online, in person, or both.";
  if (QUESTIONS.some((q) => !draft.questionnaire[q.key])) return "Answer all four questions about how you like to work.";
  return null;
}

const fields = (draft: ProfileDraft) => ({
  name: draft.name.trim(),
  courses: draft.courses,
  availability: toSlots(draft),
  format: draft.format,
  questionnaire: draft.questionnaire,
  bio: draft.bio.trim().slice(0, BIO_MAX)
});

// Rescoring is a nice-to-have here; the Matches tab rescans on open anyway.
const rescore = () => refreshMatches().catch((err) => console.warn(err));

export async function createProfile(role: Role, draft: ProfileDraft) {
  const user = auth.currentUser;
  if (!user?.email) throw new Error("You're signed out. Log in again.");
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    photoURL: null,
    role,
    onboardingComplete: true,
    rate: role === "tutor" ? 0 : null,
    createdAt: serverTimestamp(),
    ...fields(draft)
  });
  rescore();
}

export async function saveProfile(draft: ProfileDraft) {
  const user = auth.currentUser;
  if (!user) throw new Error("You're signed out. Log in again.");
  await updateDoc(doc(db, "users", user.uid), fields(draft));
  rescore();
}
