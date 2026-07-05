import { z } from "zod";

export const expenseSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((value) => !Number.isNaN(parseFloat(value)) && parseFloat(value) > 0, {
      message: "Enter a valid amount greater than 0",
    }),
  categorySlug: z.string().min(1, "Select a category"),
  accountId: z.string().min(1, "Select an account"),
  note: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
