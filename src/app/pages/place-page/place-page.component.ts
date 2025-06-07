import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit } from '@angular/core';
import { ApiServices, CategoryPlace, Place } from '../../core/services/api.service';
import { Subscription, tap } from 'rxjs';
import { AutoUnsubscribe, CombineSubscriptions } from '../../shared/decorators/auto-unsubscribe.decorator';
import { DataServices } from '../../shared/services/data.services';
import { MaterialModule } from '../../shared/ material.module';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { ActivatedRoute } from '@angular/router';
import { NgForOf, NgIf, NgStyle } from '@angular/common';
import { SeoService } from '../../shared/services/seo.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'place-page',
  imports: [MaterialModule, NgStyle, NgIf, NgForOf],
  templateUrl: './place-page.component.html',
  styleUrl: './place-page.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // <- aqui
})
@AutoUnsubscribe()
export class PlacePageComponent implements OnInit, OnDestroy {
  @CombineSubscriptions()
  subscriptions: Subscription | undefined;
  loading = false;
  place: Place;
  categoryPlaces: CategoryPlace[] = [];
  selectedImage: string | null = null;


  constructor(
    private seoService: SeoService,
    private route: ActivatedRoute,
    private snackBarService: SnackbarService,
    private dataService: DataServices,
    private apiServices: ApiServices
  ) {
    const placeSlug = this.route.snapshot.paramMap.get('placeSlug');

    console.log(this.dataService.getCategoryPlaces().map(cp => {
      return `${ cp?.id }-${ cp?.place?.slug }`;
    }));

    this.place = this.dataService.getCategoryPlaces()?.find(cp => cp?.place?.slug === placeSlug)?.place;
    this.setSeo();
    this.loading = true;
    this.apiServices.getCategoryPlacesByPlaceSlug(placeSlug)
      .pipe(
        tap(categoryPlaces => {
          const [categoryPlace] = categoryPlaces;
          this.place = categoryPlace?.place;
          this.setSeo();
          this.categoryPlaces = categoryPlaces;
          this.loading = false;
        })
      )
      .subscribe({
        error: (error: Error) => {
          console.error(error);
          this.snackBarService.error(error?.message);
        }
      });


  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }


  protected readonly encodeURIComponent = encodeURIComponent;

  openImage(url: string): void {
    this.selectedImage = url;
  }


  setSeo() {
    if (this.place) {
      const detailArr = [];
      this.place.details.forEach(detail => {
        return detail.children.forEach(c => {
          detailArr.push(c.text);
        });
      });
      this.seoService.updateTags({
        title: this.place?.name,
        image: this.place?.images?.length ? this.place?.images[0]?.url : undefined,
        description: detailArr?.join(' ') ?? undefined,
        url: `${ environment.loginRedirect }/lugar/${ this.place?.slug }`
      });
    }
  }
}
