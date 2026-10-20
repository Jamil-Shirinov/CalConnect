// The one place the Firebase client SDK is set up. Screens import { auth, db }
// from here instead of calling initializeApp themselves.
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

// Local emulators by default, so a dev run never touches the real project.
// Set EXPO_PUBLIC_USE_EMULATORS=false to use the real Firebase project.
export const usingEmulators = process.env.EXPO_PUBLIC_USE_EMULATORS !== "false";
const emulatorHost = process.env.EXPO_PUBLIC_EMULATOR_HOST ?? "127.0.0.1";

const firstLoad = getApps().length === 0;
const app = firstLoad ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

if (usingEmulators && firstLoad) {
  connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, emulatorHost, 8080);
}
