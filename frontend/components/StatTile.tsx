import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing } from '../theme/spacing';

const TONE_BG = {
  cream: colors.cream,
  navy: colors.navy,
  gold: colors.gold,
  sky: colors.skyLight,
} as const;

export function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'cream' | 'navy' | 'gold' | 'sky';
}) {
  const color = tone === 'navy' ? colors.white : colors.navy;
  return (
    <View testID={'stat-' + label} style={[styles.tile, { backgroundColor: TONE_BG[tone] }]}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, minWidth: 120, padding: spacing.lg, borderRadius: spacing.sm },
  value: { fontFamily: fonts.bold, fontSize: 28 },
  label: { fontFamily: fonts.regular, fontSize: 14 },
});
