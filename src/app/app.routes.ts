import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/map.component').then((m) => m.MapComponent),
  },
  // outras rotas aqui, se necessário
];
