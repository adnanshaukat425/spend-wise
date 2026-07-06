import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

import { EmptyState } from "@/components/ui/EmptyState";
import { QueryScreenBoundary } from "@/components/ui/QueryScreenBoundary";
import { Screen, ScreenScrollView } from "@/components/ui/Screen";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { spacing } from "@/constants/theme";
import type { LinkedAccount } from "@/data/types";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/lib/format";
import { queryKeys } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

import { useAccounts, useDeleteAccount, useSetDefaultAccount } from "../queries";
import {
  confirmDeleteAccount,
  confirmSetDefaultAccount,
  getDefaultAccount,
} from "../utils/accountActions";

export default function AccountsScreen() {
  const router = useRouter();
  const colors = useColors();
  const qc = useQueryClient();
  const accountsQuery = useAccounts();
  const deleteAccount = useDeleteAccount();
  const setDefaultAccount = useSetDefaultAccount();
  const isDeleting = deleteAccount.isPending;
  const isSettingDefault = setDefaultAccount.isPending;

  const handleRefresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: queryKeys.accounts });
  }, [qc]);

  const handleSetDefault = useCallback(
    (account: LinkedAccount) => {
      if (account.isDefault || setDefaultAccount.isPending) return;

      confirmSetDefaultAccount(account.name, () => {
        setDefaultAccount.mutate(account.id, {
          onError: (err) => {
            Alert.alert(
              "Could not update",
              err instanceof Error ? err.message : "Something went wrong.",
            );
          },
        });
      });
    },
    [setDefaultAccount],
  );

  const handleDeleteAccount = useCallback(
    (account: LinkedAccount, accounts: LinkedAccount[]) => {
      if (deleteAccount.isPending) return;

      const defaultAccount = getDefaultAccount(accounts);
      if (!defaultAccount) return;

      confirmDeleteAccount({
        account,
        defaultAccountName: defaultAccount.name,
        onDelete: (transferIncome) => {
          deleteAccount.mutate(
            { id: account.id, transferIncome },
            {
              onError: (err) => {
                Alert.alert(
                  "Could not delete",
                  err instanceof Error ? err.message : "Something went wrong.",
                );
              },
            },
          );
        },
      });
    },
    [deleteAccount],
  );

  return (
    <QueryScreenBoundary
      empty={
        <Screen padded={false}>
          <View style={styles.headerWrap}>
            <ScreenHeader onBack={() => router.back()} title="Accounts" />
          </View>
          <EmptyState
            icon="wallet-outline"
            message="Connect a bank or card to start tracking balances."
            title="No accounts yet"
          />
          <TouchableOpacity
            style={[styles.addBtn, styles.emptyAddBtn, { borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => router.push("/add-account")}
            testID="add-account-btn"
          >
            <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
            <Text style={[styles.addText, { color: colors.primary }]}>Connect new account</Text>
          </TouchableOpacity>
        </Screen>
      }
      isEmpty={(accounts) => accounts.length === 0}
      loadingLabel="Loading accounts"
      query={accountsQuery}
    >
      {(accounts) => {
        const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

        return (
          <Screen padded={false}>
            <View style={styles.headerWrap}>
              <ScreenHeader onBack={() => router.back()} title="Accounts" />
            </View>

            <ScreenScrollView
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  onRefresh={handleRefresh}
                  refreshing={accountsQuery.isFetching && !accountsQuery.isLoading}
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
                  onPress={() => router.push(`/account/${account.id}`)}
                  onLongPress={() => handleDeleteAccount(account, accounts)}
                  delayLongPress={600}
                  accessibilityHint="Tap to edit, long press to delete"
                >
                  <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
                    <Ionicons name={account.icon} size={22} color={account.iconColor} />
                  </View>
                  <View style={styles.info}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.name, { color: colors.foreground }]}>{account.name}</Text>
                      {account.isDefault ? (
                        <View
                          style={[styles.defaultBadge, { backgroundColor: colors.secondary }]}
                          testID={`account-default-badge-${account.id}`}
                        >
                          <Text style={[styles.defaultBadgeText, { color: colors.primary }]}>
                            Default
                          </Text>
                        </View>
                      ) : null}
                    </View>
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
                  {!account.isDefault ? (
                    <TouchableOpacity
                      testID={`account-set-default-btn-${account.id}`}
                      onPress={() => handleSetDefault(account)}
                      style={[styles.starBtn, isSettingDefault && styles.starBtnDisabled]}
                      disabled={isSettingDefault}
                      accessibilityRole="button"
                      accessibilityLabel={`Set ${account.name} as default`}
                    >
                      <Ionicons name="star-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    testID={`delete-account-btn-${account.id}`}
                    onPress={() => handleDeleteAccount(account, accounts)}
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
          </Screen>
        );
      }}
    </QueryScreenBoundary>
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
  defaultBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  defaultBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
  },
  deleteBtn: {
    marginLeft: spacing.xs,
    padding: 6,
  },
  deleteBtnDisabled: {
    opacity: 0.4,
  },
  emptyAddBtn: {
    marginHorizontal: spacing.xxl,
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
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 2,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    paddingTop: 0,
  },
  starBtn: {
    padding: 6,
  },
  starBtnDisabled: {
    opacity: 0.4,
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
