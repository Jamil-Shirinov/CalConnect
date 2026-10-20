import admin from "firebase-admin";
import {
  addFeedback,
  getFeedbackForSite,
  updateFeedbackStatus,
  type FeedbackInput,
  type FeedbackStatus,
} from "../feedback.js";

// Checks a user's login token with Firebase and returns true only if
// their token has the custom claim admin: true (same claim firestore.rules uses)
async function isAdminFromToken(idToken: string): Promise<boolean> {
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded.admin === true;
  } catch {
    return false; // bad or expired token = not an admin
  }
}

// 1. Student submits feedback
export async function renderStudentFeedbackForm(input: FeedbackInput) {
  if (!input.title.trim() || !input.description.trim()) {
    return { status: "error", message: "Title and description are required." };
  }
  const saved = await addFeedback(input);
  return { status: "submitted", feedback: saved };
}

// 2. Admin sees feedback for their site, plus general feedback
export async function renderAdminFeedbackQueue(site: string, idToken: string) {
  if (!(await isAdminFromToken(idToken))) {
    return { status: "error", message: "Admins only." };
  }
  const items = await getFeedbackForSite(site);
  return { status: "ready", items };
}

// 3. Open one feedback item; admins can also change its status
export async function openFeedbackDetails(
  feedback: { id: string; [key: string]: any },
  idToken: string,
  newStatus?: FeedbackStatus
) {
  const isAdmin = await isAdminFromToken(idToken);

  if (newStatus) {
    if (!isAdmin) {
      return { status: "error", message: "Only admins can update feedback." };
    }
    const updated = await updateFeedbackStatus(feedback.id, { status: newStatus });
    return { status: "updated", feedback: updated };
  }
  return { status: "ready", feedback, canUpdate: isAdmin };
}