import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";

// With FIRESTORE_EMULATOR_HOST set (see .env), the Admin SDK talks to the
// local emulators and needs no credentials. Against the real project it
// reads the service account key from GOOGLE_APPLICATION_CREDENTIALS.
export const usingEmulators = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

const app =
  getApps()[0] ??
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
    ...(usingEmulators ? {} : { credential: applicationDefault() })
  });

export const auth = getAuth(app);
export const db = getFirestore(app);
export { FieldValue, Timestamp };
