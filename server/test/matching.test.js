import { test } from "node:test";
import assert from "node:assert/strict";
import { scorePair, availabilityOverlap } from "../src/matching.js";

const evening = (day) => ({ day, start: "17:00", end: "21:00" });

const student = {
  courses: ["COMPSCI 61A", "MATH 54"],
  availability: [evening("tue"), evening("thu")],
  format: ["online"],
  questionnaire: { pace: "steady", style: "practice", structure: "flexible", feedback: "direct" }
};

test("no shared course means no match", () => {
  const result = scorePair(student, { ...student, courses: ["CHEM 1A"] });
  assert.equal(result.score, 0);
  assert.deepEqual(result.reasons, []);
});

test("a perfect fit scores 1 and explains why", () => {
  const result = scorePair(student, { ...student });
  assert.equal(result.score, 1);
  assert.deepEqual(result.courses, ["COMPSCI 61A", "MATH 54"]);
  assert.match(result.reasons[0], /Teaches COMPSCI 61A and MATH 54/);
  assert.match(result.reasons[1], /8 hours of shared free time \(Tue and Thu\)/);
});

test("better overlap ranks higher", () => {
  const close = scorePair(student, { ...student, courses: ["COMPSCI 61A"] });
  const far = scorePair(student, {
    ...student, courses: ["COMPSCI 61A"], availability: [evening("sat")], format: ["in-person"], questionnaire: {}
  });
  assert.ok(close.score > far.score);
  assert.ok(far.reasons.includes("No shared free time yet"));
});

test("partial availability overlap is counted in hours", () => {
  const overlap = availabilityOverlap(
    [{ day: "mon", start: "09:00", end: "12:00" }],
    [{ day: "mon", start: "11:00", end: "17:00" }]
  );
  assert.deepEqual(overlap, { hours: 1, days: ["mon"] });
});
