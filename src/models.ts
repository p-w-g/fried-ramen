export class expenseModel {
  Expense: string;
  Amount: number;
  Description?: string;
  Id: number;
  Label?: string;
  isPostponed: boolean;

  constructor() {
    this.Expense = '';
    this.Amount = 0;
    this.Description = '';
    this.Id = 0;
    this.Label = '';
    this.isPostponed = false;
  }
}
