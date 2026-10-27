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
  console.log("UID:", auth.currentUser.uid);
  const isAdmin = await checkIsAdmin();
  console.log("Signed in. isAdmin =", isAdmin);

  // 1. Create standard test announcement
  const ref = await createAnnouncement({
    title: "Test Login",
    description: "Test Description",
    category: "general",
    site: "CalConnect.com",
    adminOnly: false,
  });
  console.log("Created standard announcement:", ref.id);

  // 2. Create test announcement with SendGrid email trigger enabled
  const emailRef = await createAnnouncement({
    title: "Live SendGrid Test",
    description: "Testing automated email notifications from CalConnect!",
    category: "general",
    site: "CalConnect.com",
    adminOnly: false,
    sendEmail: true,
    recipientId: auth.currentUser.uid // Using current admin UID (make sure their /users doc has an 'email' field)
  });
  console.log("Created email-triggered announcement:", emailRef.id);

  const all = await getAllAnnouncements({ isAdmin });
  console.log(`Read ${all.length} announcement(s):`, all);

  // Clean up test documents
  await deleteAnnouncement(ref.id);
  await deleteAnnouncement(emailRef.id);
  console.log("Deleted test announcements; Everything works.");
} catch (err) {
  console.error("FAILED:", err.code || "", err.message);
  process.exitCode = 1;
}
process.exit();