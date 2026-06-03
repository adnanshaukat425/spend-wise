import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useScreenInsets() {
  const insets = useSafeAreaInsets();

  return {
    top: Platform.OS === "web" ? 67 : insets.top,
    bottom: Platform.OS === "web" ? 34 : insets.bottom,
    left: insets.left,
    right: insets.right,
  };
}
