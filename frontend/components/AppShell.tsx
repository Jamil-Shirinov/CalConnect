import { useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useIsWide } from '../hooks/useIsWide';
import { useAppStore } from '../store/AppStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { BrandHeader } from './BrandHeader';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: ReactNode }) {
  const wide = useIsWide();
  const { state } = useAppStore();
  const [open, setOpen] = useState(false);

  const content = (
    <ScrollView
      style={styles.content}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.contentInner}>
      <BrandHeader />
      <Text style={styles.welcome}>
        Welcome back, <Text style={styles.welcomeName}>{state.student.name}</Text>!
      </Text>
      {children}
    </ScrollView>
  );

  if (wide) {
    return (
      <View style={styles.row}>
        <View style={styles.sidebarWide}>
          <Sidebar />
        </View>
        {content}
      </View>
    );
  }

  return (
    <View style={styles.column}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Open menu" onPress={() => setOpen(true)}>
          <Text style={styles.hamburger}>☰</Text>
        </Pressable>
      </View>
      {content}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalRow}>
          <View style={styles.drawer}>
            <Sidebar onNavigate={() => setOpen(false)} />
          </View>
          <Pressable
            accessibilityLabel="Close menu"
            style={styles.backdrop}
            onPress={() => setOpen(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row', backgroundColor: colors.white },
  column: { flex: 1, backgroundColor: colors.white },
  sidebarWide: { width: 220 },
  topBar: { padding: spacing.lg, flexDirection: 'row' },
  hamburger: { fontSize: 24, color: colors.navy },
  content: { flex: 1 },
  contentInner: { padding: spacing.lg, gap: spacing.lg },
  welcome: { fontFamily: fonts.regular, fontSize: 20, color: colors.navy },
  welcomeName: { fontFamily: fonts.bold },
  modalRow: { flex: 1, flexDirection: 'row' },
  drawer: { width: 260 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
});
