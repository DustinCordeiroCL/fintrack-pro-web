// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'categories', pathMatch: 'full' },
  {
    path: 'categories',
    loadChildren: () => import('../app/features/categories/category.routes').then(m => m.CATEGORY_ROUTES)
  },
  {
    path: 'transactions',
    loadChildren: () => import('../app/features/transactions/transaction.routes').then(m => m.TRANSACTION_ROUTES)
  },
];