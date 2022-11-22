export interface labels_list {
  [key: string]: string[];
}

export interface label_payload {
  list: string;
  Label: string;
  Id?: number;
}
export interface expense_list {
  [key: string]: expense_model[];
}

export interface expense_model {
  Expense: string;
  Amount: number;
  Description?: string;
  Id: number;
  Label?: string;
  isPostponed: boolean;
}

export interface expense_payload extends expense_model {
  list: string;
}
