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
    path: 'users',
    loadComponent: () =>
      import('./users/users.component').then((m) => m.UsersComponent)
  },
  {
    path: 'org',
    loadComponent: () =>
      import('./org/org.component').then((m) => m.OrgComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
