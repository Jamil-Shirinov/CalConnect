import { useWindowDimensions } from 'react-native';

export function useIsWide(): boolean {
  return useWindowDimensions().width >= 768;
}
