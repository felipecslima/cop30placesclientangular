import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit } from '@angular/core';
import { ApiServices, CategoryPlace, Place } from '../../core/services/api.service';
import { Subscription, tap } from 'rxjs';
import { AutoUnsubscribe, CombineSubscriptions } from '../../shared/decorators/auto-unsubscribe.decorator';
import { DataServices } from '../../shared/services/data.services';
import { DefineLocationServices } from '../../shared/services/define.location.services';
import { MaterialModule } from '../../shared/ material.module';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { ActivatedRoute } from '@angular/router';
import { NgForOf, NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'about-page',
  imports: [MaterialModule, NgStyle, NgIf, NgForOf],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // <- aqui
})
@AutoUnsubscribe()
export class AboutPageComponent implements OnInit, OnDestroy {
  @CombineSubscriptions()
  subscriptions: Subscription | undefined;
  loading = false;
  about: any;

  constructor(
    private route: ActivatedRoute,
    private snackBarService: SnackbarService,
    private apiServices: ApiServices
  ) {
    const aboutSlug = this.route.snapshot.paramMap.get('aboutSlug');

    this.loading = true;
    this.apiServices.getAbout(aboutSlug)
      .pipe(
        tap(about => {
          this.about = about;
          this.loading = false;
        })
      )
      .subscribe({
        error: (error: Error) => {
          this.snackBarService.error(error?.message);
        }
      });


  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }


  protected readonly encodeURIComponent = encodeURIComponent;
}
