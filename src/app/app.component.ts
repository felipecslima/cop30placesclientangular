import { Component } from '@angular/core';
import { LayoutModule } from './shared/layout.module';
import { PwaService } from './core/pwa.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    LayoutModule,
  ],
  providers: []
})
export class AppComponent {
  constructor(pwaService: PwaService) {
  }

}
