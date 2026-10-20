import { db } from "./firebase.js";

export function buildFeedbackPayload(input) {
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

export async function addFeedback(input) {
  const feedback = buildFeedbackPayload(input);
  const docRef = await db.collection("feedback").add({
    ...feedback,
    createdAt: new Date(),
  });

  const snapshot = await docRef.get();
  return { id: docRef.id, ...snapshot.data() };
}

export async function getFeedbackForSite(site) {
  const snapshot = await db.collection("feedback")
    .where("site", "in", [site, "general"])
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updateFeedbackStatus(feedbackId, updates) {
  const payload = {
    ...updates,
    ...(updates.status ? { isCompleted: updates.status === "completed" } : {}),
  };

  await db.collection("feedback").doc(feedbackId).update(payload);
  const doc = await db.collection("feedback").doc(feedbackId).get();
  return { id: doc.id, ...doc.data() };
}
