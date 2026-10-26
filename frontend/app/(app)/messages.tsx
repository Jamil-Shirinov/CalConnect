import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import type { Thread } from '../../data/mock';
import { useIsWide } from '../../hooks/useIsWide';
import { isUnread, useAppStore } from '../../store/AppStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function Messages() {
  const { state, sendMessage } = useAppStore();
  const wide = useIsWide();
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const tutorName = (t: Thread) => state.tutors.find(x => x.id === t.tutorId)?.name ?? '';
  const selectedId = openId ?? (wide ? state.threads[0]?.id : undefined);
  const selected = state.threads.find(t => t.id === selectedId);

  const send = () => {
    if (!selected || !draft.trim()) return;
    sendMessage(selected.id, draft);
    setDraft('');
  };

  const list = (
    <View style={wide ? styles.listWide : undefined}>
      {state.threads.map(t => (
        <Pressable
          key={t.id}
          accessibilityRole="button"
          onPress={() => {
            setOpenId(t.id);
            setDraft('');
          }}
          style={[styles.threadRow, t.id === selectedId && styles.threadRowSelected]}
        >
          <Text style={[styles.name, isUnread(t) && styles.bold]}>{tutorName(t)}</Text>
          <Text numberOfLines={1} style={[styles.preview, isUnread(t) && styles.bold]}>
            {t.messages.at(-1)?.text ?? ''}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const thread = selected ? (
    <View style={styles.thread}>
      {wide ? null : (
        <View style={styles.header}>
          <Button title="‹ Back" variant="white" onPress={() => {
              setOpenId(null);
              setDraft('');
            }} />
          <Text style={styles.headerName}>{tutorName(selected)}</Text>
        </View>
      )}
      {selected.messages.map((m, i) => (
        <View
          key={i}
          testID="bubble"
          style={[styles.bubble, m.from === 'me' ? styles.mine : styles.theirs]}
        >
          <Text style={styles.bubbleText}>{m.text}</Text>
        </View>
      ))}
      <TextField placeholder="Type a message" value={draft} onChangeText={setDraft} />
      <Button title="Send" onPress={send} />
    </View>
  ) : null;

  return (
    <View>
      <Text style={styles.heading}>Messages</Text>
      {wide ? (
        <View style={styles.wideRow}>
          {list}
          {thread}
        </View>
      ) : (
        (thread ?? list)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontFamily: fonts.bold, fontSize: 24, color: colors.navy, marginBottom: spacing.lg },
  wideRow: { flexDirection: 'row', gap: spacing.lg },
  listWide: { width: 260 },
  threadRow: { backgroundColor: colors.grey, padding: spacing.md, borderRadius: spacing.sm, marginBottom: spacing.sm },
  threadRowSelected: { backgroundColor: colors.skyLight },
  name: { fontFamily: fonts.regular, fontSize: 16, color: colors.navy },
  preview: { fontFamily: fonts.regular, fontSize: 14, color: colors.navy },
  bold: { fontFamily: fonts.bold },
  thread: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  headerName: { fontFamily: fonts.semibold, fontSize: 18, color: colors.navy },
  bubble: { maxWidth: '80%', padding: spacing.md, borderRadius: spacing.md, marginBottom: spacing.sm },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.gold },
  theirs: { alignSelf: 'flex-start', backgroundColor: colors.grey },
  bubbleText: { fontFamily: fonts.regular, fontSize: 16, color: colors.navy },
});
