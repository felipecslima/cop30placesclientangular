import { Component, OnDestroy } from '@angular/core';
import { ApiServices, Category, City } from '../../../core/services/api.service';
import { AutoUnsubscribe, CombineSubscriptions } from '../../decorators/auto-unsubscribe.decorator';
import { Subscription, switchMap, tap } from 'rxjs';
import { DefineLocationServices } from '../../services/define.location.services';
import { DataServices } from '../../services/data.services';

@Component({
  selector: 'layout-shell',
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
  standalone: false,
})
@AutoUnsubscribe()
export class ShellComponent implements OnDestroy {

  @CombineSubscriptions()
  subscriptions: Subscription | undefined;

  cities: City[] = [];
  categories: Category[] = [];

  constructor(
    private dataService: DataServices,
    private defineLocationServices: DefineLocationServices,
    private apiServices: ApiServices) {
    this.subscriptions = this.apiServices.getCities()
      .pipe(
        tap(cities => this.cities = cities),
        switchMap(() => {
          return this.apiServices.getCategories();
        })
      )
      .subscribe((categories: Category[]) => {

        this.dataService.setCategories(categories);
        this.dataService.setCities(this.cities);

        this.categories = categories;
        this.cities = this.cities.map(city => {
          return {
            ...city,
            categories: this.categories.filter(category => category.city.slug === city.slug)
          };
        });
      });

  }

  ngOnDestroy(): void {
  }

  setPlace(city: City) {
    this.defineLocationServices.setPlaceId(city.id);
    this.dataService.setUpdateLocation();
  }
}
