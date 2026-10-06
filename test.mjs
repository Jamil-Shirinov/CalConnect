// Run with an ADMIN account's login:
//   TEST_EMAIL=you@example.com TEST_PASSWORD=yourpassword node test.mjs
// The account must exist in Firebase Authentication, and its document
// users/{uid} must have isAdmin: true.
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  auth, createAnnouncement, getAllAnnouncements, deleteAnnouncement, checkIsAdmin,
} from "./announcements.js";

const { TEST_EMAIL, TEST_PASSWORD } = process.env;
if (!TEST_EMAIL || !TEST_PASSWORD) {
  console.error("Set TEST_EMAIL and TEST_PASSWORD first (see top of file).");
  process.exit(1);
}

try {
  await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
  const isAdmin = await checkIsAdmin();
  console.log("Signed in. isAdmin =", isAdmin);

  const ref = await createAnnouncement({
    title: "Test",
    description: "Hello from the test script",
    category: "general",
    site: "TVS",
    adminOnly: false,
  });
  console.log("Created:", ref.id);

  const all = await getAllAnnouncements({ isAdmin });
  console.log(`Read ${all.length} announcement(s):`, all);

  await deleteAnnouncement(ref.id);
  console.log("Deleted test announcement. Everything works.");
} catch (err) {
  console.error("FAILED:", err.code || "", err.message);
  process.exitCode = 1;
}
process.exit();