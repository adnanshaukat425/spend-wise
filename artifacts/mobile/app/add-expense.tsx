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
  { id: "food", label: "Food", icon: "restaurant-outline" as const },
  { id: "transport", label: "Transport", icon: "car-outline" as const },
  { id: "shopping", label: "Shopping", icon: "bag-outline" as const },
  { id: "coffee", label: "Coffee", icon: "cafe-outline" as const },
  { id: "home", label: "Home", icon: "home-outline" as const },
  { id: "utilities", label: "Utilities", icon: "flash-outline" as const },
  { id: "health", label: "Health", icon: "heart-outline" as const },
  { id: "travel", label: "Travel", icon: "airplane-outline" as const },
  { id: "fun", label: "Fun", icon: "game-controller-outline" as const },
  { id: "education", label: "Education", icon: "school-outline" as const },
];

const QUICK_TAGS = ["Lunch", "Groceries", "Gas", "Subscription", "Gift"];

export default function AddExpenseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("food");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const toggleTag = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.headerBtn}>
          <Ionicons name="close" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <TouchableOpacity activeOpacity={0.7} style={styles.headerBtn}>
          <Ionicons name="camera-outline" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount */}
        <Text style={styles.sectionLabel}>Amount</Text>
        <View style={styles.amountField}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#C0C6CF"
            keyboardType="decimal-pad"
            autoFocus={Platform.OS !== "web"}
          />
        </View>

        {/* Pay From */}
        <Text style={styles.sectionLabel}>Pay from</Text>
        <TouchableOpacity style={styles.accountRow} activeOpacity={0.7}>
          <View style={styles.accountIcon}>
            <Ionicons name="business-outline" size={20} color="#3B82F6" />
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>Checking Account</Text>
            <Text style={styles.accountBalance}>Balance: $8,500</Text>
          </View>
          <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Category */}
        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryItem,
                  isSelected && styles.categoryItemSelected,
                ]}
                onPress={() => {
                  setSelectedCategory(cat.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icon}
                  size={22}
                  color={isSelected ? colors.primary : "#6B7280"}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    isSelected && { color: colors.primary, fontFamily: "Inter_600SemiBold" },
                  ]}
                  numberOfLines={1}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Note */}
        <Text style={styles.sectionLabel}>Note (optional)</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Add a note..."
          placeholderTextColor="#C0C6CF"
          multiline
        />

        {/* Quick Tags */}
        <Text style={styles.sectionLabel}>Quick Tags</Text>
        <View style={styles.tagsRow}>
          {QUICK_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagChip,
                  isSelected && { backgroundColor: colors.secondary, borderColor: colors.primary },
                ]}
                onPress={() => toggleTag(tag)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tagText,
                    isSelected && { color: colors.primary, fontFamily: "Inter_500Medium" },
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Add Expense Button */}
      <View
        style={[
          styles.footer,
          { paddingBottom: botPad + 16 },
        ]}
      >
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>Add Expense</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#F5F6F9",
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
  },
  scroll: {
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginBottom: 10,
    marginTop: 20,
  },
  amountField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECEEF3",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  currencySymbol: {
    fontSize: 20,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Inter_400Regular",
    color: "#111827",
    padding: 0,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECEEF3",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  accountInfo: { flex: 1 },
  accountName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginBottom: 2,
  },
  accountBalance: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryItem: {
    width: "18%",
    aspectRatio: 1,
    backgroundColor: "#ECEEF3",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    flexGrow: 1,
    maxWidth: "19%",
  },
  categoryItemSelected: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
  },
  noteInput: {
    backgroundColor: "#ECEEF3",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#111827",
    minHeight: 70,
    textAlignVertical: "top",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#ECEEF3",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  tagText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#374151",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "#F5F6F9",
  },
  addBtn: {
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2E7D52",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
