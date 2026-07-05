import { formatMoney, getSignedTransactionAmount, normalizeMoneyAmount } from "./money";

function assertEqual<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, received ${String(actual)}`);
  }
}

assertEqual(normalizeMoneyAmount(10.129), 10.13);
assertEqual(getSignedTransactionAmount(42, "expense"), -42);
assertEqual(getSignedTransactionAmount(42, "income"), 42);
assertEqual(formatMoney(-12.5), "-$12.50");
