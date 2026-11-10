import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import { signOut } from "firebase/auth";

import { ProfileForm } from "@/components/ProfileForm";
import { Banner, Bear, Button, Chip, Txt } from "@/components/ui";
import { auth } from "@/lib/firebase";
import { createProfile, draftFrom, profileProblem } from "@/lib/profile";
import { useStore } from "@/lib/store";
import { colors } from "@/lib/theme";
import type { Role } from "@/lib/types";

export default function Onboarding() {
  const { ready, user, profile } = useStore();
  const [role, setRole] = useState<Role>();
  const [draft, setDraft] = useState(draftFrom());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (ready && !user) return <Redirect href="/" />;
  if (profile) return <Redirect href="/home" />;
  if (!ready || profile === undefined) {
    return <View style={styles.center}><ActivityIndicator color={colors.navy} size="large" /></View>;
  }

  const finish = async () => {
    const problem = role ? profileProblem(draft) : "Choose whether you're a student or a tutor.";
    setError(problem);
    if (problem || !role) return;
    setBusy(true);
    try {
      await createProfile(role, draft); // the profile listener then redirects to /home
    } catch (err) {
      console.warn(err);
      setError("Couldn't save your profile. Try again.");
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Bear size={52} />
          <Txt w="black" size={26} color={colors.navy}>CalConnect</Txt>
        </View>
        <View style={{ gap: 4 }}>
          <Txt w="bold" size={24} color={colors.navy}>Set up your profile</Txt>
          <Txt size={14} color={colors.muted}>
            We use this to match you. You can change everything except your role later.
          </Txt>
        </View>

        <View style={{ gap: 10 }}>
          <Txt w="bold" size={15} color={colors.navy}>I'm joining as a</Txt>
          <View style={styles.chips}>
            <Chip label="Student" selected={role === "student"} onPress={() => setRole("student")} />
            <Chip label="Tutor" selected={role === "tutor"} onPress={() => setRole("tutor")} />
          </View>
        </View>

        <ProfileForm draft={draft} onChange={(d) => { setDraft(d); setError(null); }} role={role ?? "student"} />

        {error && <Banner tone="error">{error}</Banner>}
        <Button title="Finish" loading={busy} onPress={finish} />
        <Button variant="ghost" small title={`Not you? Log out (${user?.email ?? ""})`} onPress={() => signOut(auth)} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.page },
  content: { padding: 20, paddingTop: 28, paddingBottom: 40, gap: 22 },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 }
});
