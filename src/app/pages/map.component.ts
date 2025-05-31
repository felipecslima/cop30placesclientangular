import { Component, OnDestroy, OnInit } from '@angular/core';
import { MapboxMapComponent } from '../features/mapbox-map/mapbox-map.component';
import { ApiServices, CategoryPlace, Place } from '../core/services/api.service';
import { distinctUntilChanged, map, Subscription, switchMap, tap } from 'rxjs';
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

  constructor(
    private snackBarService: SnackbarService,
    private dataService: DataServices,
    private defineLocationServices: DefineLocationServices,
    private apiServices: ApiServices
  ) {
    this.subscriptions = this.dataService.getUpdateLocation().pipe(
      tap(() => this.loading = true),
      map((response) => this.defineLocationServices.getPlaceId()),
      tap((response) => console.log(response)),
      distinctUntilChanged(),
      tap(() => console.log('getUpdateLocation')),
      switchMap((cityId: number) => this.apiServices.getCategoryPlacesByCityId(cityId)),
      tap((categoryPlaces: CategoryPlace[]) => {

        if(categoryPlaces.length === 0){
          this.snackBarService.show('Ainda não temos indicações cadastradas para essa localidade.')
        }

        this.dataService.mergeCategoryPlaces(categoryPlaces);
        this.loading = false;
        // Atualiza this.places com os Places válidos
        this.places = categoryPlaces
          .filter(cp => !!cp.place)
          .map(cp => cp.place);
      })
    ).subscribe();
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

}
