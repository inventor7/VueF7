export interface ExpenseRecord {
  id: string;
  group_id: string;
  paid_by: string;
  amount: number;
  description: string;
  category: string | null;
  date: string;
  created_at: string;
}

export interface SplitRecord {
  id: string;
  expense_id: string;
  user_id: string;
  amount_owed: number;
  group_id: string;
}

export interface SettlementRecord {
  id: string;
  group_id: string;
  payer_id: string;
  receiver_id: string;
  amount: number;
  date: string;
}
