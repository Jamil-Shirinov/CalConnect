import { StyleSheet, View } from "react-native";
import { Redirect, router } from "expo-router";

import { Bear, Button, Txt } from "@/components/ui";
import { useStore } from "@/lib/store";
import { colors } from "@/lib/theme";

export default function Welcome() {
  const { ready, user } = useStore();
  if (ready && user) return <Redirect href="/home" />;

  return (
    <View style={styles.screen}>
      <Bear size={250} onDark />
      <Txt w="bold" size={42} color={colors.white} style={styles.title}>CalConnect</Txt>
      <Txt size={15} color="#CFC6E8" style={styles.tagline}>Find the right Berkeley tutor for how you learn.</Txt>
      <View style={styles.buttons}>
        <Button variant="white" title="Login" onPress={() => router.push("/login")} />
        <Button title="Sign up" onPress={() => router.push("/login?signup=1")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night, alignItems: "center", justifyContent: "center", padding: 34 },
  title: { marginTop: 24 },
  tagline: { marginTop: 8, textAlign: "center" },
  buttons: { alignSelf: "stretch", gap: 36, marginTop: 56 }
});
