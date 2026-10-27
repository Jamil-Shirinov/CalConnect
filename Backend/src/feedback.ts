import { db } from "./firebase.js";

export type FeedbackType = "general" | "site" | "request";
export type FeedbackStatus = "pending" | "reviewing" | "completed";

export interface FeedbackInput {
  title: string;
  description: string;
  category: string;
  userId: string;
  site: string;
  type?: FeedbackType;
  isAnonymous?: boolean;
}

export interface FeedbackRecord extends FeedbackInput {
  id: string;
  status: FeedbackStatus;
  isCompleted: boolean;
  createdAt: Date;
}

export function buildFeedbackPayload(input: FeedbackInput): Omit<FeedbackRecord, "id"> {
  return {
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category.trim(),
    userId: input.userId,
    site: input.site.trim(),
    type: input.type ?? "general",
    isAnonymous: input.isAnonymous ?? true,
    status: "pending",
    isCompleted: false,
    createdAt: new Date(),
  };
}

export async function addFeedback(input: FeedbackInput) {
  const feedback = buildFeedbackPayload(input);

  const docRef = await db.collection("feedback").add({
    ...feedback,
    createdAt: new Date(),
  });

  const saved = await docRef.get();
  return { id: docRef.id, ...saved.data() } as FeedbackRecord;
}

export async function getFeedbackByUser(userId: string) {
  const snapshot = await db.collection("feedback").where("userId", "==", userId).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getFeedbackForSite(site: string) {
  const snapshot = await db.collection("feedback")
    .where("site", "in", [site, "general"])
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updateFeedbackStatus(
  feedbackId: string,
  updates: Partial<Pick<FeedbackRecord, "status" | "isCompleted" | "category">
  >
) {
  const payload = {
    ...updates,
    ...(updates.status ? { isCompleted: updates.status === "completed" } : {}),
  };

  await db.collection("feedback").doc(feedbackId).update(payload);

  const doc = await db.collection("feedback").doc(feedbackId).get();
  return { id: doc.id, ...doc.data() };
}
