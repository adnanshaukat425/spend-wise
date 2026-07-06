import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter, type Href } from "expo-router";
import React from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { spacing } from "@/constants/theme";
import type { LinkedAccount } from "@/data/types";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { formatCurrency } from "@/lib/format";

export interface AccountSelectModalProps {
  visible: boolean;
  accounts: LinkedAccount[];
  selectedAccountId: string;
  onSelect: (accountId: string) => void;
  onClose: () => void;
}

export function AccountSelectModal({
  visible,
  accounts,
  selectedAccountId,
  onSelect,
  onClose,
}: AccountSelectModalProps) {
  const router = useRouter();
  const colors = useColors();
  const insets = useScreenInsets();

  const handleSelect = (accountId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(accountId);
    onClose();
  };

  const handleManageAccounts = () => {
    onClose();
    router.push("/accounts" as Href);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: spacing.lg,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
        testID="account-select-modal"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Select Account</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close account picker"
            testID="account-select-close-btn"
          >
            <Ionicons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {accounts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No accounts yet
            </Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
              Connect a bank or card to track balances and assign transactions.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {accounts.map((account) => {
              const isSelected = account.id === selectedAccountId;
              return (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.row,
                    { backgroundColor: colors.card },
                    isSelected && {
                      borderColor: colors.primary,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => handleSelect(account.id)}
                  activeOpacity={0.7}
                  testID={`account-select-row-${account.id}`}
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
                      { color: account.balance < 0 ? colors.expense : colors.foreground },
                    ]}
                  >
                    {formatCurrency(account.balance)}
                  </Text>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <TouchableOpacity
          style={[styles.manageBtn, { borderColor: colors.border }]}
          onPress={handleManageAccounts}
          activeOpacity={0.7}
          testID="account-select-manage-btn"
        >
          <Ionicons name="settings-outline" size={18} color={colors.primary} />
          <Text style={[styles.manageText, { color: colors.primary }]}>Manage accounts</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  balance: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    marginRight: spacing.xs,
  },
  closeBtn: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
  },
  emptyBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    marginTop: spacing.lg,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  info: { flex: 1 },
  listContent: {
    gap: 10,
    paddingBottom: spacing.lg,
  },
  manageBtn: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
  },
  manageText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    marginBottom: 2,
  },
  row: {
    alignItems: "center",
    borderRadius: 14,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: {
    flex: 1,
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  type: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
});
