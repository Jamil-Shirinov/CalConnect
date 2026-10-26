import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DateRange, addMonths, inRange, monthGrid, monthLabel } from '../lib/calendar';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing } from '../theme/spacing';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function DualMonthCalendar({
  range,
  onSelect,
  today,
  months,
}: {
  range: DateRange;
  onSelect(iso: string): void;
  today: string;
  months: 1 | 2;
}) {
  const [ty, tm] = today.split('-').map(Number);
  const [start, setStart] = useState({ year: ty, month: tm });
  const visible = Array.from({ length: months }, (_, i) => addMonths(start.year, start.month, i));

  return (
    <View>
      <View style={styles.header}>
        <Pressable testID="cal-prev" accessibilityLabel="Previous month" onPress={() => setStart(addMonths(start.year, start.month, -1))}>
          <Text style={styles.arrow}>‹</Text>
        </Pressable>
        <View style={styles.labels}>
          {visible.map(m => (
            <Text key={`${m.year}-${m.month}`} style={styles.monthLabel}>{monthLabel(m.year, m.month)}</Text>
          ))}
        </View>
        <Pressable testID="cal-next" accessibilityLabel="Next month" onPress={() => setStart(addMonths(start.year, start.month, 1))}>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>
      <View style={styles.months}>
        {visible.map(m => (
          <View key={`${m.year}-${m.month}`} style={styles.month}>
            <View style={styles.row}>
              {WEEKDAYS.map((w, i) => (
                <Text key={i} style={styles.weekday}>{w}</Text>
              ))}
            </View>
            <View style={styles.grid}>
              {monthGrid(m.year, m.month).map((iso, i) => {
                if (!iso) return <View key={i} style={styles.cell} />;
                const past = iso < today;
                const selected = inRange(iso, range);
                return (
                  <Pressable
                    key={i}
                    testID={'day-' + iso}
                    onPress={past ? undefined : () => onSelect(iso)}
                    accessibilityState={past ? { disabled: true } : undefined}
                    style={[styles.cell, selected && styles.selected]}
                  >
                    <Text style={[styles.day, past && styles.past, iso === today && styles.today]}>
                      {Number(iso.slice(8))}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  arrow: { fontFamily: fonts.bold, fontSize: 24, color: colors.navy, paddingHorizontal: spacing.md },
  labels: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  monthLabel: { fontFamily: fonts.semibold, fontSize: 16, color: colors.navy },
  months: { flexDirection: 'row', gap: spacing.xl },
  month: { flex: 1 },
  row: { flexDirection: 'row' },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', fontFamily: fonts.semibold, color: colors.navy, paddingVertical: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: spacing.sm },
  selected: { backgroundColor: colors.goldBright },
  day: { fontFamily: fonts.regular, color: colors.navy },
  past: { color: colors.greyDark },
  today: { fontFamily: fonts.bold },
});
