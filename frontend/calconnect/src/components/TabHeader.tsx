import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { signOut } from "firebase/auth";

import { auth } from "@/lib/firebase";
import { useStore } from "@/lib/store";
import { colors } from "@/lib/theme";
import { Avatar, Bear, Txt } from "./ui";

/** Logo row from the mockup, then the screen title. */
export function TabHeader({ title, subtitle }: { title: ReactNode; subtitle?: string }) {
  const { profile } = useStore();
  return (
    <View style={styles.wrap}>
      <View style={styles.brandRow}>
        <View style={styles.brand}>
          <Bear size={52} />
          <Txt w="black" size={26} color={colors.navy}>CalConnect</Txt>
        </View>
        <Pressable onPress={() => signOut(auth)} style={styles.me} accessibilityLabel="Log out">
          <Avatar name={profile?.name} size={34} />
          <Txt w="semibold" size={11} color={colors.muted}>Log out</Txt>
        </Pressable>
      </View>
      <Txt w="bold" size={24} color={colors.navy}>{title}</Txt>
      {subtitle ? <Txt size={14} color={colors.muted}>{subtitle}</Txt> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginBottom: 6 },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  me: { alignItems: "center", gap: 2 }
});
