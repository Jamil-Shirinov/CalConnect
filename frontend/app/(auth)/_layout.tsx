import { Redirect, Slot } from 'expo-router';
import { useAppStore } from '../../store/AppStore';

export default function AuthLayout() {
  const { state } = useAppStore();
  if (state.signedIn) return <Redirect href="/dashboard" />;
  return <Slot />;
}
