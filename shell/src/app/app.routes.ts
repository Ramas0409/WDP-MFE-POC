import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'disputes',
    pathMatch: 'full'
  },
  {
    // Lazy-load the disputes wrapper; it will then lazy-load the MFE itself.
    path: 'disputes',
    loadComponent: () =>
      import('./disputes/disputes-wrapper.component').then(
        (m) => m.DisputesWrapperComponent
      )
  },
  {
    path: '**',
    redirectTo: 'disputes'
  }
];
