import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/map-page/map.component').then((m) => m.MapComponent),
    data: { animation: 'Home' }
  },
  {
    path: 'lugar/:placeSlug',
    loadComponent: () =>
      import('./pages/place-page/place-page.component').then((m) => m.PlacePageComponent),
    data: { animation: 'PlacePage' }
  },
  {
    path: 'sobre/:aboutSlug',
    loadComponent: () =>
      import('./pages/about-page/about-page.component').then((m) => m.AboutPageComponent),
    data: { animation: 'PlacePage' }
  },
];
