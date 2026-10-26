import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing } from '../theme/spacing';

type Variant = 'gold' | 'goldBright' | 'white' | 'navy';

const BG: Record<Variant, string> = {
  gold: colors.gold,
  goldBright: colors.goldBright,
  white: colors.white,
  navy: colors.navy,
};

export function Button({
  title,
  onPress,
  variant = 'gold',
  testID,
}: {
  title: string;
  onPress(): void;
  variant?: Variant;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      testID={testID}
      style={[styles.button, { backgroundColor: BG[variant] }]}
    >
      <Text style={[styles.text, { color: variant === 'navy' ? colors.white : colors.navy }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.sm,
    alignItems: 'center',
  },
  text: { fontFamily: fonts.semibold, fontSize: 16 },
});
