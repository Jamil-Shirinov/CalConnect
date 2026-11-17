// The profile fields shared by onboarding and the Profile tab. The parent
// owns the draft and the save button.
import type { ReactNode } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { BLOCK_LABELS, COURSES, DAYS, DAY_LABELS, QUESTIONS, TIME_BLOCKS, questionText, type Block } from "@/lib/catalog";
import { BIO_MAX, blockKey, type ProfileDraft } from "@/lib/profile";
import { colors, fonts, radius } from "@/lib/theme";
import type { Format, Role } from "@/lib/types";
import { Chip, Txt } from "./ui";

const BLOCKS = Object.keys(TIME_BLOCKS) as Block[];
const FORMATS: { value: Format; label: string }[] = [
  { value: "online", label: "Online" },
  { value: "in-person", label: "In person" }
];

const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

export function ProfileForm({ draft, onChange, role }: {
  draft: ProfileDraft;
  onChange: (draft: ProfileDraft) => void;
  role: Role;
}) {
  const set = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => onChange({ ...draft, [key]: value });
  const isTutor = role === "tutor";

  return (
    <View style={styles.form}>
      <Section title="Your name">
        <TextInput
          style={styles.input}
          value={draft.name}
          onChangeText={(t) => set("name", t)}
          placeholder="First and last name"
          placeholderTextColor={colors.muted}
          autoComplete="name"
        />
      </Section>

      <Section title={isTutor ? "Courses you can tutor" : "Courses you want help with"}>
        <View style={styles.chips}>
          {COURSES.map((c) => (
            <Chip key={c} label={c} selected={draft.courses.includes(c)} onPress={() => set("courses", toggle(draft.courses, c))} />
          ))}
        </View>
      </Section>

      <Section title="When you're free" hint="Every week, Berkeley time">
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <View style={styles.dayCell} />
            {BLOCKS.map((b) => (
              <Txt key={b} w="semibold" size={12} color={colors.muted} style={styles.blockHead}>{BLOCK_LABELS[b]}</Txt>
            ))}
          </View>
          {DAYS.map((day) => (
            <View key={day} style={styles.gridRow}>
              <Txt w="semibold" size={14} color={colors.navy} style={styles.dayCell}>{DAY_LABELS[day]}</Txt>
              {BLOCKS.map((b) => {
                const key = blockKey(day, b);
                const on = draft.blocks.includes(key);
                return (
                  <Pressable
                    key={b}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={`${DAY_LABELS[day]} ${BLOCK_LABELS[b]}`}
                    onPress={() => set("blocks", toggle(draft.blocks, key))}
                    style={[styles.slot, on && styles.slotOn]}
                  />
                );
              })}
            </View>
          ))}
        </View>
        <Txt size={12} color={colors.muted}>Morning 9–12 · Afternoon 12–5 · Evening 5–9</Txt>
      </Section>

      <Section title="How you'd like to meet">
        <View style={styles.chips}>
          {FORMATS.map((f) => (
            <Chip key={f.value} label={f.label} selected={draft.format.includes(f.value)} onPress={() => set("format", toggle(draft.format, f.value))} />
          ))}
        </View>
      </Section>

      {QUESTIONS.map((q) => (
        <Section key={q.key} title={questionText(q, role)}>
          <View style={styles.chips}>
            {Object.entries(q.options).map(([value, label]) => (
              <Chip
                key={value}
                label={label}
                selected={draft.questionnaire[q.key] === value}
                onPress={() => set("questionnaire", { ...draft.questionnaire, [q.key]: value })}
              />
            ))}
          </View>
        </Section>
      ))}

      <Section title="About you" hint={`${draft.bio.length}/${BIO_MAX}`}>
        <TextInput
          style={[styles.input, styles.bio]}
          value={draft.bio}
          onChangeText={(t) => set("bio", t.slice(0, BIO_MAX))}
          placeholder={isTutor ? "What you like to teach and how you run sessions" : "What you're taking and where you get stuck"}
          placeholderTextColor={colors.muted}
          multiline
        />
      </Section>
    </View>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.sectionTitle}>
        <Txt w="bold" size={15} color={colors.navy} style={{ flex: 1 }}>{title}</Txt>
        {hint && <Txt size={12} color={colors.muted}>{hint}</Txt>}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 22 },
  sectionTitle: { flexDirection: "row", alignItems: "center", gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  input: {
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md,
    minHeight: 48, paddingHorizontal: 14, fontFamily: fonts.regular, fontSize: 15, color: colors.ink
  },
  bio: { minHeight: 96, paddingTop: 12, textAlignVertical: "top" },
  grid: { gap: 6 },
  gridRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dayCell: { width: 44 },
  blockHead: { flex: 1, textAlign: "center" },
  slot: {
    flex: 1, height: 34, borderRadius: radius.sm,
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line
  },
  slotOn: { backgroundColor: colors.navy, borderColor: colors.navy }
});
