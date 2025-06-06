import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, Observable, of, switchMap } from 'rxjs';
import { DataServices } from '../../shared/services/data.services';

@Injectable({
  providedIn: 'root'
})
export class ApiServices {

  constructor(
    private dataService: DataServices,
    private _http: HttpClient) {
  }

  getCities(): Observable<City[]> {
    return this._http.get<any>(`${ environment.apiUrl }/cities?pagination[page]=1&pagination[pageSize]=100`).pipe(
      map((response: CityResponse) => this.adjustResponse(response))
    );
  }


  getAbout(slug: string): Observable<About> {
    const url = `${ environment.apiUrl }/about` +
      `?filters[slug][$eq]=${ slug }` +
      `&populate=*`;
    return this._http.get<any>(url).pipe(
      map((response: any) => {
        console.log(response);
        return response?.data
      })
    );
  }

  getPlaces(): Observable<Place[]> {
    return this._http.get<any>(`${ environment.apiUrl }/places?pagination[page]=1&pagination[pageSize]=100&populate=*`).pipe(
      map((response: PlaceResponse) => this.adjustResponse(response))
    );
  }

  getPlaceBySlug(slug: string): Observable<Place | null> {
    const url = `${ environment.apiUrl }/places` +
      `?filters[slug][$eq]=${ slug }` +
      `&populate=*` +
      `&pagination[page]=1&pagination[pageSize]=1`;

    return this._http.get<PlaceResponse>(url).pipe(
      map(response => {
        const data = this.adjustResponse(response);
        return data.length > 0 ? data[0] : null;
      })
    );
  }

  getCategoryPlacesByPlaceSlug(slug: string): Observable<CategoryPlace[]> {
    const url = `${ environment.apiUrl }/category-places` +
      `?filters[place][slug][$eq]=${ slug }` +
      `&populate[place][populate]=*` +
      `&populate[category][populate][city]=*` +
      `&pagination[page]=1&pagination[pageSize]=100`;

    return this._http.get<CategoryPlaceResponse>(url).pipe(
      map((response: CategoryPlaceResponse) => this.adjustResponse(response, true))
    );
  }


  getPlacesById(ids: string): Observable<Place[]> {
    return this._http.get<any>(`${ environment.apiUrl }/places?pagination[page]=1&pagination[pageSize]=100&?filters[id][$in]=${ ids }&populate=*`).pipe(
      map((response: PlaceResponse) => this.adjustResponse(response))
    );
  }

  getCategories(): Observable<Category[]> {
    return this._http.get<any>(`${ environment.apiUrl }/categories?populate=*&pagination[page]=1&pagination[pageSize]=100`).pipe(
      map((response: CategoryResponse) => this.adjustResponse(response))
    );
  }

  getCategoryPlacesByCityId(cityId: number): Observable<CategoryPlace[]> {
    const categoryPlaces: CategoryPlace[] = this.dataService.getCategoryPlaces();

    const categories = categoryPlaces.map((categoryPlace: CategoryPlace) => {
      return categoryPlace.category.id;
    });

    const uniqueCategories = [...new Set(categories)];


    if (categoryPlaces.length > 0 && uniqueCategories.length > 1) {
      const categoryPlacesFilter = categoryPlaces.filter(cp => cp.category?.city?.id == cityId);
      if (categoryPlacesFilter.length > 0) {
        return of(categoryPlacesFilter);
      }
    }

    const url = `${ environment.apiUrl }/category-places` +
      `?filters[category][city][id][$eq]=${ cityId }` +
      `&populate[category][populate][city]=*` +
      `&populate[place][populate]=*` +
      `&pagination[page]=1&pagination[pageSize]=100`;

    return this._http.get<CategoryPlaceResponse>(url).pipe(
      map((response: CategoryPlaceResponse) => this.adjustResponse(response, true))
    );
  }


  getCategoryPlacesByCategoryId(categoryId: number): Observable<CategoryPlace[]> {
    const categoryPlaces: CategoryPlace[] = this.dataService.getCategoryPlaces();
    if (categoryPlaces.length > 0) {
      const categoryPlacesFilter = categoryPlaces.filter(cp => cp.category?.id == categoryId);
      if (categoryPlacesFilter.length > 0) {
        return of(categoryPlacesFilter);
      }
    }
    const url = `${ environment.apiUrl }/category-places` +
      `?filters[category][id][$eq]=${ categoryId }` +
      `&populate[category][populate][city]=*` +
      `&populate[place][populate]=*` +
      `&pagination[page]=1&pagination[pageSize]=100`;

    return this._http.get<CategoryPlaceResponse>(url).pipe(
      map((response: CategoryPlaceResponse) => this.adjustResponse(response, true))
    );
  }


  getCategoryPlaces(): Observable<CategoryPlace[]> {
    const url = `${ environment.apiUrl }/category-places` +
      `?populate=*` +
      `&pagination[page]=1&pagination[pageSize]=100`;
    return this._http.get<CategoryPlaceResponse>(url).pipe(
      map((response: CategoryPlaceResponse) => this.adjustResponse(response, true)),
      switchMap((categoryPlaces: CategoryPlace[]) => {
        return this.getPlacesById(categoryPlaces.map(cp => cp?.place?.id).join(',')).pipe(
          map(places => {
            return categoryPlaces.map(cp => {
              return {
                ...cp,
                place: places.find(p => p.id === cp.place.id)
              };
            });
          })
        );
      }),
    );
  }

  getCategoriesByCitySlug(citySlug: string = 'belem'): Observable<Category[]> {
    const url = `${ environment.apiUrl }/categories?filters[city][slug][$eq]=${ citySlug }&populate=*`;
    return this._http.get<any>(url).pipe(
      map((response: CategoryResponse) => this.adjustResponse(response))
    );
  }

  private adjustResponse(response: any, disableFilterSlug: boolean = false) {
    if (disableFilterSlug) {
      return response?.data ? response.data?.filter((d: any) => !!d.id) : [];
    }
    return response?.data ? response.data?.filter((d: any) => !!d.slug) : [];
  }
}

export interface About {
  id: number;
  slug: string;
  details: Detail[];
  images: Image[];
  title: string;
  subtitle: string;
}

export interface CategoryPlaceResponse {
  data: CategoryPlace[];
  meta: Meta;
}

export interface CategoryPlace {
  id: number;
  slug: string;
  details: Detail[];
  images: Image[];
  category: Category;
  place: Place;
}

export interface PlaceResponse {
  data: Place[];
  meta: Meta;
}

export interface Place {
  id: number;
  slug: string;
  details: Detail[];
  images: Image[];
  location: any;
  name: string;
}

export interface CityResponse {
  data: City[];
  meta: Meta;
}

export interface City {
  id: number;
  slug: string;
  city: string;

  /*JUST FOR FRONTEND*/
  categories: Category[];
}

export interface CategoryResponse {
  data: Category[];
  meta: Meta;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  documentId: string;
  categoryCityName: string;
  details: Detail[];
  locale: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  city: {
    id: number;
    documentId: string;
    slug: string;
    city: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
  image: string | null;
  extra?: IconInfo;
}

export interface IconInfo {
  icon: string;
  color: string;
  category: string;
  colorText: string;
  markerPin: string;
}

export interface Meta {
  pagination: {
    page: number;
    pageCount: number;
    pageSize: number;
    total: number;
  };
}

export interface Detail {
  type: string;
  children: DetailChildren[];
}

export interface DetailChildren {
  text: string;
  type: string;
  bold?: boolean;
}

export interface Image {
  url: string;
  name: string;
  caption: string;
}
