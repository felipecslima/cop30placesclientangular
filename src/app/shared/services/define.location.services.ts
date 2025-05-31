import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class DefineLocationServices {
  DEFAULT_PLACE_ID = 2; // BELEM
  placeIdStored = 'PLACE_ID';

  constructor(private localStorageService: LocalStorageService) {
    const placeIdStored = this.localStorageService.getItem(this.placeIdStored);
    if (!placeIdStored) {
      this.localStorageService.setItem(this.placeIdStored, this.DEFAULT_PLACE_ID);
    }
  }

  getPlaceId(): number {
    return this.localStorageService.getItem(this.placeIdStored);
  }

  setPlaceId(placeId: number): void {
    this.localStorageService.setItem(this.placeIdStored, placeId);
  }

}
