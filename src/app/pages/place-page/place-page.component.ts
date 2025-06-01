import { Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, OnInit } from '@angular/core';
import { ApiServices, CategoryPlace, Place } from '../../core/services/api.service';
import { Subscription, tap } from 'rxjs';
import { AutoUnsubscribe, CombineSubscriptions } from '../../shared/decorators/auto-unsubscribe.decorator';
import { DataServices } from '../../shared/services/data.services';
import { DefineLocationServices } from '../../shared/services/define.location.services';
import { MaterialModule } from '../../shared/ material.module';
import { SnackbarService } from '../../shared/services/ snackbar.service';
import { ActivatedRoute } from '@angular/router';
import { NgForOf, NgIf, NgStyle } from '@angular/common';

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
    private route: ActivatedRoute,
    private snackBarService: SnackbarService,
    private dataService: DataServices,
    private defineLocationServices: DefineLocationServices,
    private apiServices: ApiServices
  ) {
    const placeSlug = this.route.snapshot.paramMap.get('placeSlug');

    this.place = this.dataService.getCategoryPlaces()?.find(cp => cp.place.slug === placeSlug)?.place

    this.loading = true;
    this.apiServices.getCategoryPlacesByPlaceSlug(placeSlug)
      .pipe(
        tap(categoryPlaces => {
          const [categoryPlace] = categoryPlaces;
          this.place = categoryPlace?.place;
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
}
