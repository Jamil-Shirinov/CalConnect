import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Redirect, router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { Banner, Button, Txt } from "@/components/ui";
import { auth } from "@/lib/firebase";
import { useStore } from "@/lib/store";
import { colors, fonts } from "@/lib/theme";

const MIN_PASSWORD = 8;

function signupProblem(email: string, password: string, confirm: string) {
  if (!email) return "Enter your Berkeley email.";
  if (!email.endsWith("@berkeley.edu")) return "Use your @berkeley.edu email.";
  if (password.length < MIN_PASSWORD) return `Use a password of at least ${MIN_PASSWORD} characters.`;
  if (password !== confirm) return "The passwords don't match.";
  return null;
}

function authMessage(err: unknown) {
  const code = (err as { code?: string }).code ?? "";
  if (code.includes("email-already-in-use")) return "There's already an account with that email. Log in instead.";
  if (code.includes("invalid-email")) return "That doesn't look like an email address.";
  if (code.includes("weak-password")) return "Pick a stronger password.";
  if (code.includes("network")) return "Can't reach Firebase. Are the emulators running?";
  if (code.includes("too-many-requests")) return "Too many tries. Wait a minute and try again.";
  return "Couldn't create your account. Try again.";
}

export default function Signup() {
  const { ready, user } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Signed in: the tabs send people without a profile on to onboarding.
  if (ready && user) return <Redirect href="/home" />;

  const signUp = async () => {
    const address = email.trim().toLowerCase();
    const problem = signupProblem(address, password, confirm);
    setError(problem);
    if (problem) return;
    setBusy(true);
    try {
      await createUserWithEmailAndPassword(auth, address, password); // the Redirect above takes it from here
    } catch (err) {
      setError(authMessage(err));
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heading}>
          <Txt w="bold" size={40} color={colors.white}>Create account</Txt>
          <Txt size={22} color={colors.white}>to get started now!</Txt>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Berkeley email (@berkeley.edu)"
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder={`Password (${MIN_PASSWORD}+ characters)`}
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          autoComplete="new-password"
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          autoComplete="new-password"
          value={confirm}
          onChangeText={setConfirm}
          onSubmitEditing={signUp}
        />

        {error && <Banner tone="error">{error}</Banner>}

        <Button title="Sign up" loading={busy} onPress={signUp} style={styles.button} />

        <Pressable onPress={() => router.replace("/login")} style={styles.login}>
          <Txt w="semibold" size={17} color={colors.white}>Already have an account?</Txt>
          <Txt w="bold" size={17} color={colors.white}>Log In Now</Txt>
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
    fontFamily: fonts.regular, fontSize: 18, color: colors.ink
  },
  button: { marginTop: 14 },
  login: { alignItems: "center", marginTop: 24, gap: 2 }
});
