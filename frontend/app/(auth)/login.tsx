import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { validateLogin, type FieldErrors } from '../../lib/validation';
import { useAppStore } from '../../store/AppStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type Field = 'email' | 'password';

export default function Login() {
  const router = useRouter();
  const { state, signIn } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors<Field>>({});

  const clearError = (field: Field) =>
    setErrors((prev) => {
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });

  const submit = () => {
    const found = validateLogin({ email, password });
    setErrors(found);
    if (Object.keys(found).length === 0) signIn(email.trim());
  };

  const forgotPassword = () => {
    if (Platform.OS === 'web') window.alert('Password reset: coming soon');
    else Alert.alert('Password reset', 'Coming soon');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.column}>
        <Text style={styles.back} onPress={() => router.replace('/')}>
          ‹ Back
        </Text>
        <Text style={styles.title}>Welcome,</Text>
        <Text style={styles.subtitle}>Glad to see you!</Text>
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
        <Pressable onPress={forgotPassword}>
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>
        <View style={styles.buttons}>
          <Button title="Login" variant="gold" onPress={submit} />
          <Button title="Continue with Google" variant="white" onPress={() => signIn(state.student.email)} />
        </View>
        <Text style={styles.footer}>
          Don't have an account?{' '}
          <Text style={styles.footerLink} onPress={() => router.replace('/signup')}>
            Sign Up Now
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
  link: { fontFamily: fonts.regular, color: colors.cream, textAlign: 'right', marginBottom: spacing.lg },
  buttons: { gap: spacing.md },
  footer: { fontFamily: fonts.regular, color: colors.white, textAlign: 'center', marginTop: spacing.xl },
  footerLink: { fontFamily: fonts.semibold, color: colors.goldBright },
});
