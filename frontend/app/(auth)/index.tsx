import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function Home() {
  const router = useRouter();
  return (
    <View style={styles.screen}>
      <View style={styles.column}>
        <Image source={require('../../assets/calconnect-logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>CalConnect</Text>
        <View style={styles.buttons}>
          <Button title="Login" variant="white" onPress={() => router.push('/login')} />
          <Button title="Sign up" variant="gold" onPress={() => router.push('/signup')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  column: { width: '100%', maxWidth: 280, alignItems: 'stretch' },
  logo: { width: 160, height: 160, alignSelf: 'center' },
  title: { fontFamily: fonts.bold, fontSize: 32, color: colors.white, textAlign: 'center', marginVertical: spacing.xl },
  buttons: { gap: spacing.md },
});
