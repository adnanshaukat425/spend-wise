import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { IconName } from "@/data/types";
import { useColors } from "@/hooks/useColors";

export interface CategoryOption {
  id: string;
  icon: IconName;
  label: string;
}

interface CategoryPickerProps {
  categories: CategoryOption[];
  selectedCategory: string;
  onSelect: (id: string) => void;
}

export function CategoryPicker({
  categories,
  selectedCategory,
  onSelect,
}: CategoryPickerProps) {
  const colors = useColors();

  return (
    <View style={styles.categoryGrid}>
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryItem,
              { backgroundColor: colors.muted },
              isSelected && {
                backgroundColor: colors.card,
                borderColor: colors.primary,
                borderWidth: 2,
              },
            ]}
            onPress={() => {
              onSelect(cat.id);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={cat.icon}
              size={22}
              color={isSelected ? colors.primary : colors.mutedForeground}
            />
            <Text
              style={[
                styles.categoryLabel,
                { color: colors.mutedForeground },
                isSelected && {
                  color: colors.primary,
                  fontFamily: "Inter_600SemiBold",
                },
              ]}
              numberOfLines={1}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryItem: {
    width: "18%",
    aspectRatio: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    flexGrow: 1,
    maxWidth: "19%",
  },
  categoryLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
