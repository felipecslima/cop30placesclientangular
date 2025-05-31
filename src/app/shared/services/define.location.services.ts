import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class DefineLocationServices {
  DEFAULT_CITY_ID = 2; // BELEM
  cityIdStored = 'CITY_ID';
  categoryIdStored = 'CATEGORY_ID';

  constructor(private localStorageService: LocalStorageService) {
    const placeIdStored = this.localStorageService.getItem(this.cityIdStored);
    if (!placeIdStored) {
      this.localStorageService.setItem(this.cityIdStored, this.DEFAULT_CITY_ID);
    }
  }

  getCityId(): number {
    return this.localStorageService.getItem(this.cityIdStored);
  }

  setCityId(cityId: number): void {
    this.localStorageService.setItem(this.cityIdStored, cityId);
  }

  setCategory(categoryId: number): void {
    this.localStorageService.setItem(this.categoryIdStored, categoryId);
  }

  getCategoryId(): number {
    return this.localStorageService.getItem(this.categoryIdStored);
  }
}
