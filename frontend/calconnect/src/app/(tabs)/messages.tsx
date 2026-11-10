import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { TabHeader } from "@/components/TabHeader";
import { Avatar, Card, Empty, Txt } from "@/components/ui";
import { useMessages, useOther, useStore } from "@/lib/store";
import { colors } from "@/lib/theme";
import { timeAgo } from "@/lib/time";
import type { Match } from "@/lib/types";

export default function Messages() {
  const { matches } = useStore();
  const accepted = matches.filter((m) => m.status === "accepted");

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <TabHeader title="Messages" />
      {accepted.length === 0
        ? <Empty>Chats open once a match is accepted.</Empty>
        : <Card style={{ gap: 4, padding: 8 }}>{accepted.map((m) => <Thread key={m.id} match={m} />)}</Card>}
    </ScrollView>
  );
}

function Thread({ match }: { match: Match }) {
  const { user } = useStore();
  const other = useOther(match);
  const [last] = useMessages(match.id, 1);
  return (
    <Pressable style={styles.thread} onPress={() => router.push(`/chat/${match.id}`)}>
      <Avatar name={other?.name} size={48} />
      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.titleRow}>
          <Txt w="bold" size={16} color={colors.navy}>{other?.name ?? "…"}</Txt>
          {last && <Txt size={12} color={colors.muted}>{timeAgo(last.createdAt)}</Txt>}
        </View>
        <Txt size={14} color={colors.muted} numberOfLines={1}>
          {last ? `${last.senderId === user?.uid ? "You: " : ""}${last.text}` : `Matched on ${match.courses.join(", ")}. Say hi 👋`}
        </Txt>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 28, gap: 16 },
  thread: { flexDirection: "row", alignItems: "center", gap: 12, padding: 10 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }
});
