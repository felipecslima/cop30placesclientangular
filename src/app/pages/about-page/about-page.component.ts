import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit } from '@angular/core';
import { ApiServices } from '../../core/services/api.service';
import { Subscription, tap } from 'rxjs';
import { AutoUnsubscribe, CombineSubscriptions } from '../../shared/decorators/auto-unsubscribe.decorator';
import { MaterialModule } from '../../shared/ material.module';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { ActivatedRoute } from '@angular/router';
import { NgIf, NgStyle } from '@angular/common';
import { environment } from '../../../environments/environment';
import { SeoService } from '../../shared/services/seo.service';

@Component({
  selector: 'about-page',
  imports: [MaterialModule, NgStyle, NgIf],
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
    private seoService: SeoService,
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
          this.seoService.updateTags({
            title: about.title,
            image: about?.images[0]?.url ?? undefined,
            description: about.subtitle,
            url: `${ environment.loginRedirect }/sobre/${ aboutSlug }`
          });

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
