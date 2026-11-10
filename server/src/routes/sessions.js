import { Router } from "express";
import { db, FieldValue, Timestamp } from "../firebase.js";
import { httpError } from "../http.js";

const MAX_LENGTH_MS = 4 * 60 * 60 * 1000;
const ACTIVE = ["proposed", "confirmed"];

const formatTime = (ms) =>
  new Date(ms).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
  });

const router = Router();

/**
 * Proposes a session for an accepted match. The overlap check and the write
 * run in one transaction, so two bookings at the same moment can't both win.
 */
router.post("/sessions", async (req, res) => {
  const { matchId, course, start, end, format, location = "", notes = "" } = req.body ?? {};
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);

  if (!matchId || Number.isNaN(startMs) || Number.isNaN(endMs)) {
    throw httpError(400, "Choose a match, a start time and an end time.");
  }
  if (endMs <= startMs) throw httpError(400, "The session has to end after it starts.");
  if (startMs < Date.now()) throw httpError(400, "Pick a time in the future.");
  if (endMs - startMs > MAX_LENGTH_MS) throw httpError(400, "Sessions can be at most 4 hours long.");
  if (!["online", "in-person"].includes(format)) throw httpError(400, "Choose online or in-person.");

  const matchRef = db.doc(`matches/${matchId}`);

  const id = await db.runTransaction(async (tx) => {
    const matchSnap = await tx.get(matchRef);
    const match = matchSnap.data();
    if (!matchSnap.exists || !match.participants.includes(req.uid)) throw httpError(404, "That match doesn't exist.");
    if (match.status !== "accepted") throw httpError(409, "You can only book sessions after the match is accepted.");
    if (course && !match.courses.includes(course)) throw httpError(400, "Pick one of the courses you matched on.");

    const busy = await tx.get(
      db.collection("sessions").where("participants", "array-contains-any", match.participants)
    );
    const clash = busy.docs
      .map((d) => d.data())
      .find((s) => ACTIVE.includes(s.status) && s.start.toMillis() < endMs && startMs < s.end.toMillis());
    if (clash) {
      const who = clash.participants.includes(req.uid)
        ? "You already have"
        : `Your ${req.user.role === "student" ? "tutor" : "student"} already has`;
      throw httpError(409, `${who} a session at that time (${formatTime(clash.start.toMillis())}).`);
    }

    const ref = db.collection("sessions").doc();
    tx.set(ref, {
      matchId,
      studentId: match.studentId,
      tutorId: match.tutorId,
      participants: match.participants,
      course: course ?? match.courses[0],
      start: Timestamp.fromMillis(startMs),
      end: Timestamp.fromMillis(endMs),
      format,
      location: String(location).slice(0, 200),
      notes: String(notes).slice(0, 1000),
      status: "proposed",
      proposedBy: req.uid,
      createdAt: FieldValue.serverTimestamp()
    });
    return ref.id;
  });

  res.status(201).json({ id });
});

export default router;
