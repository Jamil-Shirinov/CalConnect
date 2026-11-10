import type { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold
} from "@expo-google-fonts/inter";

import { StoreProvider } from "@/lib/store";
import { colors } from "@/lib/theme";

/** On web, show the app in a phone-width column so it looks like the mobile mockup. */
function PhoneFrame({ children }: { children: ReactNode }) {
  if (Platform.OS !== "web") return <>{children}</>;
  return (
    <View style={styles.backdrop}>
      <View style={styles.phone}>{children}</View>
    </View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold });
  if (!loaded) return <View style={styles.backdrop} />;

  return (
    <StoreProvider>
      <PhoneFrame>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false, title: "CalConnect", contentStyle: { backgroundColor: colors.page } }} />
      </PhoneFrame>
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#120530", alignItems: "center" },
  phone: { flex: 1, width: "100%", maxWidth: 430, overflow: "hidden", backgroundColor: colors.page }
});
