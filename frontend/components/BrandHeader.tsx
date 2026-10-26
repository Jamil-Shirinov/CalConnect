import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing } from '../theme/spacing';

export function BrandHeader() {
  return (
    <View style={styles.row}>
      <Image source={require('../assets/calconnect-logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.name}>CalConnect</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: { width: 40, height: 40 },
  name: { fontFamily: fonts.bold, fontSize: 24, color: colors.navy },
});
