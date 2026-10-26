import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing } from '../theme/spacing';

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.xl, alignItems: 'center' },
  text: { fontFamily: fonts.regular, fontSize: 16, color: colors.navy, textAlign: 'center' },
});
