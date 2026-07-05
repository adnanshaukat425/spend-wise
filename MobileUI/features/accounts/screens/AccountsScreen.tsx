import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  Alert,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ErrorState } from "@/components/ui/ErrorState";
import { Screen, ScreenScrollView } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ScreenLoading } from "@/components/ui/ScreenLoading";
import { spacing } from "@/constants/theme";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { formatCurrency } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";

import { useAccounts, useDeleteAccount } from "../api";

export default function AccountsScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useScreenInsets();
  const qc = useQueryClient();
  const { data: accounts = [], isLoading, isFetching, isError, error, refetch } = useAccounts();
  const deleteAccount = useDeleteAccount();
  const isDeleting = deleteAccount.isPending;

  const handleRefresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["accounts"] });
  }, [qc]);

  const handleDeleteAccount = useCallback(
    (id: string, name: string) => {
      if (deleteAccount.isPending) return;

      Alert.alert(
        "Delete Account",
        `Remove "${name}"? All associated data will be lost.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteAccount.mutate(id),
          },
        ],
      );
    },
    [deleteAccount],
  );

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }

  return (
    <Screen padded={false}>
      <View style={styles.headerWrap}>
        <ScreenHeader onBack={() => router.back()} title="Accounts" />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ScreenLoading label="Loading accounts" />
        </View>
      ) : (
        <ScreenScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl, paddingTop: 0 }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <View style={[styles.summary, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              Total balance
            </Text>
            <Text
              style={[styles.summaryValue, { color: colors.foreground }]}
              testID="accounts-total-balance"
            >
              {formatCurrency(totalBalance)}
            </Text>
          </View>

          {accounts.map((account) => (
            <TouchableOpacity
              key={account.id}
              style={[styles.card, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
              testID={`account-row-${account.id}`}
              onLongPress={() => handleDeleteAccount(account.id, account.name)}
              delayLongPress={600}
              accessibilityHint="Long press to delete"
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
                <Ionicons name={account.icon} size={22} color={account.iconColor} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.foreground }]}>{account.name}</Text>
                <Text style={[styles.type, { color: colors.mutedForeground }]}>
                  {account.type} •••• {account.lastFour}
                </Text>
              </View>
              <Text
                style={[
                  styles.balance,
                  {
                    color: account.balance < 0 ? colors.expense : colors.foreground,
                  },
                ]}
              >
                {formatCurrency(account.balance)}
              </Text>
              <TouchableOpacity
                testID={`delete-account-btn-${account.id}`}
                onPress={() => handleDeleteAccount(account.id, account.name)}
                style={[styles.deleteBtn, isDeleting && styles.deleteBtnDisabled]}
                disabled={isDeleting}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${account.name}`}
                accessibilityState={{ disabled: isDeleting }}
              >
                <Ionicons name="trash-outline" size={18} color={colors.destructive} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.addBtn, { borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => router.push("/add-account")}
            testID="add-account-btn"
          >
            <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
            <Text style={[styles.addText, { color: colors.primary }]}>Connect new account</Text>
          </TouchableOpacity>
        </ScreenScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    alignItems: "center",
    borderRadius: 14,
    borderStyle: "dashed",
    borderWidth: 1.5,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    marginTop: spacing.sm,
    paddingVertical: spacing.lg,
  },
  addText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  balance: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  card: {
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: 10,
    padding: spacing.lg,
  },
  deleteBtn: {
    marginLeft: spacing.xs,
    padding: 6,
  },
  deleteBtnDisabled: {
    opacity: 0.4,
  },
  headerWrap: {
    paddingHorizontal: spacing.xxl,
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  info: { flex: 1 },
  loading: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    marginBottom: 2,
  },
  summary: {
    alignItems: "center",
    borderRadius: 16,
    marginBottom: spacing.lg,
    padding: spacing.xl,
  },
  summaryLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
  },
  type: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
});
