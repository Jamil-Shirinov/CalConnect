import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID ?? "calconnect-1a99f";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId,
  });
}

const db = admin.firestore();

export async function addFeedbackToCollection({
  title,
  description,
  category,
  userId,
  site,
  type = "general",
  isAnonymous = true,
}) {
  const feedback = {
    title,
    description,
    category,
    userId,
    site,
    type,
    status: "pending",
    isCompleted: false,
    isAnonymous,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await db.collection("feedback").add(feedback);
  return { id: docRef.id, ...feedback };
}

async function main() {
  const result = await addFeedbackToCollection({
    title: "Login issue during registration",
    description: "Students are unable to complete sign-up when using Safari on iPhone.",
    category: "bug",
    userId: "student_123",
    site: "general",
    type: "general",
    isAnonymous: true,
  });

  console.log("Feedback added:", result);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Failed to add feedback:", error);
    process.exit(1);
  });
}
