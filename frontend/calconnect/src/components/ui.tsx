// Small building blocks in the mockup's style. Screens compose these instead
// of styling raw Text/Pressable.
import type { ReactNode } from "react";
import {
  ActivityIndicator, Image, Pressable, StyleSheet, Text, View,
  type StyleProp, type TextProps, type TextStyle, type ViewStyle
} from "react-native";

import { colors, fonts, radius } from "@/lib/theme";

type Weight = keyof typeof fonts;

export function Txt({ w = "regular", size = 15, color = colors.ink, style, ...props }:
  TextProps & { w?: Weight; size?: number; color?: string }) {
  return <Text {...props} style={[{ fontFamily: fonts[w], fontSize: size, color }, style]} />;
}

type ButtonVariant = "gold" | "white" | "navy" | "outline" | "ghost";

const buttonStyles: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
  gold: { bg: colors.gold, fg: colors.white },
  white: { bg: colors.white, fg: colors.navy },
  navy: { bg: colors.navy, fg: colors.white },
  outline: { bg: "transparent", fg: colors.navy, border: colors.navy },
  ghost: { bg: "transparent", fg: colors.navy }
};

export function Button({ title, onPress, variant = "gold", small, loading, disabled, style }: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  small?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const v = buttonStyles[variant];
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: v.bg, borderColor: v.border ?? v.bg, opacity: off ? 0.5 : pressed ? 0.85 : 1 },
        style
      ]}
    >
      {loading
        ? <ActivityIndicator color={v.fg} />
        : <Txt w="bold" size={small ? 14 : 20} color={v.fg}>{title}</Txt>}
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, marked }: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Gold dot, e.g. "both of you are free". */
  marked?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected, !selected && marked && styles.chipMarked]}
    >
      {marked && <View style={[styles.dot, selected && { backgroundColor: colors.yellow }]} />}
      <Txt w="semibold" size={13} color={selected ? colors.white : colors.navy}>{label}</Txt>
    </Pressable>
  );
}

export function Pill({ label, tone = "cream" }: { label: string; tone?: "cream" | "sky" | "green" | "grey" | "gold" }) {
  const bg = { cream: colors.cream, sky: colors.sky, green: colors.successBg, grey: "#ECEAF0", gold: colors.gold }[tone];
  const fg = { cream: colors.navy, sky: colors.navy, green: colors.success, grey: colors.muted, gold: colors.white }[tone];
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Txt w="semibold" size={12} color={fg}>{label}</Txt>
    </View>
  );
}

export function Banner({ tone, children }: { tone: "error" | "success" | "info"; children: ReactNode }) {
  const bg = { error: colors.dangerBg, success: colors.successBg, info: colors.cream }[tone];
  const fg = { error: colors.danger, success: colors.success, info: colors.navy }[tone];
  return (
    <View style={[styles.banner, { backgroundColor: bg, borderLeftColor: fg }]}>
      <Txt w="medium" size={14} color={fg}>{children}</Txt>
    </View>
  );
}

const AVATAR_COLORS = [colors.gold, colors.navy, "#3B7A8C", "#8C4A3B", "#5B3B8C", "#3B8C5B"];

export function Avatar({ name = "?", size = 44 }: { name?: string; size?: number }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const hash = [...name].reduce((h, c) => h + c.charCodeAt(0), 0);
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: AVATAR_COLORS[hash % AVATAR_COLORS.length] }]}>
      <Txt w="bold" size={size * 0.38} color={colors.white}>{initials}</Txt>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Card with the mockup's coloured title bar ("Today's Sessions"). */
export function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Txt w="bold" size={17} color={colors.navy}>{title}</Txt>
        {action}
      </View>
      <View style={styles.panelBody}>{children}</View>
    </View>
  );
}

export function Bear({ size = 120, onDark }: { size?: number; onDark?: boolean }) {
  return onDark
    ? <Image source={require("../../assets/images/bear-dark.png")} style={{ width: size, height: size * (215 / 251) }} />
    : <Image source={require("../../assets/images/bear-light.png")} style={{ width: size, height: size * (167 / 195) }} />;
}

export function Empty({ children }: { children: ReactNode }) {
  return <Txt size={14} color={colors.muted} style={{ paddingVertical: 8 } as TextStyle}>{children}</Txt>;
}

const styles = StyleSheet.create({
  button: {
    minHeight: 58, paddingHorizontal: 20, alignItems: "center", justifyContent: "center",
    borderWidth: 2
  },
  buttonSmall: { minHeight: 38, paddingHorizontal: 14, borderRadius: radius.sm },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill,
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line
  },
  chipSelected: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipMarked: { borderColor: colors.gold, backgroundColor: "#FFF8DC" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.gold },
  pill: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  banner: { padding: 12, borderRadius: radius.sm, borderLeftWidth: 4 },
  avatar: { alignItems: "center", justifyContent: "center" },
  card: {
    backgroundColor: colors.white, borderRadius: radius.lg, padding: 16,
    borderWidth: 1, borderColor: colors.line,
    shadowColor: colors.navy, shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }
  },
  panel: { borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  panelHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: colors.cream, paddingHorizontal: 16, paddingVertical: 12
  },
  panelBody: { padding: 16, gap: 14 }
});
