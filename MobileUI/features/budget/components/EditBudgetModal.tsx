import type { BudgetCategory } from "@/data/types";

import { BudgetAmountModal } from "./BudgetAmountModal";

export interface EditBudgetModalProps {
  category: BudgetCategory | null;
  saving: boolean;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

export function EditBudgetModal({
  category,
  saving,
  onConfirm,
  onClose,
}: EditBudgetModalProps) {
  return (
    <BudgetAmountModal
      visible={category !== null}
      title={category ? `Edit ${category.name}` : ""}
      subtitle="Set the monthly limit for this category"
      initialValue={category ? String(category.limit) : ""}
      saving={saving}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
