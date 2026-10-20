// Shapes of the Firestore documents (see the CalConnect data model spec).

export type Role = "student" | "tutor";
export type Format = "online" | "in-person";

export type Slot = { day: string; start: string; end: string };

export type Profile = {
  uid: string;
  email: string;
  name: string;
  role: Role;
  courses: string[];
  availability: Slot[];
  format: Format[];
  bio: string;
};

export type MatchStatus = "suggested" | "requested" | "accepted" | "declined";

export type Match = {
  id: string;
  studentId: string;
  tutorId: string;
  participants: string[];
  status: MatchStatus;
  requestedBy: string | null;
  score: number;
  reasons: string[];
  courses: string[];
};

export type SessionStatus = "proposed" | "confirmed" | "cancelled" | "completed";

export type Session = {
  id: string;
  matchId: string;
  studentId: string;
  tutorId: string;
  participants: string[];
  course: string;
  start: Date;
  end: Date;
  format: Format;
  location: string;
  notes: string;
  status: SessionStatus;
  proposedBy: string;
};

export type Message = { id: string; senderId: string; text: string; createdAt: Date | null };
