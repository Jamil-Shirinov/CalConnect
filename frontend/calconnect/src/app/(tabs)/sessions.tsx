import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";

import { SessionCard } from "@/components/SessionCard";
import { TabHeader } from "@/components/TabHeader";
import { Button, Empty, Panel } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { Match } from "@/lib/types";

export default function Sessions() {
  const { sessions, matches, people, user } = useStore();
  const now = new Date();
  const active = (s: { status: string; end: Date }) => (s.status === "proposed" || s.status === "confirmed") && s.end > now;
  const upcoming = sessions.filter(active).sort((a, b) => a.start.getTime() - b.start.getTime());
  const past = sessions.filter((s) => !active(s)).sort((a, b) => b.start.getTime() - a.start.getTime());
  const accepted = matches.filter((m) => m.status === "accepted");
  const firstName = (m: Match) => people[m.participants.find((p) => p !== user?.uid) ?? ""]?.name.split(" ")[0] ?? "…";

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <TabHeader title="Sessions" subtitle="All times are Berkeley time." />

      {accepted.length > 0 && (
        <View style={styles.bookRow}>
          {accepted.map((m) => (
            <Button key={m.id} small variant="navy" title={`Book with ${firstName(m)}`} onPress={() => router.push(`/book/${m.id}`)} />
          ))}
        </View>
      )}

      <Panel title="Upcoming">
        {upcoming.length === 0
          ? <Empty>Nothing booked yet.</Empty>
          : upcoming.map((s) => <SessionCard key={s.id} session={s} actions />)}
      </Panel>

      {past.length > 0 && (
        <Panel title="Past & cancelled">
          {past.map((s) => <SessionCard key={s.id} session={s} />)}
        </Panel>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 28, gap: 16 },
  bookRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 }
});
