import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'categories',
        loadChildren: () =>
          import('./features/categories/category.routes')
            .then(m => m.CATEGORY_ROUTES)
      },
      {
        path: 'transactions',
        loadChildren: () =>
          import('./features/transactions/transaction.routes')
            .then(m => m.TRANSACTION_ROUTES)
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes')
            .then(m => m.DASHBOARD_ROUTES)
      },
    ]
  }
];