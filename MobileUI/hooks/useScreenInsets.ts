import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useScreenInsets() {
  const insets = useSafeAreaInsets();

  return {
    bottom: insets.bottom,
    contentBottom: insets.bottom + 24,
    contentTop: insets.top + 16,
    left: insets.left,
    right: insets.right,
    top: insets.top,
  };
}
