import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { BackHeader } from "@/components/BackHeader";
import { Empty, Txt } from "@/components/ui";
import { sendMessage, useMessages, useOther, useStore } from "@/lib/store";
import { colors, fonts, radius } from "@/lib/theme";
import { formatTime } from "@/lib/time";

export default function Chat() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { user, matches } = useStore();
  const match = matches.find((m) => m.id === matchId);
  const other = useOther(match);
  const messages = useMessages(match?.status === "accepted" ? matchId : undefined);
  const [text, setText] = useState("");
  const scroll = useRef<ScrollView>(null);

  const send = () => {
    const body = text.trim();
    if (!body || !matchId) return;
    setText("");
    sendMessage(matchId, body).catch((err) => console.warn(err));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <BackHeader title={other?.name ?? "Chat"} subtitle={match?.courses.join(", ")} name={other?.name} />
      <ScrollView
        ref={scroll}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 && <Empty>No messages yet. Say hi 👋</Empty>}
        {messages.map((m) => {
          const mine = m.senderId === user?.uid;
          return (
            <View key={m.id} style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              <Txt size={15} color={mine ? colors.white : colors.ink}>{m.text}</Txt>
              <Txt size={11} color={mine ? "#D9D0F0" : colors.muted} style={{ alignSelf: "flex-end" }}>
                {m.createdAt ? formatTime(m.createdAt) : ""}
              </Txt>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Message"
          placeholderTextColor={colors.muted}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <Pressable style={styles.send} onPress={send} accessibilityLabel="Send">
          <Ionicons name="send" size={18} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 8 },
  bubble: { maxWidth: "80%", paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.lg, gap: 2 },
  mine: { alignSelf: "flex-end", backgroundColor: colors.navy, borderBottomRightRadius: 4 },
  theirs: { alignSelf: "flex-start", backgroundColor: colors.cream, borderBottomLeftRadius: 4 },
  composer: {
    flexDirection: "row", gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: colors.line,
    backgroundColor: colors.white
  },
  input: {
    flex: 1, height: 44, borderRadius: radius.pill, backgroundColor: colors.field, paddingHorizontal: 16,
    fontFamily: fonts.regular, fontSize: 15, color: colors.ink
  },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center" }
});
