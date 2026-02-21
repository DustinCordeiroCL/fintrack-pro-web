import { Routes } from '@angular/router';

export const CATEGORY_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('../categories/pages/category-list/category-list').then(m => m.CategoryList)
  }
];