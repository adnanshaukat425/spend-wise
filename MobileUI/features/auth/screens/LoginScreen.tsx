import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { Screen } from "@/components/ui/Screen";
import { useColors } from "@/hooks/useColors";
import { isApiConfigured } from "@/lib/api";

const DEV_GOOGLE_TOKEN = "dev-google:mobile-user:test@gmail.com";
const DEV_APPLE_TOKEN = "dev-apple:mobile-user:test@icloud.com";
// Allow dev token bypass in E2E builds (EXPO_PUBLIC_E2E_ENABLED=1) even when __DEV__ is false
const IS_E2E_OR_DEV = __DEV__ || process.env.EXPO_PUBLIC_E2E_ENABLED === "1";

export default function LoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [loading, setLoading] = useState(false);

  const finishSignIn = async (action: () => Promise<void>) => {
    if (!isApiConfigured()) {
      Alert.alert(
        "API not configured",
        "Set EXPO_PUBLIC_API_URL in your environment (see .env.example).",
      );
      return;
    }
    setLoading(true);
    try {
      await action();
      router.replace("/(tabs)");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      Alert.alert("Sign in failed", message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async (method: "google" | "apple" | "email") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (method === "email") {
      Alert.alert("Email Sign In", "Email sign-in coming soon!");
      return;
    }
    if (method === "google") {
      const token = IS_E2E_OR_DEV ? DEV_GOOGLE_TOKEN : "";
      if (!token) {
        Alert.alert("Google Sign In", "Google sign-in is not configured for production builds yet.");
        return;
      }
      await finishSignIn(() => signInWithGoogle(token));
      return;
    }
    const token = IS_E2E_OR_DEV ? DEV_APPLE_TOKEN : "";
    if (!token) {
      Alert.alert("Apple Sign In", "Apple sign-in is not configured for production builds yet.");
      return;
    }
    await finishSignIn(() => signInWithApple(token));
  };

  return (
    <Screen style={{ backgroundColor: colors.card }}>
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
            disabled={loading}
            testID="google-login-btn"
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
            disabled={loading}
            testID="apple-login-btn"
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
            disabled={loading}
            testID="email-login-btn"
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
    </Screen>
  );
}

const styles = StyleSheet.create({
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
