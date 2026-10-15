import { Router } from "express";
import { db, FieldValue } from "../firebase.js";
import { httpError } from "../http.js";
import { scorePair } from "../matching.js";

const TOP_N = 5;

const router = Router();

/**
 * Scores the caller against everyone onboarded on the other side and saves
 * the top matches as "suggested". Matches that already exist keep their
 * status; only their score and reasons are refreshed.
 */
router.post("/matches/refresh", async (req, res) => {
  const me = req.user;
  if (!me.onboardingComplete) throw httpError(400, "Finish onboarding to see matches.");

  const otherRole = me.role === "student" ? "tutor" : "student";
  const others = await db
    .collection("users")
    .where("role", "==", otherRole)
    .where("onboardingComplete", "==", true)
    .get();

  const ranked = others.docs
    .map((d) => d.data())
    .map((other) => {
      const [student, tutor] = me.role === "student" ? [me, other] : [other, me];
      return { other, student, tutor, ...scorePair(student, tutor) };
    })
    .filter((r) => r.courses.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N);

  const refs = ranked.map((r) => db.doc(`matches/${r.student.uid}_${r.tutor.uid}`));
  const existing = refs.length ? await db.getAll(...refs) : [];

  const batch = db.batch();
  const now = FieldValue.serverTimestamp();
  ranked.forEach((r, i) => {
    const fields = { score: r.score, reasons: r.reasons, courses: r.courses, updatedAt: now };
    if (existing[i].exists) {
      batch.update(refs[i], fields);
    } else {
      batch.set(refs[i], {
        studentId: r.student.uid,
        tutorId: r.tutor.uid,
        participants: [r.student.uid, r.tutor.uid],
        status: "suggested",
        requestedBy: null,
        createdAt: now,
        ...fields
      });
    }
  });
  await batch.commit();

  res.json({ count: ranked.length });
});

export default router;
