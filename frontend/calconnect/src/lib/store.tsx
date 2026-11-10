// Signed-in user plus their live matches and sessions, shared by every screen.
// Reads go straight to Firestore (the rules limit them to participants);
// scoring and booking go through the server (see api.ts).
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  addDoc, collection, doc, getDoc, limit, onSnapshot, orderBy, query, serverTimestamp,
  updateDoc, where, type DocumentData, type QueryDocumentSnapshot
} from "firebase/firestore";

import { refreshMatches } from "./api";
import { auth, db } from "./firebase";
import type { Match, Message, Profile, Session, SessionStatus } from "./types";

type Store = {
  ready: boolean;
  user: User | null;
  /** undefined while loading, null if the account has no profile yet. */
  profile: Profile | null | undefined;
  matches: Match[];
  sessions: Session[];
  people: Record<string, Profile>;
  error: string | null;
};

const empty: Store = { ready: false, user: null, profile: undefined, matches: [], sessions: [], people: {}, error: null };
const StoreContext = createContext<Store>(empty);

const toMatch = (d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() }) as Match;

const toSession = (d: QueryDocumentSnapshot<DocumentData>): Session => {
  const data = d.data();
  return { ...(data as Session), id: d.id, start: data.start.toDate(), end: data.end.toDate() };
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Store>(empty);
  const requested = useRef(new Set<string>());
  const uid = state.user?.uid;

  useEffect(
    () => onAuthStateChanged(auth, (user) => {
      requested.current.clear();
      setState({ ...empty, ready: true, user });
    }),
    []
  );

  useEffect(() => {
    if (!uid) return;
    const fail = (err: Error) => {
      if (!auth.currentUser) return; // listeners closing during sign-out
      console.warn(err);
      setState((s) => ({ ...s, error: "Lost the connection to the database. Is the Firebase emulator running?" }));
    };
    const unsubs = [
      onSnapshot(doc(db, "users", uid), (snap) => {
        setState((s) => ({ ...s, profile: snap.exists() ? (snap.data() as Profile) : null }));
      }, fail),
      onSnapshot(query(collection(db, "matches"), where("participants", "array-contains", uid)), (snap) => {
        setState((s) => ({ ...s, matches: snap.docs.map(toMatch) }));
      }, fail),
      onSnapshot(query(collection(db, "sessions"), where("participants", "array-contains", uid)), (snap) => {
        setState((s) => ({ ...s, sessions: snap.docs.map(toSession) }));
      }, fail)
    ];
    // Score matches as soon as someone signs in, so the dashboard has them.
    refreshMatches().catch((err) => console.warn(err));
    return () => unsubs.forEach((u) => u());
  }, [uid]);

  // Load the profile of everyone the user is matched with, once each.
  useEffect(() => {
    if (!uid) return;
    const missing = state.matches
      .flatMap((m) => m.participants)
      .filter((id) => id !== uid && !requested.current.has(id));
    for (const id of new Set(missing)) {
      requested.current.add(id);
      getDoc(doc(db, "users", id)).then((snap) => {
        if (snap.exists()) setState((s) => ({ ...s, people: { ...s.people, [id]: snap.data() as Profile } }));
      });
    }
  }, [uid, state.matches]);

  return <StoreContext.Provider value={state}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);

/** The other person in a match or session. */
export function useOther(item: { participants: string[] } | undefined) {
  const { user, people } = useStore();
  const id = item?.participants.find((p) => p !== user?.uid);
  return id ? people[id] : undefined;
}

/** Live messages for a match; `count` limits it to the most recent ones. */
export function useMessages(matchId: string | undefined, count?: number) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!matchId) return;
    const ref = collection(db, "matches", matchId, "messages");
    const q = count ? query(ref, orderBy("createdAt", "desc"), limit(count)) : query(ref, orderBy("createdAt"));
    let retry: ReturnType<typeof setTimeout> | undefined;
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data({ serverTimestamps: "estimate" });
        return { id: d.id, senderId: data.senderId, text: data.text, createdAt: data.createdAt?.toDate() ?? null };
      });
      setMessages(count ? list.reverse() : list);
    }, (err) => {
      if (!auth.currentUser) return; // closing during sign-out
      // Right after a match is accepted the rules can still see the old
      // status, so try again shortly.
      console.warn(err);
      if (attempt < 3) retry = setTimeout(() => setAttempt((a) => a + 1), 1500);
    });
    return () => { unsub(); clearTimeout(retry); };
  }, [matchId, count, attempt]);
  return messages;
}

// Writes the security rules allow from the client.

export const requestMatch = (matchId: string) =>
  updateDoc(doc(db, "matches", matchId), {
    status: "requested", requestedBy: auth.currentUser?.uid, updatedAt: serverTimestamp()
  });

export const answerMatch = (matchId: string, accept: boolean) =>
  updateDoc(doc(db, "matches", matchId), {
    status: accept ? "accepted" : "declined", updatedAt: serverTimestamp()
  });

export const setSessionStatus = (sessionId: string, status: SessionStatus) =>
  updateDoc(doc(db, "sessions", sessionId), { status });

export const sendMessage = (matchId: string, text: string) =>
  addDoc(collection(db, "matches", matchId, "messages"), {
    senderId: auth.currentUser?.uid, text, createdAt: serverTimestamp()
  });
