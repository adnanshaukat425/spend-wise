import { BudgetAmountModal } from "./BudgetAmountModal";

export interface SetTotalBudgetModalProps {
  visible: boolean;
  totalBudget: number;
  saving: boolean;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

export function SetTotalBudgetModal({
  visible,
  totalBudget,
  saving,
  onConfirm,
  onClose,
}: SetTotalBudgetModalProps) {
  return (
    <BudgetAmountModal
      visible={visible}
      title="Adjust Monthly Budget"
      subtitle="Set your total spending limit for this month"
      initialValue={String(totalBudget)}
      saving={saving}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
