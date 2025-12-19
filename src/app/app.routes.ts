import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/request-builder/request-builder.component')
      .then(m => m.RequestBuilderComponent)
  },
  {
    path: 'collections',
    loadComponent: () => import('./features/collections/collections.component')
      .then(m => m.CollectionsComponent)
  },
  {
    path: 'environments',
    loadComponent: () => import('./features/environments/environments.component')
      .then(m => m.EnvironmentsComponent)
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/history.component')
      .then(m => m.HistoryComponent)
  },
  { path: '**', redirectTo: '' }
];
