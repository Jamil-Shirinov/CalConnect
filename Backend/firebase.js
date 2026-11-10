// The one place the Firebase client SDK is set up. Feature files import
// { auth, db } from here instead of calling initializeApp themselves.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Web config is public by design; the security rules protect the data.
const firebaseConfig = {
  apiKey: "AIzaSyB5h_LPb0OcSLb9q4O9XSFhpUSWPO91cxg",
  authDomain: "calconnect-1a99f.firebaseapp.com",
  projectId: "calconnect-1a99f",
  storageBucket: "calconnect-1a99f.firebasestorage.app",
  messagingSenderId: "96305781368",
  appId: "1:96305781368:web:34391cb5589980fedeeb8d"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// `firebase emulators:start` / `emulators:exec` set these, so local runs
// never touch the real project.
const env = typeof process !== "undefined" ? process.env : {};
if (env.FIREBASE_AUTH_EMULATOR_HOST) {
  connectAuthEmulator(auth, `http://${env.FIREBASE_AUTH_EMULATOR_HOST}`, {
    disableWarnings: true
  });
}
if (env.FIRESTORE_EMULATOR_HOST) {
  const [host, port] = env.FIRESTORE_EMULATOR_HOST.split(":");
  connectFirestoreEmulator(db, host, Number(port));
}

export { app, auth, db };
