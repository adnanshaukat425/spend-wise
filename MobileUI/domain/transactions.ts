import type { ReceiptAttachment, TransactionType } from "./types";
import { getSignedTransactionAmount, normalizeMoneyAmount } from "./money";

export interface TransactionDraft {
  amount: number;
  type: TransactionType;
  categoryId?: string;
  accountId?: string;
  occurredAt?: Date;
  note?: string;
  receipt?: ReceiptAttachment;
  voiceConfidence?: number;
}

export interface TransactionValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof TransactionDraft, string>>;
}

export function normalizeTransactionAmount(amount: number, type: TransactionType): number {
  return getSignedTransactionAmount(amount, type);
}

export function validateTransactionDraft(draft: TransactionDraft): TransactionValidationResult {
  const errors: TransactionValidationResult["errors"] = {};
  const normalized = normalizeMoneyAmount(draft.amount);

  if (normalized <= 0) {
    errors.amount = "Enter an amount greater than zero.";
  }

  if (!draft.categoryId) {
    errors.categoryId = "Choose a category.";
  }

  if (!draft.accountId) {
    errors.accountId = "Choose an account.";
  }

  if (draft.voiceConfidence !== undefined && draft.voiceConfidence < 0.75) {
    errors.voiceConfidence = "Review the parsed expense before saving.";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
