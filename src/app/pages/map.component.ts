import { Component, OnDestroy, OnInit } from '@angular/core';
import { MapboxMapComponent } from '../features/mapbox-map/mapbox-map.component';
import { ApiServices, CategoryPlace, Place } from '../core/services/api.service';
import { distinctUntilChanged, filter, map, Subscription, switchMap, tap } from 'rxjs';
import { AutoUnsubscribe, CombineSubscriptions } from '../shared/decorators/auto-unsubscribe.decorator';
import { DataServices } from '../shared/services/data.services';
import { DefineLocationServices } from '../shared/services/define.location.services';
import { MaterialModule } from '../shared/ material.module';
import { SnackbarService } from '../shared/services/ snackbar.service';

@Component({
  selector: 'app-map',
  imports: [MapboxMapComponent, MaterialModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
@AutoUnsubscribe()
export class MapComponent implements OnInit, OnDestroy {
  @CombineSubscriptions()
  subscriptions: Subscription | undefined;
  loading = false;
  places: Place[] = [];
  filters: { label: string; value: number }[] = [];

  constructor(
    private snackBarService: SnackbarService,
    private dataService: DataServices,
    private defineLocationServices: DefineLocationServices,
    private apiServices: ApiServices
  ) {
    this.subscriptions = this.dataService.getUpdateLocation().pipe(
      filter(() => !this.defineLocationServices.getCategoryId()),
      map(() => this.defineLocationServices.getCityId()),
      distinctUntilChanged(),
      tap(() => this.loading = true),
      switchMap((cityId: number) => this.apiServices.getCategoryPlacesByCityId(cityId)),
      tap((categoryPlaces: CategoryPlace[]) => {
        this.setCategoryPlaces(categoryPlaces);
      })
    ).subscribe({
      error: (error: Error) => {
        this.loading = false;
        this.snackBarService.error(error?.message);
      }
    });

    this.subscriptions = this.dataService.getUpdateCategory().pipe(
      filter(() => !!this.defineLocationServices.getCategoryId()),
      map(() => this.defineLocationServices.getCategoryId()),
      distinctUntilChanged(),
      tap(() => this.loading = true),
      switchMap((categoryId: number) => this.apiServices.getCategoryPlacesByCategoryId(categoryId)),
      tap((categoryPlaces: CategoryPlace[]) => {
        this.setCategoryPlaces(categoryPlaces);
      })
    ).subscribe({
      error: (error: Error) => {
        this.loading = false;
        this.snackBarService.error(error?.message);
      }
    });


    this.subscriptions = this.dataService.getUpdateFilter().pipe(
      tap(() => this.setFilters())
    ).subscribe({
      error: (error: Error) => {
        this.loading = false;
        this.snackBarService.error(error?.message);
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  setCategoryPlaces(categoryPlaces: CategoryPlace[]) {
    if (categoryPlaces.length === 0) {
      this.snackBarService.show('Ainda não temos indicações cadastradas para essa localidade.');
    }

    this.dataService.mergeCategoryPlaces(categoryPlaces);

    this.loading = false;
    // Atualiza this.places com os Places válidos
    this.places = categoryPlaces
      .filter(cp => !!cp.place)
      .map(cp => cp.place);
  }

  setFilters() {
    const cities = this.dataService.getCities();
    const cityId = this.defineLocationServices.getCityId();
    const city = cities.find(c => c.id === cityId);

    const categories = this.dataService.getCategories();
    const categoryId = this.defineLocationServices.getCategoryId();
    const category = categories.find(c => c.id === categoryId);

    console.log(city, cityId, cities);

    const filters = [];

    if (city) {
      filters.push({
        label: city.city,
        value: city.id,
      });
    }

    if (category) {
      filters.push({
        label: category.name,
        value: category.id,
      });
    }

    this.filters = filters;
  }

}
