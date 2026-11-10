import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { setSessionStatus, useOther, useStore } from "@/lib/store";
import { colors, radius } from "@/lib/theme";
import { formatTime, formatDay, monthDay } from "@/lib/time";
import type { Session, SessionStatus } from "@/lib/types";
import { Button, Pill, Txt } from "./ui";

export function SessionCard({ session, actions }: { session: Session; actions?: boolean }) {
  const { user } = useStore();
  const other = useOther(session);
  const [busy, setBusy] = useState(false);
  const { month, day } = monthDay(session.start);
  const firstName = other?.name.split(" ")[0] ?? "them";
  const proposedByMe = session.proposedBy === user?.uid;

  const change = (status: SessionStatus) => async () => {
    setBusy(true);
    try {
      await setSessionStatus(session.id, status);
    } catch (err) {
      console.warn(err);
    } finally {
      setBusy(false);
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
            <Pressable onPress={change("cancelled")} disabled={busy} style={styles.cancel}>
              <Txt w="semibold" size={13} color={colors.danger}>Cancel session</Txt>
            </Pressable>
          </View>
        )}
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
  actions: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 8 },
  cancel: { paddingVertical: 8 }
});
