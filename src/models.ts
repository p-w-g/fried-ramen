export class expenseModel {
  Expense: string;
  Amount: number;
  Id: number;
  Label?: string;
  isPostponed: boolean;

  constructor() {
    this.Expense = '';
    this.Amount = 0;
    this.Id = 0;
    this.Label = '';
    this.isPostponed = false;
  }
}
