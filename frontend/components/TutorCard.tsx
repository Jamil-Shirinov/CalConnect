import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Tutor } from '../data/mock';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { Button } from './Button';

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress(): void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

export function TutorCard({
  tutor,
  onRequest,
  today,
}: {
  tutor: Tutor;
  onRequest?(date: string, course: string): void;
  today: string;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [course, setCourse] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const dates = tutor.availableDates.filter((d) => d >= today);

  const send = () => {
    if (!course || !date || !onRequest) return;
    onRequest(date, course);
    setOpen(false);
    setSent(true);
    setCourse(null);
    setDate(null);
  };

  return (
    <View testID="tutor-card" style={styles.card}>
      <View style={styles.top}>
        <Text testID="tutor-name" style={styles.name}>{tutor.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{`${tutor.matchScore}/10`}</Text>
        </View>
      </View>
      <Text style={styles.line}>{tutor.major}</Text>
      <Text style={styles.line}>{tutor.coursesTaught.join(', ')}</Text>
      <Text style={styles.line}>{`$${tutor.rate}/hr`}</Text>
      <Text style={styles.line}>{tutor.mode}</Text>
      <Text style={styles.line}>{tutor.location}</Text>
      <Text style={styles.line}>{tutor.availability.join(', ')}</Text>
      {onRequest ? (
        <View style={styles.actions}>
          <Button title="Request session" variant="navy" onPress={() => { setOpen(!open); setSent(false); }} />
          {open ? (
            <View style={styles.picker}>
              <View style={styles.chips}>
                {tutor.coursesTaught.map((c) => (
                  <Chip key={c} label={c} selected={course === c} onPress={() => setCourse(c)} />
                ))}
              </View>
              <View style={styles.chips}>
                {dates.map((d) => (
                  <Chip key={d} label={d} selected={date === d} onPress={() => setDate(d)} />
                ))}
              </View>
              <Button title="Send request" onPress={send} />
            </View>
          ) : null}
          {sent ? <Text style={styles.sent}>Request sent</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.grey, borderRadius: spacing.sm, padding: spacing.lg, marginBottom: spacing.lg },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontFamily: fonts.bold, fontSize: 18, color: colors.navy },
  badge: { backgroundColor: colors.gold, borderRadius: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  badgeText: { fontFamily: fonts.bold, color: colors.navy },
  line: { fontFamily: fonts.regular, fontSize: 14, color: colors.navy, marginTop: spacing.xs },
  actions: { marginTop: spacing.md, gap: spacing.sm },
  picker: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.white, borderRadius: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  chipSelected: { backgroundColor: colors.goldBright },
  chipText: { fontFamily: fonts.semibold, color: colors.navy },
  sent: { fontFamily: fonts.semibold, color: colors.navy },
});
