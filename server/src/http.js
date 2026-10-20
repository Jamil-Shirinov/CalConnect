import { auth, db } from "./firebase.js";

/** An error whose message is safe to show the user. */
export function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

/**
 * Checks the Firebase ID token in `Authorization: Bearer <token>` and loads
 * the caller's profile into req.uid / req.user.
 */
export async function requireUser(req, res, next) {
  const token = /^Bearer (.+)$/.exec(req.get("Authorization") ?? "")?.[1];
  if (!token) throw httpError(401, "Sign in first.");

  let decoded;
  try {
    decoded = await auth.verifyIdToken(token);
  } catch {
    throw httpError(401, "Your session expired. Sign in again.");
  }

  const profile = await db.doc(`users/${decoded.uid}`).get();
  if (!profile.exists) throw httpError(403, "Finish creating your profile first.");

  req.uid = decoded.uid;
  req.user = profile.data();
  next();
}

export function errorHandler(err, req, res, next) {
  if (!err.status) console.error(err);
  res.status(err.status ?? 500).json({ error: err.status ? err.message : "Something went wrong on the server. Try again." });
}
