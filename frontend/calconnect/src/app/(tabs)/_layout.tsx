import { ActivityIndicator, StyleSheet, View, type ColorValue } from "react-native";
import { Redirect } from "expo-router";
import { Tabs } from "expo-router/js-tabs";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";

import { Banner, Button } from "@/components/ui";
import { auth } from "@/lib/firebase";
import { useStore } from "@/lib/store";
import { colors, fonts } from "@/lib/theme";

type IconName = keyof typeof Ionicons.glyphMap;

const icon = (name: IconName) => ({ color, size }: { color: ColorValue; size: number }) =>
  <Ionicons name={name} color={color} size={size} />;

export default function TabsLayout() {
  const { ready, user, profile, matches, sessions, error } = useStore();

  if (ready && !user) return <Redirect href="/" />;
  if (!ready || profile === undefined) {
    return <View style={styles.center}><ActivityIndicator color={colors.navy} size="large" /></View>;
  }
  if (profile === null) {
    return (
      <View style={[styles.center, { padding: 24, gap: 16 }]}>
        <Banner tone="info">This account doesn't have a profile yet. Log in with a demo account.</Banner>
        <Button small variant="navy" title="Log out" onPress={() => signOut(auth)} />
      </View>
    );
  }

  const incoming = matches.filter((m) => m.status === "requested" && m.requestedBy !== user?.uid).length;
  const toConfirm = sessions.filter((s) => s.status === "proposed" && s.proposedBy !== user?.uid && s.end > new Date()).length;

  return (
    <View style={{ flex: 1 }}>
      {error && <Banner tone="error">{error}</Banner>}
      <Tabs
        screenOptions={{
          headerShown: false,
          title: "CalConnect",
          sceneStyle: { backgroundColor: colors.page },
          tabBarActiveTintColor: colors.navy,
          tabBarInactiveTintColor: "#9A93AE",
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
          tabBarBadgeStyle: { backgroundColor: colors.gold, color: colors.white, fontFamily: fonts.bold }
        }}
      >
        <Tabs.Screen name="home" options={{ tabBarLabel: "Dashboard", tabBarIcon: icon("home") }} />
        <Tabs.Screen
          name="matches"
          options={{
            tabBarLabel: profile.role === "student" ? "Tutors" : "Students",
            tabBarIcon: icon("people"),
            tabBarBadge: incoming || undefined
          }}
        />
        <Tabs.Screen
          name="sessions"
          options={{ tabBarLabel: "Sessions", tabBarIcon: icon("calendar"), tabBarBadge: toConfirm || undefined }}
        />
        <Tabs.Screen name="messages" options={{ tabBarLabel: "Messages", tabBarIcon: icon("chatbubbles") }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.page },
  tabBar: { backgroundColor: colors.cream, borderTopColor: colors.line, height: 70, paddingTop: 6, paddingBottom: 12 }
});
