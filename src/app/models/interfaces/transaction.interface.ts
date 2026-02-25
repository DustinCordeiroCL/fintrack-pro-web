import { TransactionType } from "../enums/transaction-type.enum";
import { Category } from "./category.interface";

export interface Transaction {
    id?: number;
    description?: string;
    amount: number;
    date: Date | string;
    type: TransactionType;
    category: Category;
}