import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { MatchCard } from "@/components/MatchCard";
import { TabHeader } from "@/components/TabHeader";
import { Banner, Empty, Txt } from "@/components/ui";
import { refreshMatches } from "@/lib/api";
import { useStore } from "@/lib/store";
import { colors } from "@/lib/theme";
import type { Match } from "@/lib/types";

// Requests waiting on me first, then active matches, then by score.
const rank = (uid: string | undefined) => (m: Match) =>
  m.status === "requested" && m.requestedBy !== uid ? 0
  : m.status === "accepted" ? 1
  : m.status === "declined" ? 4
  : m.status === "requested" ? 2
  : 3;

export default function Matches() {
  const { user, profile, matches } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rescore on open: new tutors/students and changed availability show up.
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshMatches();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  if (!profile) return null;
  const isStudent = profile.role === "student";
  const byRank = rank(user?.uid);
  const sorted = [...matches].sort((a, b) => byRank(a) - byRank(b) || b.score - a.score);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
    >
      <TabHeader
        title={isStudent ? "Your tutor matches" : "Your students"}
        subtitle="Ranked by shared courses, free time, format and learning style."
      />
      <Pressable onPress={refresh} style={styles.refresh} disabled={loading}>
        {loading
          ? <ActivityIndicator size="small" color={colors.navy} />
          : <Ionicons name="refresh" size={16} color={colors.navy} />}
        <Txt w="semibold" size={13} color={colors.navy}>{loading ? "Finding your best matches…" : "Refresh matches"}</Txt>
      </Pressable>

      {error && <Banner tone="error">{error}</Banner>}
      {!loading && sorted.length === 0 && (
        <Empty>No matches yet. Add more courses or free time to your profile.</Empty>
      )}
      <View style={styles.list}>
        {sorted.map((m) => <MatchCard key={m.id} match={m} />)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 28, gap: 14 },
  refresh: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", paddingVertical: 4 },
  list: { gap: 14 }
});
