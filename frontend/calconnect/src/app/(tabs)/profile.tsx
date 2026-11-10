import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { signOut } from "firebase/auth";

import { ProfileForm } from "@/components/ProfileForm";
import { TabHeader } from "@/components/TabHeader";
import { Banner, Button, Card, Txt } from "@/components/ui";
import { auth } from "@/lib/firebase";
import { draftFrom, profileProblem, saveProfile, type ProfileDraft } from "@/lib/profile";
import { useStore } from "@/lib/store";
import { colors } from "@/lib/theme";

export default function ProfileTab() {
  const { profile } = useStore();
  if (!profile) return null;
  // Keyed on uid so switching accounts starts from the new profile.
  return <ProfileEditor key={profile.uid} />;
}

function ProfileEditor() {
  const { profile } = useStore();
  const [draft, setDraft] = useState<ProfileDraft>(() => draftFrom(profile ?? undefined));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  if (!profile) return null;

  const edit = (d: ProfileDraft) => {
    setDraft(d);
    setError(null);
    setSaved(false);
  };

  const save = async () => {
    const problem = profileProblem(draft);
    setError(problem);
    if (problem) return;
    setBusy(true);
    try {
      await saveProfile(draft);
      setSaved(true);
    } catch (err) {
      console.warn(err);
      setError("Couldn't save your changes. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TabHeader title="Your profile" subtitle="Changes to courses and free time update your matches." />

        <Card style={{ gap: 2 }}>
          <Txt w="semibold" size={12} color={colors.muted}>SIGNED IN AS</Txt>
          <Txt w="bold" size={15} color={colors.navy}>{profile.email}</Txt>
          <Txt size={13} color={colors.muted}>{profile.role === "tutor" ? "Tutor" : "Student"}</Txt>
        </Card>

        <ProfileForm draft={draft} onChange={edit} role={profile.role} />

        {error && <Banner tone="error">{error}</Banner>}
        {saved && <Banner tone="success">Saved. Your matches will refresh.</Banner>}
        <Button title="Save changes" loading={busy} onPress={save} />
        <View style={styles.logout}>
          <Button small variant="outline" title="Log out" onPress={() => signOut(auth)} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 28, paddingBottom: 40, gap: 22 },
  logout: { alignItems: "flex-start" }
});
