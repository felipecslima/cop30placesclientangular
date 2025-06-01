// mapbox-place-page.component.ts
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { CategoryPlace, Place } from '../../core/services/api.service';
import { DialogsService } from '../../shared/services/page-dialogs.service';
import { MaterialModule } from '../../shared/ material.module';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { CategoryService } from '../../shared/services/category.service';

@Component({
  selector: 'mapbox-map',
  standalone: true,
  templateUrl: './mapbox-map.component.html',
  imports: [
    MaterialModule
  ],
  styleUrl: './mapbox-map.component.css'
})
export class MapboxMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() categoryPlaces: CategoryPlace[] = [];
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  MY_LAT_LON_STORAGE_KEY = 'myLatLng';
  MY_LAST_LAT_LON_STORAGE_KEY = 'myLastLatLng';
  myLatLong: [number, number] = [-48.5012, -1.4558];
  map!: mapboxgl.Map;
  markers: mapboxgl.Marker[] = [];
  userMarker?: mapboxgl.Marker;

  private readonly pinDefinitions;
  private iconCache = new Map<string, HTMLElement>();

  constructor(
    private categoryService: CategoryService,
    private localStorageService: LocalStorageService,
    private dialogsService: DialogsService) {
    this.pinDefinitions = this.categoryService.getAllCategories();
    const myLastLatLng = this.localStorageService.getItem(this.MY_LAST_LAT_LON_STORAGE_KEY);
    if (myLastLatLng) {
      this.myLatLong = myLastLatLng;
    }
  }

  ngAfterViewInit(): void {
    this.map = new mapboxgl.Map({
      accessToken: 'pk.eyJ1IjoibGZqMTgyIiwiYSI6ImNsZHVybGh4bjAwZXozd3Fia3lrN2p5MmsifQ.-whO_Kv5SLdi0ObNU5jjjA',
      container: this.mapContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: this.myLatLong,
      zoom: 12,
      interactive: true
    });

    this.map.on('load', () => {
      this.updateMarkers();
    });

    // 🔁 Escuta movimento do mapa
    this.map.on('moveend', () => {
      this.onMapMoved();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryPlaces'] && this.map) {
      this.updateMarkers();
    }
  }

  private getPinByCategoryName(categoryName: string): HTMLElement {
    if (this.iconCache.has(categoryName)) {
      return this.iconCache.get(categoryName)!.cloneNode(true) as HTMLElement;
    }

    const def = this.pinDefinitions[categoryName];
    if (!def) {
      return this.createSvgPin('location_on', '#ccc', '#000'); // fallback
    }

    const el = this.createSvgPin(def.icon, def.color, def.colorText);
    this.iconCache.set(categoryName, el);
    return el.cloneNode(true) as HTMLElement;
  }

  onMapMoved(): void {
    const center = this.map.getCenter();
    const lng = center.lng;
    const lat = center.lat;
    this.localStorageService.setItem(this.MY_LAST_LAT_LON_STORAGE_KEY, [lng, lat]);
    this.myLatLong = [lng, lat];
  }

  updateMarkers(): void {
    for (const marker of this.markers) {
      marker.remove();
    }
    this.markers = [];

    const bounds = new mapboxgl.LngLatBounds();
    for (const categoryPlaces of this.categoryPlaces) {
      const { place, category } = categoryPlaces;
      const el = this.getPinByCategoryName(category.name);

      console.log('updateMarkers');

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(place.location)
        .addTo(this.map);

      // Trigger your function on marker click
      marker.getElement().addEventListener('click', () => {
        this.onMarkerClick(place); // sua função personalizada
      });

      this.markers.push(marker);
      bounds.extend(place.location as [number, number]);
    }

    if (this.categoryPlaces.length > 0) {
      this.map.fitBounds(bounds, {
        padding: 50,
        animate: true
      });
    }
  }

  createSvgPin(icon: string, color: string = '#000', colorIcon: string = '#fff'): HTMLElement {
    const el = document.createElement('div');

    el.innerHTML = `
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="44"
      viewBox="0 0 40 56"
      shape-rendering="geometricPrecision"
    >
      <defs>
        <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="rgba(0,0,0,0.35)" />
        </filter>
      </defs>

      <!-- PIN PATH (gota) -->
      <path 
        d="M20 0
           C30.5 0, 40 9, 40 20
           C40 32, 20 56, 20 56
           C20 56, 0 32, 0 20
           C0 9, 9.5 0, 20 0Z"
        fill="${color}"
        filter="url(#drop-shadow)"
      />

      <!-- ICON TEXT -->
      <text 
        x="50%" 
        y="60%" 
        text-anchor="middle"
        fill="${colorIcon}"
        font-size="20"
        font-family="Material Symbols Rounded"
        font-variation-settings="'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48"
      >
        ${icon}
      </text>
    </svg>
  `;

    return el.firstElementChild as HTMLElement;
  }

  onMarkerClick(place: Place) {
    this.dialogsService.openPlaceDialog(place);
  }

  goToUserLocation(): void {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada pelo seu navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lng = position.coords.longitude;
        const lat = position.coords.latitude;
        this.myLatLong = [lng, lat];

        this.localStorageService.setItem(this.MY_LAT_LON_STORAGE_KEY, this.myLatLong);

        // Se já existe um marcador do usuário, atualiza a posição
        if (this.userMarker) {
          this.userMarker.setLngLat(this.myLatLong);
        } else {
          // Cria novo marcador
          this.userMarker = new mapboxgl.Marker({ color: '#2196F3' })
            .setLngLat(this.myLatLong)
            .addTo(this.map);
        }

        // Centraliza o mapa na localização do usuário
        this.map.flyTo({
          center: this.myLatLong,
          zoom: 14,
          speed: 1.2,
          curve: 1,
          essential: true
        });
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        alert('Não foi possível obter sua localização.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  }

  ngOnDestroy(): void {
    this.map.remove();
  }
}
