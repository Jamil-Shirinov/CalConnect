import { StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../components/EmptyState';
import type { SessionRequest } from '../../data/mock';
import { useAppStore } from '../../store/AppStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const chipColor: Record<SessionRequest['status'], string> = {
  pending: colors.cream,
  accepted: colors.skyLight,
  declined: colors.greyDark,
};

export default function Requests() {
  const { state } = useAppStore();
  const tutorName = (id: string) => state.tutors.find(t => t.id === id)?.name ?? 'Unknown tutor';
  const newestFirst = [...state.requests].reverse();
  return (
    <View>
      <Text style={styles.heading}>Requests</Text>
      {newestFirst.length === 0 ? (
        <EmptyState message="No requests yet" />
      ) : (
        newestFirst.map(r => (
          <View key={r.id} testID="request-row" style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.name}>{tutorName(r.tutorId)}</Text>
              <Text style={styles.line}>{r.course}</Text>
              <Text style={styles.line}>{r.date}</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: chipColor[r.status] }]}>
              <Text style={styles.chipText}>{r.status}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontFamily: fonts.bold, fontSize: 24, color: colors.navy, marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: spacing.sm,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  info: { flex: 1 },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.navy },
  line: { fontFamily: fonts.regular, fontSize: 14, color: colors.navy },
  chip: { borderRadius: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  chipText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.navy },
});
