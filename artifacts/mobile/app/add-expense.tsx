import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const CATEGORIES = [
  { id: "food", label: "Food", icon: "restaurant-outline" as const, color: "#FF6B35", bg: "#FFF0E8" },
  { id: "shopping", label: "Shopping", icon: "bag-outline" as const, color: "#8B5CF6", bg: "#F3EEFF" },
  { id: "transport", label: "Transport", icon: "car-outline" as const, color: "#3B82F6", bg: "#EFF6FF" },
  { id: "coffee", label: "Coffee", icon: "cafe-outline" as const, color: "#F59E0B", bg: "#FEF3C7" },
  { id: "bills", label: "Bills", icon: "flash-outline" as const, color: "#EF4444", bg: "#FEE2E2" },
  { id: "health", label: "Health", icon: "fitness-outline" as const, color: "#10B981", bg: "#D1FAE5" },
  { id: "income", label: "Income", icon: "trending-up-outline" as const, color: "#22C55E", bg: "#DCFCE7" },
  { id: "other", label: "Other", icon: "ellipsis-horizontal-outline" as const, color: "#9CA3AF", bg: "#F3F4F6" },
];

export default function AddExpenseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("food");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F8F9FB", paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="close" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Expense</Text>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: botPad + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currency}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#D1D5DB"
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryItem,
                {
                  backgroundColor: selectedCategory === cat.id ? cat.bg : "#FFFFFF",
                  borderColor: selectedCategory === cat.id ? cat.color : "#F3F4F6",
                  borderWidth: selectedCategory === cat.id ? 2 : 1,
                },
              ]}
              onPress={() => {
                setSelectedCategory(cat.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryIcon, { backgroundColor: cat.bg }]}>
                <Ionicons name={cat.icon} size={20} color={cat.color} />
              </View>
              <Text
                style={[
                  styles.categoryLabel,
                  { color: selectedCategory === cat.id ? cat.color : "#6B7280" },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Note</Text>
        <TextInput
          style={[styles.noteInput, { backgroundColor: "#FFFFFF", color: "#111827" }]}
          value={note}
          onChangeText={setNote}
          placeholder="Add a note..."
          placeholderTextColor="#D1D5DB"
          multiline
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: "#111827" },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  amountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  amountLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#9CA3AF", marginBottom: 8 },
  amountRow: { flexDirection: "row", alignItems: "center" },
  currency: { fontSize: 36, fontFamily: "Inter_400Regular", color: "#D1D5DB", marginRight: 4 },
  amountInput: { flex: 1, fontSize: 48, fontFamily: "Inter_700Bold", color: "#111827" },
  sectionLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#374151",
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  categoryItem: {
    width: "22%",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 12,
    gap: 6,
  },
  categoryIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  noteInput: {
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 80,
    textAlignVertical: "top",
  },
});
