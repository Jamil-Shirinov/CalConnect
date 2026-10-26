import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import type { Session } from '../../data/mock';
import { useAppStore } from '../../store/AppStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const byDateStart = (a: Session, b: Session) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start);

export default function CheckIns() {
  const { state, checkIn } = useAppStore();
  const tutorName = (id: string) => state.tutors.find(t => t.id === id)?.name ?? '';
  const today = state.sessions.filter(s => s.date === state.today).sort(byDateStart);
  const upcoming = state.sessions.filter(s => s.date > state.today).sort(byDateStart);
  const past = state.sessions.filter(s => s.date < state.today).sort((a, b) => byDateStart(b, a));

  const renderSection = (title: string, sessions: Session[], withCheckIn: boolean) => (
    <Card title={title}>
      {sessions.length === 0 ? (
        <EmptyState message="Nothing here" />
      ) : (
        sessions.map(s => (
          <View key={s.id} style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.course}>{s.course}</Text>
              <Text style={styles.detail}>{tutorName(s.tutorId)}</Text>
              <Text style={styles.detail}>{s.date}</Text>
              <Text style={styles.detail}>{`${s.start}–${s.end}`}</Text>
              <Text style={styles.detail}>{s.location}</Text>
            </View>
            {withCheckIn ? (
              s.checkedIn ? (
                <Text style={styles.checked}>Checked in</Text>
              ) : (
                <Button title="Check in" onPress={() => checkIn(s.id)} />
              )
            ) : null}
          </View>
        ))
      )}
    </Card>
  );

  return (
    <View>
      <Text style={styles.heading}>Check-Ins</Text>
      {renderSection('Today', today, true)}
      {renderSection('Upcoming', upcoming, false)}
      {renderSection('Past', past, false)}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontFamily: fonts.bold, fontSize: 24, color: colors.navy, marginBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  info: { flex: 1 },
  course: { fontFamily: fonts.semibold, fontSize: 16, color: colors.navy },
  detail: { fontFamily: fonts.regular, fontSize: 14, color: colors.navy },
  checked: { fontFamily: fonts.semibold, fontSize: 14, color: colors.navy },
});
