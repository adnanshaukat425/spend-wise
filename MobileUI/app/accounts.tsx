import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAccounts, useDeleteAccount } from "@/hooks/api";
import { formatCurrency } from "@/lib/format";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";
import { useQueryClient } from "@tanstack/react-query";

export default function AccountsScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useScreenInsets();
  const qc = useQueryClient();
  const { data: accounts = [], isLoading, isFetching } = useAccounts();
  const deleteAccount = useDeleteAccount();

  const handleRefresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["accounts"] });
  }, [qc]);

  const handleDeleteAccount = useCallback((id: string, name: string) => {
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
  }, [deleteAccount]);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          testID="screen-back-btn"
        >
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Accounts
        </Text>
        <View style={styles.headerBtn} />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 24,
          }}
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
            <Text style={[styles.summaryValue, { color: colors.foreground }]} testID="accounts-total-balance">
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
              <View
                style={[styles.iconWrap, { backgroundColor: colors.secondary }]}
              >
                <Ionicons
                  name={account.icon}
                  size={22}
                  color={account.iconColor}
                />
              </View>
              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.foreground }]}>
                  {account.name}
                </Text>
                <Text style={[styles.type, { color: colors.mutedForeground }]}>
                  {account.type} •••• {account.lastFour}
                </Text>
              </View>
              <Text
                style={[
                  styles.balance,
                  {
                    color:
                      account.balance < 0 ? colors.expense : colors.foreground,
                  },
                ]}
              >
                {formatCurrency(account.balance)}
              </Text>
              <TouchableOpacity
                testID={`delete-account-btn-${account.id}`}
                onPress={() => handleDeleteAccount(account.id, account.name)}
                style={styles.deleteBtn}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${account.name}`}
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
            <Text style={[styles.addText, { color: colors.primary }]}>
              Connect new account
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
    paddingVertical: 14,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  summary: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  deleteBtn: {
    padding: 6,
    marginLeft: 4,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  type: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  balance: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  addText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
