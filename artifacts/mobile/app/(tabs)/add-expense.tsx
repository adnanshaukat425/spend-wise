import React from "react";
import { View } from "react-native";

// Dummy screen — the tab press is intercepted by the FAB button
// and navigates to the add-expense stack screen instead.
export default function AddExpensePlaceholder() {
  return <View style={{ flex: 1 }} />;
}
