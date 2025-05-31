import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category, CategoryPlace, City, Place } from '../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class DataServices {
  // State subjects
  private _categoryPlaces$ = new BehaviorSubject<CategoryPlace[]>([]);
  private _places$ = new BehaviorSubject<Place[]>([]);
  private _categories$ = new BehaviorSubject<Category[]>([]);
  private _cities$ = new BehaviorSubject<City[]>([]);
  private _updateLocation$ = new BehaviorSubject<number>(undefined);
  private _updateCategory$ = new BehaviorSubject<number>(undefined);
  private _updateFilter$ = new BehaviorSubject<number>(undefined);

  // Public readonly observables
  public readonly places$ = this._places$.asObservable();
  public readonly categories$ = this._categories$.asObservable();
  public readonly cities$ = this._cities$.asObservable();

  // UPDATE LOCATION

  getUpdateFilter(): Observable<number> {
    return this._updateFilter$.asObservable();
  }

  setUpdateFilter() {
    this._updateFilter$.next(new Date().getTime());
  }

  getUpdateLocation(): Observable<number> {
    return this._updateLocation$.asObservable();
  }

  setUpdateLocation() {
    this._updateLocation$.next(new Date().getTime());
  }

  getUpdateCategory(): Observable<number> {
    return this._updateCategory$.asObservable();
  }

  setUpdateCategory() {
    this._updateCategory$.next(new Date().getTime());
  }


  // -------- CATEGORY PLACES --------

  getCategoryPlaces$(): Observable<CategoryPlace[]> {
    return this._categoryPlaces$.asObservable();
  }

  getCategoryPlaces(): CategoryPlace[] {
    return this._categoryPlaces$.getValue();
  }

  setCategoryPlaces(categoryPlaces: CategoryPlace[]): void {
    this._categoryPlaces$.next([...categoryPlaces]);
  }

  clearCategoryPlaces(): void {
    this._categoryPlaces$.next([]);
  }

  mergeCategoryPlaces(newPlaces: CategoryPlace[]): void {
    const existing = this._categoryPlaces$.getValue();
    const merged = [...existing];

    for (const place of newPlaces) {
      if (!existing.some(p => p.id === place.id)) {
        merged.push(place);
      }
    }

    this._categoryPlaces$.next(merged);
  }

  categoryPlace(categoryPlace: CategoryPlace): void {
    const existing = this._categoryPlaces$.getValue();
    if (!existing.some(p => p.id === categoryPlace.id)) {
      this._categoryPlaces$.next([...existing, categoryPlace]);
    }
  }

  // -------- PLACES --------


  setPlaces(places: Place[]): void {
    this._places$.next([...places]);
  }

  clearPlaces(): void {
    this._places$.next([]);
  }

  mergePlaces(newPlaces: Place[]): void {
    const existing = this._places$.getValue();
    const merged = [...existing];

    for (const place of newPlaces) {
      if (!existing.some(p => p.id === place.id)) {
        merged.push(place);
      }
    }

    this._places$.next(merged);
  }

  mergePlace(place: Place): void {
    const existing = this._places$.getValue();
    if (!existing.some(p => p.id === place.id)) {
      this._places$.next([...existing, place]);
    }
  }

  // -------- CATEGORIES --------

  getCategories$(): Observable<Category[]> {
    return this._categories$.asObservable();
  }

  getCategories(): Category[] {
    return this._categories$.getValue();
  }

  setCategories(categories: Category[]): void {
    console.log([...categories]);
    this._categories$.next([...categories]);
  }

  clearCategories(): void {
    this._categories$.next([]);
  }

  mergeCategories(newCategories: Category[]): void {
    const existing = this._categories$.getValue();
    const merged = [...existing];

    for (const category of newCategories) {
      if (!existing.some(c => c.id === category.id)) {
        merged.push(category);
      }
    }

    this._categories$.next(merged);
  }

  // -------- CITIES --------


  getCities$(): Observable<City[]> {
    return this._cities$.asObservable();
  }

  getCities(): City[] {
    return this._cities$.getValue();
  }

  setCities(cities: City[]): void {
    console.log([...cities]);
    this._cities$.next([...cities]);
  }

  clearCities(): void {
    this._cities$.next([]);
  }

  mergeCities(newCities: City[]): void {
    const existing = this._cities$.getValue();
    const merged = [...existing];

    for (const city of newCities) {
      if (!existing.some(c => c.id === city.id)) {
        merged.push(city);
      }
    }

    this._cities$.next(merged);
  }
}
