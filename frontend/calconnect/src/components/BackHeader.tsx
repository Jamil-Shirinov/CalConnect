import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/lib/theme";
import { Avatar, Txt } from "./ui";

export function BackHeader({ title, subtitle, name }: { title: string; subtitle?: string; name?: string }) {
  const back = () => (router.canGoBack() ? router.back() : router.replace("/home"));
  return (
    <View style={styles.bar}>
      <Pressable onPress={back} hitSlop={12} accessibilityLabel="Back">
        <Ionicons name="chevron-back" size={26} color={colors.navy} />
      </Pressable>
      {name && <Avatar name={name} size={38} />}
      <View style={{ flex: 1 }}>
        <Txt w="bold" size={18} color={colors.navy}>{title}</Txt>
        {subtitle && <Txt size={13} color={colors.muted}>{subtitle}</Txt>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingTop: 22, paddingBottom: 12,
    backgroundColor: colors.cream
  }
});
