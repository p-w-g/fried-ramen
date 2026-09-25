export type Expense = {
  id: number;
  name: string;
  amount: number;
  description: string;
  category: string | null;
};

export type ExpenseDraft = Pick<Expense, 'name' | 'amount' | 'description'>;

export const sumAmounts = (expenses: Expense[]) =>
  expenses.reduce((total, expense) => total + expense.amount, 0);
