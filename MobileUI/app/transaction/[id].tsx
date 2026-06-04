import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useDeleteTransaction, useTransaction, useUpdateTransaction } from "@/hooks/api";
import { formatCurrency } from "@/lib/format";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useScreenInsets();
  const { data: tx, isLoading } = useTransaction(id);
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const [editMode, setEditMode] = useState(false);
  const [editNote, setEditNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (tx) {
      setEditNote(tx.note ?? "");
    }
  }, [tx]);

  const handleEdit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditMode(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditMode(false);
    setEditNote(tx?.note ?? "");
  }, [tx]);

  const handleSave = useCallback(async () => {
    if (!id || !tx) return;
    setSaving(true);
    try {
      await updateTransaction.mutateAsync({ id, body: { note: editNote || null } });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditMode(false);
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }, [id, tx, editNote, updateTransaction]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!id) return;
            setDeleting(true);
            try {
              await deleteTransaction.mutateAsync(id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (err) {
              Alert.alert("Error", err instanceof Error ? err.message : "Could not delete transaction.");
              setDeleting(false);
            }
          },
        },
      ],
    );
  }, [id, deleteTransaction, router]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Transaction" onBack={() => router.back()} />
        <View style={styles.notFound}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!tx) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Transaction" onBack={() => router.back()} />
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>
            Transaction not found
          </Text>
        </View>
      </View>
    );
  }

  const isIncome = tx.amount > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={editMode ? "Edit Transaction" : "Transaction"}
        onBack={editMode ? handleCancelEdit : () => router.back()}
        rightAction={
          !editMode ? (
            <View style={styles.headerActions}>
              <TouchableOpacity
                testID="edit-transaction-btn"
                onPress={handleEdit}
                style={styles.headerBtn}
                accessibilityRole="button"
                accessibilityLabel="Edit transaction"
              >
                <Ionicons name="create-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                testID="delete-transaction-btn"
                onPress={handleDelete}
                style={styles.headerBtn}
                disabled={deleting}
                accessibilityRole="button"
                accessibilityLabel="Delete transaction"
              >
                {deleting ? (
                  <ActivityIndicator size="small" color={colors.destructive} />
                ) : (
                  <Ionicons name="trash-outline" size={22} color={colors.destructive} />
                )}
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.iconWrap, { backgroundColor: tx.iconBg }]}>
            <Ionicons name={tx.icon} size={28} color={tx.iconColor} />
          </View>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {tx.name}
          </Text>
          <Text
            style={[
              styles.amount,
              { color: isIncome ? colors.success : colors.expense },
            ]}
            testID="transaction-detail-amount"
          >
            {isIncome ? "+" : "-"}
            {formatCurrency(Math.abs(tx.amount))}
          </Text>
          <Text style={[styles.category, { color: colors.mutedForeground }]} testID="transaction-detail-category">
            {tx.category}
          </Text>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
          <DetailRow label="Date" value={tx.date} colors={colors} />
          <DetailRow label="Time" value={tx.time} colors={colors} />
          <DetailRow label="Type" value={isIncome ? "Income" : "Expense"} colors={colors} />

          {/* Note — editable in edit mode */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Note</Text>
            {editMode ? (
              <TextInput
                testID="note-input"
                style={[styles.editInput, { color: colors.foreground, borderColor: colors.border }]}
                value={editNote}
                onChangeText={setEditNote}
                placeholder="Add a note…"
                placeholderTextColor={colors.mutedForeground}
                multiline
                returnKeyType="done"
              />
            ) : (
              <Text style={[styles.detailValue, { color: colors.foreground }]}>
                {tx.note || "—"}
              </Text>
            )}
          </View>
        </View>

        {tx.receiptUri ? (
          <View style={[styles.receiptCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.receiptLabel, { color: colors.foreground }]}>Receipt</Text>
            <Image source={{ uri: tx.receiptUri }} style={styles.receiptImage} resizeMode="cover" />
          </View>
        ) : null}

        {editMode && (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: colors.muted }]}
              onPress={handleCancelEdit}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="edit-transaction-save-btn"
              style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function DetailRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  headerActions: { flexDirection: "row", gap: 4 },
  headerBtn: { padding: 8 },
  card: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  name: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 8 },
  amount: { fontSize: 32, fontFamily: "Inter_700Bold", marginBottom: 4 },
  category: { fontSize: 14, fontFamily: "Inter_400Regular" },
  detailsCard: { borderRadius: 16, padding: 16, marginBottom: 16, gap: 12 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  detailLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  detailValue: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1, textAlign: "right" },
  editInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: 36,
  },
  receiptCard: { borderRadius: 16, padding: 16 },
  receiptLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  receiptImage: { width: "100%", height: 200, borderRadius: 12 },
  editActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  saveBtn: {
    flex: 2,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
});
