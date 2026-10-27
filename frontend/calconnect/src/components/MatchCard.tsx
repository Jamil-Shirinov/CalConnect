import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { answerMatch, requestMatch, useOther, useStore } from "@/lib/store";
import { colors, radius } from "@/lib/theme";
import type { Match } from "@/lib/types";
import { Avatar, Banner, Button, Card, Pill, Txt } from "./ui";

export function MatchCard({ match }: { match: Match }) {
  const { user } = useStore();
  const other = useOther(match);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstName = other?.name.split(" ")[0] ?? "them";

  const run = (action: () => Promise<unknown>) => async () => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      console.warn(err);
      setError("That didn't go through. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const sentByMe = match.requestedBy === user?.uid;
  // The server words reasons for the student ("Teaches 61A"); flip them for tutors.
  const reasons = other?.role === "student"
    ? match.reasons.map((r) => r.replace(/^Teaches /, "Needs help with "))
    : match.reasons;

  return (
    <Card style={match.status === "declined" && { opacity: 0.55 }}>
      <View style={styles.top}>
        <Avatar name={other?.name} size={52} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt w="bold" size={18} color={colors.navy}>{other?.name ?? " "}</Txt>
          <Txt size={13} color={colors.muted}>
            {other?.role === "tutor" ? "Tutor" : "Student"} · {match.courses.join(", ")}
          </Txt>
        </View>
        <View style={styles.score}>
          <Txt w="black" size={18} color={colors.navy}>{Math.round(match.score * 100)}%</Txt>
          <Txt w="semibold" size={10} color={colors.navy}>MATCH</Txt>
        </View>
      </View>

      <View style={styles.reasons}>
        {reasons.map((r) => (
          <View key={r} style={styles.reason}>
            <Ionicons name="checkmark-circle" size={17} color={colors.gold} />
            <Txt size={14} style={{ flex: 1 }}>{r}</Txt>
          </View>
        ))}
      </View>

      {other?.bio ? <Txt size={13} color={colors.muted} numberOfLines={2}>“{other.bio}”</Txt> : null}

      <View style={styles.actions}>
        {match.status === "suggested" && (
          <Button small title={`Request ${firstName}`} loading={busy} onPress={run(() => requestMatch(match.id))} />
        )}
        {match.status === "requested" && sentByMe && <Pill label={`Request sent · waiting for ${firstName}`} />}
        {match.status === "requested" && !sentByMe && (
          <>
            <Pill label={`${firstName} wants to work with you`} tone="sky" />
            <View style={styles.row}>
              <Button small title="Accept" loading={busy} onPress={run(() => answerMatch(match.id, true))} />
              <Button small variant="outline" title="Decline" disabled={busy} onPress={run(() => answerMatch(match.id, false))} />
            </View>
          </>
        )}
        {match.status === "accepted" && (
          <View style={styles.row}>
            <Button small variant="navy" title="Book a session" onPress={() => router.push(`/book/${match.id}`)} />
            <Button small variant="outline" title="Message" onPress={() => router.push(`/chat/${match.id}`)} />
          </View>
        )}
        {match.status === "declined" && <Pill label="Declined" tone="grey" />}
      </View>
      {error && <Banner tone="error">{error}</Banner>}
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  score: {
    width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.cream,
    alignItems: "center", justifyContent: "center"
  },
  reasons: { gap: 6, marginTop: 14, marginBottom: 10 },
  reason: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  actions: { marginTop: 12, gap: 10 },
  row: { flexDirection: "row", gap: 10, flexWrap: "wrap" }
});
