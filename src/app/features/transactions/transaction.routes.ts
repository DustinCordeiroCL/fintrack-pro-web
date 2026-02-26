import { Routes } from '@angular/router';

export const TRANSACTION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/transaction-list/transaction-list.component').then(m => m.TransactionListComponent)
  }
];