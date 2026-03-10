import { Transaction } from './transaction.interface';

export interface DashboardResponse {
  totalIncome:   number;
  totalExpense:  number;
  balance:       number;
  transactions:  Transaction[];
}