import { Component, OnDestroy, OnInit } from '@angular/core';
import { MapboxMapComponent } from '../../features/mapbox-map/mapbox-map.component';
import { ApiServices, CategoryPlace } from '../../core/services/api.service';
import { distinctUntilChanged, filter, map, Subscription, switchMap, tap } from 'rxjs';
import { AutoUnsubscribe, CombineSubscriptions } from '../../shared/decorators/auto-unsubscribe.decorator';
import { DataServices } from '../../shared/services/data.services';
import { DefineLocationServices } from '../../shared/services/define.location.services';
import { MaterialModule } from '../../shared/ material.module';
import { SnackbarService } from '../../shared/services/snackbar.service';
import { NgIf } from '@angular/common';
import { CategoryService } from '../../shared/services/category.service';
import { environment } from '../../../environments/environment';
import { SeoService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-map',
  imports: [MapboxMapComponent, MaterialModule, NgIf],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
@AutoUnsubscribe()
export class MapComponent implements OnInit, OnDestroy {
  @CombineSubscriptions()
  subscriptions: Subscription | undefined;
  loading = false;
  categoryPlaces: CategoryPlace[] = [];
  filters: { label: string; value: number, bgColor?: string, color?: string }[] = [];

  constructor(
    private seoService: SeoService,
    private categoryService: CategoryService,
    private snackBarService: SnackbarService,
    private dataService: DataServices,
    private defineLocationServices: DefineLocationServices,
    private apiServices: ApiServices
  ) {

    this.seoService.updateTags({});

    this.subscriptions = this.dataService.getUpdateLocation().pipe(
      filter(() => !this.defineLocationServices.getCategoryId()),
      map(() => this.defineLocationServices.getCityId()),
      distinctUntilChanged(),
      filter(() => !!this.defineLocationServices.getCityId()),
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
    this.categoryPlaces = categoryPlaces.map(cp => {
      const extra = this.categoryService.getIconByCategory(cp.category.name);
      return {
        ...cp,
        category: { ...cp.category, extra }
      };
    });
  }

  setFilters() {
    const cities = this.dataService.getCities();
    const cityId = this.defineLocationServices.getCityId();
    const city = cities.find(c => c.id === cityId);

    const categories = this.dataService.getCategories();
    const categoryId = this.defineLocationServices.getCategoryId();
    const category = categories.find(c => c.id === categoryId);

    const filters = [];

    if (city) {
      filters.push({
        label: city.city,
        value: city.id,
      });
    }

    if (category) {
      const extra = this.categoryService.getIconByCategory(category.name);
      filters.push({
        label: category.name,
        value: category.id,
        bgColor: extra?.color,
        color: extra?.colorText,
      });
    }
    this.filters = filters;
  }

  removeFilterCategory() {
    const cityId = this.defineLocationServices.getCityId();
    this.defineLocationServices.setCategory(undefined);
    this.defineLocationServices.setCityId(undefined);
    this.dataService.setUpdateLocation();
    setTimeout(() => {
      this.defineLocationServices.setCityId(cityId);
      this.dataService.setUpdateLocation();
      this.dataService.setUpdateFilter();
    }, 10);
  }
}
