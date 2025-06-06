import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './ material.module';
import { ShellComponent } from './layout/shell/shell.component';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MapboxMapComponent } from '../features/mapbox-map/mapbox-map.component';
import { OpenStreetMapComponent } from '../features/openstreet-map/openstreetmap-map.component';

@NgModule({
  declarations: [
    ShellComponent,
  ],
  exports: [
    ShellComponent
  ],
  imports: [
    RouterOutlet,
    MaterialModule,
    CommonModule,
    MapboxMapComponent,
    OpenStreetMapComponent,
    RouterLink
  ]
})
export class LayoutModule {
}
