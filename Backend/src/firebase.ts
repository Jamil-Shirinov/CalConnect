import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID ?? "calconnect-1a99f",
  });
}

export const db = admin.firestore();
