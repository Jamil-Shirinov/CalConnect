import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Redirect, useLocalSearchParams } from "expo-router";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";

import { Banner, Button, Txt } from "@/components/ui";
import { auth, usingEmulators } from "@/lib/firebase";
import { useStore } from "@/lib/store";
import { colors, fonts } from "@/lib/theme";

// Seeded by `npm run seed` in server/ (emulators only).
const DEMO_ACCOUNTS = [
  { label: "Alex · student", email: "alex@berkeley.edu" },
  { label: "Priya · tutor", email: "priya@berkeley.edu" }
];
const DEMO_PASSWORD = "calconnect";

function authMessage(err: unknown) {
  const code = (err as { code?: string }).code ?? "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "That email and password don't match.";
  }
  if (code.includes("invalid-email")) return "That doesn't look like an email address.";
  if (code.includes("network")) return "Can't reach Firebase. Are the emulators running?";
  if (code.includes("too-many-requests")) return "Too many tries. Wait a minute and try again.";
  return "Couldn't log in. Try again.";
}

export default function Login() {
  const { ready, user } = useStore();
  const { signup } = useLocalSearchParams<{ signup?: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    signup ? "New accounts open soon. Use a demo account below for now." : null
  );

  if (ready && user) return <Redirect href="/home" />;

  const logIn = async () => {
    setError(null);
    if (!email.trim() || !password) return setError("Enter your email and password.");
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password); // the Redirect above takes it from here
    } catch (err) {
      setError(authMessage(err));
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    setError(null);
    if (!email.trim()) return setError("Type your email first, then tap Forgot password.");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice(`We sent a reset link to ${email.trim()}.`);
    } catch (err) {
      setError(authMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heading}>
          <Txt w="bold" size={40} color={colors.white}>Welcome,</Txt>
          <Txt size={38} color={colors.white}>Glad to see you!</Txt>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={logIn}
        />
        <Pressable onPress={resetPassword} style={styles.forgot}>
          <Txt size={16} color={colors.white}>Forgot password?</Txt>
        </Pressable>

        {error && <Banner tone="error">{error}</Banner>}
        {notice && !error && <Banner tone="info">{notice}</Banner>}

        <Button title="Login" loading={busy} onPress={logIn} style={styles.login} />

        {usingEmulators && (
          <View style={styles.demo}>
            <Txt w="semibold" size={15} color={colors.white}>----Or Try a Demo Account ----</Txt>
            <View style={styles.demoRow}>
              {DEMO_ACCOUNTS.map((a) => (
                <Pressable
                  key={a.email}
                  style={styles.demoChip}
                  onPress={() => { setEmail(a.email); setPassword(DEMO_PASSWORD); setError(null); }}
                >
                  <Txt w="semibold" size={14} color={colors.navy}>{a.label}</Txt>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <Pressable onPress={() => setNotice("New accounts open soon. Use a demo account for now.")} style={styles.signup}>
          <Txt w="semibold" size={17} color={colors.white}>Don’t have an account?</Txt>
          <Txt w="bold" size={17} color={colors.white}>Sign Up Now</Txt>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.navy },
  content: { flexGrow: 1, justifyContent: "center", padding: 36, gap: 16 },
  heading: { alignItems: "center", marginBottom: 20 },
  input: {
    backgroundColor: colors.field, height: 64, paddingHorizontal: 18,
    fontFamily: fonts.regular, fontSize: 20, color: colors.ink
  },
  forgot: { alignSelf: "flex-end", marginTop: -8 },
  login: { marginTop: 14 },
  demo: { alignItems: "center", gap: 12, marginTop: 10 },
  demoRow: { flexDirection: "row", gap: 10 },
  demoChip: { backgroundColor: colors.cream, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999 },
  signup: { alignItems: "center", marginTop: 24, gap: 2 }
});
