import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router, type Href } from "expo-router";

import { SessionCard } from "@/components/SessionCard";
import { TabHeader } from "@/components/TabHeader";
import { Avatar, Empty, Panel, Txt } from "@/components/ui";
import { useMessages, useOther, useStore } from "@/lib/store";
import { colors, radius } from "@/lib/theme";
import { timeAgo } from "@/lib/time";
import type { Match } from "@/lib/types";

export default function Home() {
  const { user, profile, matches, sessions } = useStore();
  if (!profile) return null;

  const isStudent = profile.role === "student";
  const now = new Date();
  const upcoming = sessions
    .filter((s) => (s.status === "proposed" || s.status === "confirmed") && s.end > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  const accepted = matches.filter((m) => m.status === "accepted");
  const live = matches.filter((m) => m.status !== "declined");
  const incoming = matches.filter((m) => m.status === "requested" && m.requestedBy !== user?.uid);
  const outgoing = matches.filter((m) => m.status === "requested" && m.requestedBy === user?.uid);

  // The four coloured tiles from the dashboard mockup.
  const tiles: { label: string; value: number; bg: string; fg: string; href: Href }[] = [
    { label: isStudent ? "Tutor matches" : "Student matches", value: live.length, bg: colors.cream, fg: colors.navy, href: "/matches" },
    { label: "Upcoming sessions", value: upcoming.length, bg: colors.navy, fg: colors.white, href: "/sessions" },
    isStudent
      ? { label: "Requests sent", value: outgoing.length, bg: colors.gold, fg: colors.white, href: "/matches" }
      : { label: "Requests to answer", value: incoming.length, bg: colors.gold, fg: colors.white, href: "/matches" },
    { label: isStudent ? "Working with you" : "Your students", value: accepted.length, bg: colors.sky, fg: colors.navy, href: "/messages" }
  ];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <TabHeader
        title={<>Welcome back, <Txt w="black" size={24} color={colors.navy}>{profile.name.split(" ")[0]}!</Txt></>}
        subtitle={`${isStudent ? "Student" : "Tutor"} · ${profile.courses.join(", ")}`}
      />

      <View style={styles.tiles}>
        {tiles.map((t) => (
          <Pressable key={t.label} style={[styles.tile, { backgroundColor: t.bg }]} onPress={() => router.navigate(t.href)}>
            <Txt w="black" size={34} color={t.fg}>{t.value}</Txt>
            <Txt w="semibold" size={13} color={t.fg}>{t.label}</Txt>
          </Pressable>
        ))}
      </View>

      <Panel title="Upcoming Sessions">
        {upcoming.length === 0
          ? <Empty>No sessions yet. {accepted.length ? "Book one from your matches." : "Request a match to get started."}</Empty>
          : upcoming.slice(0, 3).map((s) => <SessionCard key={s.id} session={s} />)}
      </Panel>

      <Panel title="Recent Messages">
        {accepted.length === 0
          ? <Empty>Chats open once a match is accepted.</Empty>
          : accepted.map((m) => <LastMessage key={m.id} match={m} />)}
      </Panel>
    </ScrollView>
  );
}

function LastMessage({ match }: { match: Match }) {
  const { user } = useStore();
  const other = useOther(match);
  const [last] = useMessages(match.id, 1);
  return (
    <Pressable style={styles.message} onPress={() => router.push(`/chat/${match.id}`)}>
      <Avatar name={other?.name} size={40} />
      <View style={{ flex: 1 }}>
        <Txt w="bold" size={15} color={colors.navy}>{other?.name ?? "…"}</Txt>
        <Txt size={13} color={colors.muted} numberOfLines={1}>
          {last ? `${last.senderId === user?.uid ? "You: " : ""}${last.text}` : "Say hi 👋"}
        </Txt>
      </View>
      {last && <Txt size={12} color={colors.muted}>{timeAgo(last.createdAt)}</Txt>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 28, gap: 18 },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { flexBasis: "47%", flexGrow: 1, height: 96, borderRadius: radius.lg, padding: 14, justifyContent: "space-between" },
  message: { flexDirection: "row", alignItems: "center", gap: 12 }
});
