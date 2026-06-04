import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useScreenInsets() {
  const insets = useSafeAreaInsets();

  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
  };
}
