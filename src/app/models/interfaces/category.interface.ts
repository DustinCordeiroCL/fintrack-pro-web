import { CategoryType } from '../enums/category-type.enum';

export interface Category {
  id?: number;
  name: string;
  color: string;
  description?: string;
  categoryType?: CategoryType;
  spendingLimit?: number;
}