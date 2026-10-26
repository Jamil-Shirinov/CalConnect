import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Checkbox } from '../../components/Checkbox';
import { DualMonthCalendar } from '../../components/DualMonthCalendar';
import { EmptyState } from '../../components/EmptyState';
import { TextField } from '../../components/TextField';
import { TutorCard } from '../../components/TutorCard';
import type { Tutor } from '../../data/mock';
import { useIsWide } from '../../hooks/useIsWide';
import { DateRange, selectDate } from '../../lib/calendar';
import { filterTutors, parseRate } from '../../lib/filters';
import { useAppStore } from '../../store/AppStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const EMPTY: DateRange = { from: null, to: null };

export default function Booking() {
  const { state, sendRequest } = useAppStore();
  const isWide = useIsWide();
  const [location, setLocation] = useState('');
  const [range, setRange] = useState<DateRange>(EMPTY);
  const [rangeAtOpen, setRangeAtOpen] = useState<DateRange>(EMPTY);
  const [rateOn, setRateOn] = useState(false);
  const [rateText, setRateText] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [results, setResults] = useState<Tutor[] | null>(null);

  const openPanel = () => {
    if (!panelOpen) setRangeAtOpen(range);
    setPanelOpen(true);
  };
  const apply = () => {
    setResults(filterTutors(state.tutors, { location, range, maxRate: rateOn ? parseRate(rateText) : null }));
    setPanelOpen(false);
  };
  const cancel = () => {
    setRange(rangeAtOpen);
    setPanelOpen(false);
  };

  return (
    <View>
      <Text style={styles.heading}>Booking Calendar</Text>
      <View style={styles.bar}>
        <View style={styles.barField}>
          <TextField placeholder="Location" value={location} onChangeText={setLocation} />
        </View>
        <Pressable style={styles.dateField} onPress={openPanel}>
          <Text style={styles.dateLabel}>From</Text>
          <Text style={styles.dateValue}>{range.from ?? 'Select date'}</Text>
        </Pressable>
        <Pressable style={styles.dateField} onPress={openPanel}>
          <Text style={styles.dateLabel}>To</Text>
          <Text style={styles.dateValue}>{range.to ?? range.from ?? 'Select date'}</Text>
        </Pressable>
        <Button title="Update" onPress={apply} />
      </View>

      {panelOpen ? (
        <View style={styles.panel}>
          <DualMonthCalendar
            range={range}
            onSelect={iso => setRange(selectDate(range, iso))}
            today={state.today}
            months={isWide ? 2 : 1}
          />
          <Checkbox label="Filter by max rate" checked={rateOn} onChange={setRateOn} />
          {rateOn ? <TextField
              placeholder="Max rate"
              value={rateText}
              onChangeText={setRateText}
              keyboardType="numeric"
            /> : null}
          <Text testID="range-summary" style={styles.summary}>
            {`${range.from ?? '—'} → ${range.to ?? '—'}`}
          </Text>
          <View style={styles.actions}>
            <Button title="Reset Dates" variant="white" onPress={() => setRange(EMPTY)} />
            <Button title="Done" onPress={apply} />
            <Button title="Cancel" variant="white" onPress={cancel} />
          </View>
        </View>
      ) : null}

      {results === null
        ? null
        : results.length === 0
          ? <EmptyState message="No tutors match these dates" />
          : results.map(tutor => (
              <TutorCard
                key={tutor.id}
                tutor={tutor}
                today={state.today}
                onRequest={(date, course) => sendRequest(tutor.id, date, course)}
              />
            ))}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontFamily: fonts.bold, fontSize: 24, color: colors.navy, marginBottom: spacing.lg },
  bar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  barField: { flexGrow: 1, minWidth: 160 },
  dateField: { backgroundColor: colors.grey, borderRadius: spacing.sm, padding: spacing.md, minWidth: 120 },
  dateLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.navy },
  dateValue: { fontFamily: fonts.regular, fontSize: 16, color: colors.navy },
  panel: { backgroundColor: colors.cream, borderRadius: spacing.md, padding: spacing.lg, marginBottom: spacing.lg },
  summary: { fontFamily: fonts.semibold, color: colors.navy, marginVertical: spacing.md },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
