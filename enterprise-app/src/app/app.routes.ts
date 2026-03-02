import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'disputes',
    loadComponent: () =>
      import('./disputes/disputes-wrapper.component').then(
        (m) => m.DisputesWrapperComponent
      )
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./transactions/transactions.component').then((m) => m.TransactionsComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
