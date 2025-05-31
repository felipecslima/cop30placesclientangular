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
import { Place } from '../../core/services/api.service';
import { DialogsService } from '../../shared/services/page-dialogs.service';
import { MaterialModule } from '../../shared/ material.module';
import { LocalStorageService } from '../../shared/services/local-storage.service';

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
  @Input() places: Place[] = [];
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  MY_LAT_LON_STORAGE_KEY = 'myLatLng';
  MY_LAST_LAT_LON_STORAGE_KEY = 'myLastLatLng';
  myLatLong: [number, number] = [-48.5012, -1.4558];
  map!: mapboxgl.Map;
  markers: mapboxgl.Marker[] = [];

  constructor(
    private localStorageService: LocalStorageService,
    private dialogsService: DialogsService) {
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
    if (changes['places'] && this.map) {
      this.updateMarkers();
    }
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

    for (const place of this.places) {
      const marker = new mapboxgl.Marker({ color: '#FF5722' })
        .setLngLat(place.location)
        .addTo(this.map);

      // Trigger your function on marker click
      marker.getElement().addEventListener('click', () => {
        this.onMarkerClick(place); // sua função personalizada
      });

      this.markers.push(marker);
      bounds.extend(place.location as [number, number]);
    }

    if (this.places.length > 0) {
      this.map.fitBounds(bounds, {
        padding: 50,
        animate: true
      });
    }
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

        this.localStorageService.setItem(this.MY_LAT_LON_STORAGE_KEY, [lng, lat]);
        this.myLatLong = [lng, lat];
        // Adiciona um marcador azul para o usuário
        new mapboxgl.Marker({ color: '#2196F3' })
          .setLngLat(this.myLatLong)
          .addTo(this.map);

        // Centraliza e faz zoom na posição do usuário
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
