import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { setSessionStatus, useOther, useStore } from "@/lib/store";
import { colors, radius } from "@/lib/theme";
import { formatTime, formatDay, monthDay } from "@/lib/time";
import type { Session, SessionStatus } from "@/lib/types";
import { Banner, Button, Pill, Txt } from "./ui";

export function SessionCard({ session, actions }: { session: Session; actions?: boolean }) {
  const { user } = useStore();
  const other = useOther(session);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const { month, day } = monthDay(session.start);
  const firstName = other?.name.split(" ")[0] ?? "them";
  const proposedByMe = session.proposedBy === user?.uid;

  const change = (status: SessionStatus) => async () => {
    setBusy(true);
    setError(null);
    try {
      await setSessionStatus(session.id, status);
    } catch (err) {
      console.warn(err);
      setError(status === "cancelled" ? "Couldn't cancel the session. Try again." : "Couldn't confirm the session. Try again.");
    } finally {
      setBusy(false);
      setConfirmingCancel(false);
    }
  };

  const pill =
    session.status === "confirmed" ? <Pill label="Confirmed" tone="green" />
    : session.status === "proposed" ? <Pill label={proposedByMe ? `Waiting for ${firstName}` : "Needs your OK"} tone="sky" />
    : <Pill label={session.status === "cancelled" ? "Cancelled" : "Completed"} tone="grey" />;

  return (
    <View style={styles.row}>
      <View style={styles.date}>
        <Txt w="bold" size={11} color={colors.navy}>{month}</Txt>
        <Txt w="black" size={22} color={colors.navy}>{day}</Txt>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Txt w="bold" size={15} color={colors.navy}>{session.course} with {other?.name ?? "…"}</Txt>
        <Txt size={13} color={colors.muted}>
          {formatDay(session.start)} · {formatTime(session.start)}–{formatTime(session.end)}
        </Txt>
        <Txt size={13} color={colors.muted}>
          {session.format === "online" ? "Online" : "In person"}{session.location ? ` · ${session.location}` : ""}
        </Txt>
        <View style={{ marginTop: 4 }}>{pill}</View>
        {actions && (session.status === "proposed" || session.status === "confirmed") && (
          <View style={styles.actions}>
            {session.status === "proposed" && !proposedByMe && (
              <Button small title="Confirm" loading={busy} onPress={change("confirmed")} />
            )}
            {confirmingCancel ? (
              <>
                <Txt size={13} color={colors.ink}>Cancel this session?</Txt>
                <Pressable onPress={change("cancelled")} disabled={busy} style={styles.cancel}>
                  <Txt w="semibold" size={13} color={colors.danger}>Yes, cancel</Txt>
                </Pressable>
                <Pressable onPress={() => setConfirmingCancel(false)} disabled={busy} style={styles.cancel}>
                  <Txt w="semibold" size={13} color={colors.navy}>Keep it</Txt>
                </Pressable>
              </>
            ) : (
              <Pressable onPress={() => setConfirmingCancel(true)} disabled={busy} style={styles.cancel}>
                <Txt w="semibold" size={13} color={colors.danger}>Cancel session</Txt>
              </Pressable>
            )}
          </View>
        )}
        {error && <View style={{ marginTop: 8 }}><Banner tone="error">{error}</Banner></View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 14 },
  date: {
    width: 54, height: 58, borderRadius: radius.md, backgroundColor: colors.cream,
    alignItems: "center", justifyContent: "center"
  },
  actions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 14, marginTop: 8 },
  cancel: { paddingVertical: 8 }
});
