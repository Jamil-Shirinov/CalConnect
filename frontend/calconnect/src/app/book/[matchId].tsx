import { useMemo, useState, type ReactNode } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { BackHeader } from "@/components/BackHeader";
import { Banner, Button, Card, Chip, Txt } from "@/components/ui";
import { bookSession } from "@/lib/api";
import { useOther, useStore } from "@/lib/store";
import { colors, fonts, radius } from "@/lib/theme";
import { berkeleyTime, formatRange, hourLabel, isFree, upcomingDays } from "@/lib/time";
import type { Format } from "@/lib/types";

const START_HOURS = Array.from({ length: 12 }, (_, i) => 9 + i); // 9 AM to 8 PM
const LENGTHS = [1, 1.5, 2];

export default function Book() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { matches, profile } = useStore();
  const match = matches.find((m) => m.id === matchId);
  const other = useOther(match);
  const days = useMemo(() => upcomingDays(7), []);

  const bothFree = (day: string, from: number, to: number) =>
    isFree(profile?.availability, day, from, to) && isFree(other?.availability, day, from, to);

  // Start on the first future hour you're both free, else tomorrow at 5 PM.
  const firstFree = useMemo(() => {
    for (const d of days) {
      for (const h of START_HOURS) {
        if (berkeleyTime(d.ymd, h) > new Date() && bothFree(d.code, h, h + 1)) return { ymd: d.ymd, hour: h };
      }
    }
    return { ymd: days[1].ymd, hour: 17 };
  }, [days, other, profile]);

  const sharedFormats = (profile?.format ?? []).filter((f) => other?.format?.includes(f));

  const [course, setCourse] = useState<string>();
  const [ymd, setYmd] = useState<string>();
  const [hour, setHour] = useState<number>();
  const [length, setLength] = useState(1);
  const [format, setFormat] = useState<Format>();
  const [location, setLocation] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  if (!match || !profile) {
    return (
      <View style={{ flex: 1 }}>
        <BackHeader title="Book a session" />
        <View style={{ padding: 20 }}><Banner tone="info">Loading this match…</Banner></View>
      </View>
    );
  }

  const chosen = {
    course: course ?? match.courses[0],
    ymd: ymd ?? firstFree.ymd,
    hour: hour ?? firstFree.hour,
    format: format ?? sharedFormats[0] ?? "online"
  };
  const place = location ?? (chosen.format === "online" ? "Zoom" : "");
  const start = berkeleyTime(chosen.ymd, chosen.hour);
  const end = berkeleyTime(chosen.ymd, chosen.hour + length);
  const day = days.find((d) => d.ymd === chosen.ymd)!;
  const firstName = other?.name.split(" ")[0] ?? "them";

  const book = async () => {
    setBusy(true);
    setError(null);
    try {
      await bookSession({
        matchId: match.id, course: chosen.course, start: start.toISOString(), end: end.toISOString(),
        format: chosen.format, location: place
      });
      setBooked(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // Any change after an error or success starts a fresh attempt.
  const pick = <T,>(set: (v: T) => void) => (v: T) => { set(v); setError(null); setBooked(false); };

  return (
    <View style={{ flex: 1 }}>
      <BackHeader title="Book a session" subtitle={other ? `with ${other.name}` : undefined} name={other?.name} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Section title="Course">
          {match.courses.map((c) => (
            <Chip key={c} label={c} selected={c === chosen.course} onPress={() => pick(setCourse)(c)} />
          ))}
        </Section>

        <Section title="Day">
          {days.map((d) => (
            <Chip
              key={d.ymd}
              label={d.label}
              selected={d.ymd === chosen.ymd}
              marked={START_HOURS.some((h) => bothFree(d.code, h, h + 1))}
              onPress={() => pick(setYmd)(d.ymd)}
            />
          ))}
        </Section>

        <Section title="Start time" hint="● you're both free">
          {START_HOURS.filter((h) => berkeleyTime(chosen.ymd, h) > new Date()).map((h) => (
            <Chip
              key={h}
              label={hourLabel(h)}
              selected={h === chosen.hour}
              marked={bothFree(day.code, h, h + length)}
              onPress={() => pick(setHour)(h)}
            />
          ))}
        </Section>

        <Section title="Length">
          {LENGTHS.map((l) => (
            <Chip key={l} label={`${l} h`} selected={l === length} onPress={() => pick(setLength)(l)} />
          ))}
        </Section>

        <Section title="Where">
          {(["online", "in-person"] as Format[]).map((f) => (
            <Chip
              key={f}
              label={f === "online" ? "Online" : "In person"}
              selected={f === chosen.format}
              marked={sharedFormats.includes(f)}
              onPress={() => { pick(setFormat)(f); setLocation(undefined); }}
            />
          ))}
        </Section>
        <TextInput
          style={styles.input}
          value={place}
          onChangeText={pick(setLocation)}
          placeholder={chosen.format === "online" ? "Zoom link" : "e.g. Moffitt Library, 4th floor"}
          placeholderTextColor={colors.muted}
        />

        <Card style={styles.summary}>
          <Txt w="semibold" size={12} color={colors.muted}>YOUR SESSION</Txt>
          <Txt w="bold" size={17} color={colors.navy}>{chosen.course} with {other?.name ?? "…"}</Txt>
          <Txt size={15}>{formatRange(start, end)}</Txt>
          <Txt size={14} color={colors.muted}>{chosen.format === "online" ? "Online" : "In person"}{place ? ` · ${place}` : ""}</Txt>
        </Card>

        {error && <Banner tone="error">{error}</Banner>}
        {booked ? (
          <>
            <Banner tone="success">Session proposed! {firstName} will get a request to confirm it.</Banner>
            <Button variant="navy" title="See my sessions" onPress={() => router.replace("/sessions")} />
          </>
        ) : (
          <Button title="Propose session" loading={busy} onPress={book} />
        )}
      </ScrollView>
    </View>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.sectionTitle}>
        <Txt w="bold" size={15} color={colors.navy}>{title}</Txt>
        {hint && <Txt size={12} color={colors.gold}>{hint}</Txt>}
      </View>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  sectionTitle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  input: {
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md,
    height: 48, paddingHorizontal: 14, fontFamily: fonts.regular, fontSize: 15, color: colors.ink, marginTop: -8
  },
  summary: { gap: 4, backgroundColor: "#FFF8DC" }
});
