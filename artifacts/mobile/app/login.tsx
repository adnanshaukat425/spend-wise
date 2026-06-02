import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

function GoogleIcon() {
  return (
    <View style={styles.googleIcon}>
      <Text style={styles.googleG}>G</Text>
    </View>
  );
}

function AppleIcon({ color }: { color: string }) {
  return <Ionicons name="logo-apple" size={20} color={color} />;
}

function EnvelopeIcon({ color }: { color: string }) {
  return <Ionicons name="mail-outline" size={20} color={color} />;
}

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleContinue = async (method: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (method === "email") {
      Alert.alert("Email Sign In", "Email sign-in coming soon!", [
        { text: "OK", onPress: () => continueToApp() },
      ]);
    } else {
      await continueToApp();
    }
  };

  const continueToApp = async () => {
    await AsyncStorage.setItem("isLoggedIn", "true");
    router.replace("/(tabs)");
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, paddingTop: topPad, paddingBottom: botPad },
      ]}
    >
      <View style={styles.inner}>
        <View style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>SpendWise</Text>
        </View>

        <View style={styles.headingBlock}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Welcome back</Text>
          <Text style={[styles.subheading, { color: colors.mutedForeground }]}>
            Sign in to continue tracking your expenses
          </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.authButton, styles.outlinedButton, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => handleContinue("google")}
            activeOpacity={0.75}
          >
            <View style={styles.googleG_wrapper}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text style={[styles.authButtonText, { color: colors.foreground }]}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          <View style={styles.orRow}>
            <View style={[styles.orLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.orText, { color: colors.mutedForeground }]}>OR</Text>
            <View style={[styles.orLine, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.authButton, styles.outlinedButton, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => handleContinue("apple")}
            activeOpacity={0.75}
          >
            <Ionicons name="logo-apple" size={20} color={colors.foreground} />
            <Text style={[styles.authButtonText, { color: colors.foreground }]}>
              Continue with Apple
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.authButton, styles.filledButton, { backgroundColor: colors.secondary }]}
            onPress={() => handleContinue("email")}
            activeOpacity={0.75}
          >
            <Ionicons name="mail-outline" size={20} color={colors.foreground} />
            <Text style={[styles.authButtonText, { color: colors.foreground }]}>
              Continue with Email
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          By continuing, you agree to our{" "}
          <Text style={[styles.footerLink, { color: colors.foreground }]}>Terms of Service</Text>
          {" "}and{" "}
          <Text style={[styles.footerLink, { color: colors.foreground }]}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  inner: {
    flex: 1,
    paddingTop: 16,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 40,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },
  appName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  headingBlock: {
    marginBottom: 48,
  },
  heading: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  subheading: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  buttons: {
    gap: 12,
  },
  authButton: {
    height: 54,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  outlinedButton: {
    borderWidth: 1,
  },
  filledButton: {},
  googleG_wrapper: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  googleG: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#4285F4",
  },
  authButtonText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  orLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 1,
  },
  footer: {
    paddingBottom: 8,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
  },
  footerLink: {
    fontFamily: "Inter_500Medium",
    textDecorationLine: "underline",
  },
});
