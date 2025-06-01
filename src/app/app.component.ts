import { Component } from '@angular/core';
import { LayoutModule } from './shared/layout.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    LayoutModule,
  ],
  providers: [
  ]
})
export class AppComponent {
}
