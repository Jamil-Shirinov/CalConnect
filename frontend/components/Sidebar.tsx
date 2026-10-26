import { Link, usePathname, type Href } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../store/AppStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing } from '../theme/spacing';

export const NAV_ITEMS: { label: string; href: string }[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Tutors', href: '/tutors' },
  { label: 'Check-Ins', href: '/check-ins' },
  { label: 'Messages', href: '/messages' },
  { label: 'Requests', href: '/requests' },
  { label: 'Feedback', href: '/feedback' },
  { label: 'Booking Calendar', href: '/booking' },
  { label: 'Settings', href: '/settings' },
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0].toUpperCase())
    .join('');
}

export function Sidebar({ onNavigate }: { onNavigate?(): void }) {
  const pathname = usePathname();
  const { state } = useAppStore();
  return (
    <View style={styles.sidebar}>
      <View style={styles.logoRow}>
        <Image source={require('../assets/calconnect-logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.brand}>CalConnect</Text>
      </View>
      <View style={styles.links}>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href as Href} onPress={onNavigate} style={styles.link}>
              <Text style={[styles.linkText, active && styles.linkActive]}>{item.label}</Text>
            </Link>
          );
        })}
      </View>
      <View style={styles.user}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(state.student.name)}</Text>
        </View>
        <Text style={styles.userName}>{state.student.name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: { flex: 1, backgroundColor: colors.cream, padding: spacing.lg },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  logo: { width: 32, height: 32 },
  brand: { fontFamily: fonts.bold, fontSize: 18, color: colors.navy },
  links: { flex: 1, gap: spacing.xs },
  link: { paddingVertical: spacing.sm },
  linkText: { fontFamily: fonts.regular, fontSize: 16, color: colors.navy },
  linkActive: { fontFamily: fonts.bold },
  user: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.bold, color: colors.navy },
  userName: { fontFamily: fonts.semibold, fontSize: 14, color: colors.navy },
});
