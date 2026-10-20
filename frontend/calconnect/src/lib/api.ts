// Calls to the Express server (server/). It does the work the client can't be
// trusted with: scoring matches and the session conflict check.
import { auth } from "./firebase";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

async function post<T>(path: string, body?: unknown): Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body ?? {})
    });
  } catch {
    throw new Error("Can't reach the CalConnect server. Is it running?");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status}).`);
  return data as T;
}

export const refreshMatches = () => post<{ count: number }>("/matches/refresh");

export type NewSession = {
  matchId: string;
  course: string;
  start: string;
  end: string;
  format: "online" | "in-person";
  location: string;
  notes?: string;
};

export const bookSession = (session: NewSession) => post<{ id: string }>("/sessions", session);
