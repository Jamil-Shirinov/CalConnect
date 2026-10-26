import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { StatTile } from '../../components/StatTile';
import { useIsWide } from '../../hooks/useIsWide';
import { isUnread, upcomingSessions, useAppStore } from '../../store/AppStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function Dashboard() {
  const router = useRouter();
  const wide = useIsWide();
  const { state } = useAppStore();
  const tutorName = (id: string) => state.tutors.find(t => t.id === id)?.name ?? 'Unknown tutor';
  const todays = state.sessions.filter(s => s.date === state.today).sort((a, b) => a.start.localeCompare(b.start));

  return (
    <View>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Find your next session</Text>
        <Button title="View Now" onPress={() => router.push('/booking')} />
      </View>

      <View style={[styles.stats, wide ? styles.statsWide : styles.statsNarrow]}>
        <StatTile label="Upcoming sessions" value={upcomingSessions(state).length} tone="cream" />
        <StatTile label="Unread messages" value={state.threads.filter(isUnread).length} tone="navy" />
        <StatTile
          label="Pending requests"
          value={state.requests.filter(r => r.status === 'pending').length}
          tone="gold"
        />
        <StatTile label="Matched tutors" value={state.tutors.length} tone="sky" />
      </View>

      <Card title="Today's Sessions">
        {todays.length === 0 ? (
          <EmptyState message="No sessions today" />
        ) : (
          todays.map(s => (
            <View key={s.id} style={styles.item}>
              <Text style={styles.itemTitle}>{s.course}</Text>
              <Text style={styles.itemLine}>{tutorName(s.tutorId)}</Text>
              <Text style={styles.itemLine}>{`${s.start}–${s.end}`}</Text>
              <Text style={styles.itemLine}>{s.location}</Text>
            </View>
          ))
        )}
      </Card>

      <Card title="Recent Messages">
        {state.threads.slice(0, 3).map(th => (
          <View key={th.id} style={styles.item}>
            <Text style={styles.itemTitle}>{tutorName(th.tutorId)}</Text>
            <Text style={styles.itemLine}>{th.messages.at(-1)?.text ?? ''}</Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.cream,
    borderRadius: spacing.sm,
    padding: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
  },
  bannerText: { fontFamily: fonts.bold, fontSize: 20, color: colors.navy },
  stats: { gap: spacing.md, marginBottom: spacing.lg },
  statsWide: { flexDirection: 'row', flexWrap: 'wrap' },
  statsNarrow: { flexDirection: 'column' },
  item: { marginBottom: spacing.md },
  itemTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.navy },
  itemLine: { fontFamily: fonts.regular, fontSize: 14, color: colors.navy },
});
