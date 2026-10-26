import { Redirect, Slot } from 'expo-router';
import { AppShell } from '../../components/AppShell';
import { useAppStore } from '../../store/AppStore';

export default function AppLayout() {
  const { state } = useAppStore();
  if (!state.signedIn) return <Redirect href="/" />;
  return (
    <AppShell>
      <Slot />
    </AppShell>
  );
}
