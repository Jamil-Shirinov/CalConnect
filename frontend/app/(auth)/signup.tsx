import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { validateSignup, type FieldErrors } from '../../lib/validation';
import { useAppStore } from '../../store/AppStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type Field = 'email' | 'password' | 'confirm';

export default function Signup() {
  const router = useRouter();
  const { state, signIn } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<FieldErrors<Field>>({});

  const clearError = (field: Field) =>
    setErrors((prev) => {
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });

  const submit = () => {
    const found = validateSignup({ email, password, confirm });
    setErrors(found);
    if (Object.keys(found).length === 0) signIn(email.trim());
  };

  return (
    <View style={styles.screen}>
      <View style={styles.column}>
        <Text style={styles.back} onPress={() => router.replace('/')}>
          ‹ Back
        </Text>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>to get started now!</Text>
        <TextField
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            clearError('email');
          }}
          tone="dark"
          error={errors.email}
        />
        <TextField
          placeholder="Password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            clearError('password');
          }}
          tone="dark"
          error={errors.password}
          secureTextEntry
        />
        <TextField
          placeholder="Confirm password"
          value={confirm}
          onChangeText={(t) => {
            setConfirm(t);
            clearError('confirm');
          }}
          tone="dark"
          error={errors.confirm}
          secureTextEntry
        />
        <View style={styles.buttons}>
          <Button title="Sign Up" variant="gold" onPress={submit} />
          <Button title="Continue with Google" variant="white" onPress={() => signIn(state.student.email)} />
        </View>
        <Text style={styles.footer}>
          Already have an account?{' '}
          <Text style={styles.footerLink} onPress={() => router.replace('/login')}>
            Login Now
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  column: { width: '100%', maxWidth: 280 },
  back: { fontFamily: fonts.semibold, color: colors.cream, marginBottom: spacing.lg },
  title: { fontFamily: fonts.bold, fontSize: 32, color: colors.white },
  subtitle: { fontFamily: fonts.regular, fontSize: 18, color: colors.cream, marginBottom: spacing.xl },
  buttons: { gap: spacing.md, marginTop: spacing.sm },
  footer: { fontFamily: fonts.regular, color: colors.white, textAlign: 'center', marginTop: spacing.xl },
  footerLink: { fontFamily: fonts.semibold, color: colors.goldBright },
});
