// openstreetmap-about-page.component.ts
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
import * as L from 'leaflet';
import { CategoryPlace, Place } from '../../core/services/api.service';
import { DialogsService } from '../../shared/services/page-dialogs.service';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { CategoryService } from '../../shared/services/category.service';
import { MaterialModule } from '../../shared/ material.module';

@Component({
  selector: 'openstreetmap-map',
  standalone: true,
  templateUrl: './openstreetmap-map.component.html',
  imports: [MaterialModule],
  styleUrl: './openstreetmap-map.component.css'
})
export class OpenStreetMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() categoryPlaces: CategoryPlace[] = [];
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  MY_LAT_LON_STORAGE_KEY = 'myLatLng';
  MY_LAST_LAT_LON_STORAGE_KEY = 'myLastLatLng';
  myLatLong: [number, number] = [-48.5012, -1.4558];
  map!: L.Map;
  markers: L.Marker[] = [];
  userMarker?: L.Marker;

  private readonly pinDefinitions;
  private iconCache = new Map<string, HTMLImageElement>();

  constructor(
    private categoryService: CategoryService,
    private localStorageService: LocalStorageService,
    private dialogsService: DialogsService
  ) {
    this.pinDefinitions = this.categoryService.getAllCategories();
    const myLastLatLng = this.localStorageService.getItem(this.MY_LAST_LAT_LON_STORAGE_KEY);
    if (myLastLatLng) {
      this.myLatLong = myLastLatLng;
    }
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomSnap: 0.1,
      zoomControl: true
    }).setView(this.myLatLong.reverse(), 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.map.on('moveend', () => this.onMapMoved());
    this.updateMarkers();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryPlaces'] && this.map) {
      this.updateMarkers();
    }
  }

  onMapMoved(): void {
    const center = this.map.getCenter();
    this.myLatLong = [center.lng, center.lat];
    this.localStorageService.setItem(this.MY_LAST_LAT_LON_STORAGE_KEY, this.myLatLong);
  }

  updateMarkers(): void {
    // Remove os marcadores existentes
    for (const marker of this.markers) {
      this.map.removeLayer(marker);
    }
    this.markers = [];

    const bounds = L.latLngBounds([]);

    for (const categoryPlaces of this.categoryPlaces) {
      const { place, category } = categoryPlaces;

      const lat = place?.location?.lat;
      const lng = place?.location?.lng;

      // Validação segura para coordenadas
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        console.warn('Local inválido:', place);
        continue;
      }

      const iconUrl = this.getImagePinByCategoryName(category.name);

      const customIcon = L.icon({
        iconUrl,
        iconSize: [40, 56],
        iconAnchor: [20, 56],
        popupAnchor: [0, -56]
      });

      const marker = L.marker([lat, lng], { icon: customIcon })
        .addTo(this.map)
        .on('click', () => this.onMarkerClick(place));

      this.markers.push(marker);
      bounds.extend([lat, lng]);
    }

    // Ajusta a visualização para os bounds calculados
    if (bounds.isValid()) {
      this.map.fitBounds(bounds.pad(0.05), {
        animate: true,
        duration: 1
      });

      // DEBUG opcional: desenha os limites
      // L.rectangle(bounds, { color: 'red', weight: 1 }).addTo(this.map);
    }
  }

  private getImagePinByCategoryName(categoryName: string): string {
    const def = this.pinDefinitions[categoryName];
    return def?.markerPin || 'assets/pins/default.png';
  }

  onMarkerClick(place: Place): void {
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

        if (this.userMarker) {
          this.userMarker.setLatLng([lat, lng]);
        } else {
          this.userMarker = L.marker([lat, lng], {
            icon: L.icon({ iconUrl: 'assets/pins/user-location.png', iconSize: [30, 30] })
          }).addTo(this.map);
        }

        this.map.setView([lat, lng], 14);
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        alert('Não foi possível obter sua localização.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  ngOnDestroy(): void {
    this.map.remove();
  }
}
