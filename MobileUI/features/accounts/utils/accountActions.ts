import { Alert } from "react-native";

import type { LinkedAccount } from "@/data/types";

export function getDefaultAccount(accounts: LinkedAccount[]): LinkedAccount | undefined {
  return accounts.find((account) => account.isDefault) ?? accounts[0];
}

export function confirmSetDefaultAccount(
  accountName: string,
  onConfirm: () => void,
): void {
  Alert.alert(
    "Set default account",
    `Set "${accountName}" as your default account? New expenses and income will use this account by default.`,
    [
      { text: "Cancel", style: "cancel" },
      { text: "Set as default", onPress: onConfirm },
    ],
  );
}

interface ConfirmDeleteAccountOptions {
  account: LinkedAccount;
  defaultAccountName: string;
  onDelete: (transferIncome: boolean) => void;
}

export function confirmDeleteAccount({
  account,
  defaultAccountName,
  onDelete,
}: ConfirmDeleteAccountOptions): void {
  if (account.isDefault) {
    Alert.alert(
      "Cannot delete default account",
      "This is your default account. Set another account as default before deleting this one.",
    );
    return;
  }

  Alert.alert(
    "Delete Account",
    `Remove "${account.name}"? All expense transactions will be moved to your default account (${defaultAccountName}).`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Continue",
        onPress: () => {
          if (!account.hasIncomeTransactions) {
            onDelete(false);
            return;
          }

          Alert.alert(
            "Move income transactions?",
            `This account has income transactions. Do you also want to move them to ${defaultAccountName}?`,
            [
              {
                text: "No, expenses only",
                style: "destructive",
                onPress: () => onDelete(false),
              },
              {
                text: "Yes, move income too",
                onPress: () => onDelete(true),
              },
              { text: "Cancel", style: "cancel" },
            ],
          );
        },
      },
    ],
  );
}
