import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Redirect, Tabs, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useColors } from "@/hooks/useColors";
import { TAB_BAR_HEIGHT } from "@/constants/layout";
import { palette, shadows } from "@/constants/theme";
import { VoiceExpenseModal } from "@/features/voice/components/VoiceExpenseModal";

function VoiceMicFAB({ onPress }: { onPress: () => void }) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.voiceFabWrapper}
      accessibilityRole="button"
      accessibilityLabel="Log expense by voice"
    >
      <View style={[styles.voiceFab, { backgroundColor: colors.card }]}>
        <Ionicons name="mic" size={24} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
}

function AddFAB({ onPress }: { onPress: () => void }) {
  return (
    <FloatingActionButton
      accessibilityLabel="Add expense"
      icon="add"
      onPress={onPress}
      style={styles.fabWrapper}
      testID="add-expense"
    />
  );
}

function ProBadgeIcon({ color }: { color: string }) {
  const isIOS = Platform.OS === "ios";
  return (
    <View style={styles.proIconWrapper}>
      {isIOS ? (
        <SymbolView name="sparkles" tintColor={color} size={22} />
      ) : (
        <Ionicons name="sparkles-outline" size={22} color={color} />
      )}
      <View style={styles.proBadge}>
        <Text style={styles.proBadgeText}>PRO</Text>
      </View>
    </View>
  );
}

export default function TabLayout() {
  const colors = useColors();
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);

  const handleFABPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/add-expense");
  };

  const handleVoiceFABPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVoiceModalVisible(true);
  };

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const isIOS = Platform.OS === "ios";

  return (
    <ErrorBoundary>
      <View style={styles.root}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: isIOS ? "transparent" : colors.card,
            borderTopWidth: 0,
            height: TAB_BAR_HEIGHT,
            ...shadows.card,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: isDark ? 0.2 : shadows.card.shadowOpacity,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: "Inter_500Medium",
            marginTop: 2,
          },
          tabBarBackground: () =>
            isIOS ? (
              <BlurView
                intensity={80}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            ) : null,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarAccessibilityLabel: "Home",
            tabBarIcon: ({ color, focused }) =>
              isIOS ? (
                <SymbolView
                  name={focused ? "house.fill" : "house"}
                  tintColor={color}
                  size={24}
                />
              ) : (
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={24}
                  color={color}
                />
              ),
            tabBarButton: (props) => (
              <Pressable
                {...(props as React.ComponentProps<typeof Pressable>)}
                testID="tab-home"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="budget"
          options={{
            title: "Budget",
            tabBarAccessibilityLabel: "Budget",
            tabBarIcon: ({ color, focused }) =>
              isIOS ? (
                <SymbolView
                  name={focused ? "chart.pie.fill" : "chart.pie"}
                  tintColor={color}
                  size={24}
                />
              ) : (
                <Ionicons
                  name={focused ? "pie-chart" : "pie-chart-outline"}
                  size={24}
                  color={color}
                />
              ),
            tabBarButton: (props) => (
              <Pressable
                {...(props as React.ComponentProps<typeof Pressable>)}
                testID="tab-budget"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="ai"
          options={{
            title: "AI",
            tabBarAccessibilityLabel: "AI",
            tabBarIcon: ({ color }) => <ProBadgeIcon color={color} />,
            tabBarButton: (props) => (
              <Pressable
                {...(props as React.ComponentProps<typeof Pressable>)}
                testID="tab-ai"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarAccessibilityLabel: "Profile",
            tabBarIcon: ({ color, focused }) =>
              isIOS ? (
                <SymbolView
                  name={focused ? "person.fill" : "person"}
                  tintColor={color}
                  size={24}
                />
              ) : (
                <Ionicons
                  name={focused ? "person" : "person-outline"}
                  size={24}
                  color={color}
                />
              ),
            tabBarButton: (props) => (
              <Pressable
                {...(props as React.ComponentProps<typeof Pressable>)}
                testID="tab-profile"
              />
            ),
          }}
        />
      </Tabs>

      {/* AddExpense FAB — centered over tab bar, avoids expo-router href+tabBarButton conflict */}
      <View style={styles.fabOverlay} pointerEvents="box-none">
        <AddFAB onPress={handleFABPress} />
      </View>

      {/* Voice mic FAB — bottom-right corner */}
      <VoiceMicFAB onPress={handleVoiceFABPress} />

      <VoiceExpenseModal
        visible={voiceModalVisible}
        onClose={() => setVoiceModalVisible(false)}
      />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fabWrapper: {
    marginTop: -20,
  },
  proIconWrapper: { alignItems: "center", justifyContent: "center" },
  proBadge: {
    position: "absolute",
    top: -4,
    right: -10,
    backgroundColor: palette.amber500,
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  proBadgeText: {
    fontSize: 7,
    fontFamily: "Inter_700Bold",
    color: palette.white,
    letterSpacing: 0.3,
  },
  fabOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT + 20,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 4,
    pointerEvents: "box-none",
  },
  voiceFabWrapper: {
    position: "absolute",
    bottom: TAB_BAR_HEIGHT + 16,
    right: 20,
    zIndex: 100,
  },
  voiceFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.floating,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
});
