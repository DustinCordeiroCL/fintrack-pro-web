import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
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
  },
  { path: '**', redirectTo: 'dashboard' }
];
