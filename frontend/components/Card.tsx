import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing } from '../theme/spacing';

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      {title ? (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
      ) : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: spacing.sm, overflow: 'hidden', marginBottom: spacing.lg },
  header: { backgroundColor: colors.greyDark, padding: spacing.md },
  title: { fontFamily: fonts.bold, fontSize: 16, color: colors.navy },
  body: { backgroundColor: colors.grey, padding: spacing.lg },
});
