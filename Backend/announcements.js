import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore, collection, addDoc, getDocs, deleteDoc,
  doc, query, orderBy, where, serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5h_LPb0OcSLb9q4O9XSFhpUSWPO91cxg",
  authDomain: "calconnect-1a99f.firebaseapp.com",
  projectId: "calconnect-1a99f",
  storageBucket: "calconnect-1a99f.firebasestorage.app",
  messagingSenderId: "96305781368",
  appId: "1:96305781368:web:34391cb5589980fedeeb8d",
  measurementId: "G-VK9THTML6C",
};

// If the frontend already calls initializeApp, import its app/auth/db
// here instead of creating a second copy.
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Placeholder list: the doc's category options were cut off. Edit these.
export const CATEGORIES = ["general", "event", "maintenance", "urgent"];

/**
 * Create an announcement. Admin only (enforced by Firestore rules).
 * The poster's userID comes from the signed-in user, not from the caller,
 * so nobody can post as someone else.
 *
 * Spec fields: title, description, category, site, adminOnly
 * (user and createdAt are filled in automatically).
 *
 * Optional email fields (used by the SendGrid Cloud Function):
 *   sendEmail   - true to email the student
 *   recipientId - userID of the student to email (required if sendEmail)
 */
export async function createAnnouncement({
  title,
  description,
  category,
  site,
  adminOnly = false,
  sendEmail = false,
  recipientId = null,
}) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("You must be signed in to post.");
  if (!title || !description || !site) {
    throw new Error("title, description, and site are required");
  }
  if (!CATEGORIES.includes(category)) {
    throw new Error(`category must be one of: ${CATEGORIES.join(", ")}`);
  }
  if (sendEmail && !recipientId) {
    throw new Error("recipientId is required when sendEmail is true");
  }

  return addDoc(collection(db, "announcements"), {
    title,
    description,
    category,
    user: currentUser.uid,
    site,
    adminOnly: Boolean(adminOnly),
    sendEmail: Boolean(sendEmail),
    recipientId: recipientId || null,
    createdAt: serverTimestamp(),
  });
}

/**
 * Returns announcements sorted newest first.
 *
 * Admins (isAdmin: true) get everything. Non-admins only query
 * adminOnly == false, because the security rules reject any query that
 * could return admin-only documents. (Sorting happens in JS for them so
 * no composite index is needed.)
 *
 * Announcements for site "TVS" are always included when filtering by site.
 */
export async function getAllAnnouncements({ isAdmin = false, site } = {}) {
  const col = collection(db, "announcements");
  const q = isAdmin
    ? query(col, orderBy("createdAt", "desc"))
    : query(col, where("adminOnly", "==", false));

  const snap = await getDocs(q);
  const millis = (a) => a.createdAt?.toMillis?.() ?? 0;

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((a) => !site || a.site === site || a.site === "TVS")
    .sort((a, b) => millis(b) - millis(a));
}

/** Delete an announcement by id. Admin only (enforced by Firestore rules). */
export async function deleteAnnouncement(id) {
  return deleteDoc(doc(db, "announcements", id));
}

/** Check whether the signed-in user is an admin (users/{uid}.isAdmin). */
export async function checkIsAdmin() {
  const currentUser = auth.currentUser;
  if (!currentUser) return false;
  const { getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(db, "users", currentUser.uid));
  return snap.exists() && snap.data().isAdmin === true;
}