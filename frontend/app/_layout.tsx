import { Slot } from 'expo-router';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { AppStoreProvider } from '../store/AppStore';

export default function RootLayout() {
  const [loaded, error] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold });
  if (!loaded && !error) return null;
  return (
    <AppStoreProvider>
      <Slot />
    </AppStoreProvider>
  );
}
