import { type KeyboardTypeOptions, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing } from '../theme/spacing';

export function TextField({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry,
  multiline,
  testID,
  tone = 'light',
  keyboardType,
  autoCapitalize,
  autoComplete,
}: {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText(t: string): void;
  error?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  testID?: string;
  tone?: 'light' | 'dark';
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
}) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        testID={testID}
        placeholder={placeholder}
        placeholderTextColor={colors.greyDark}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        style={[styles.input, multiline && styles.multiline]}
      />
      {error ? <Text style={[styles.error, tone === 'dark' && styles.errorDark]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { fontFamily: fonts.semibold, color: colors.navy, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.grey,
    borderRadius: spacing.sm,
    padding: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.navy,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  error: { fontFamily: fonts.regular, color: colors.navy, marginTop: spacing.xs },
  errorDark: { color: colors.goldBright },
});
