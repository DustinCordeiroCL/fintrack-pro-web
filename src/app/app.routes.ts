// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'categories',
    loadChildren: () => import('../app/features/categories/category.routes').then(m => m.CATEGORY_ROUTES)
  },
  { path: '', redirectTo: 'categories', pathMatch: 'full' }
];