// mapbox-map.component.ts
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

@Component({
  selector: 'mapbox-map',
  standalone: true,
  templateUrl: './mapbox-map.component.html',
  styleUrl: './mapbox-map.component.css'
})
export class MapboxMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() places: Place[] = [];
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  map!: mapboxgl.Map;
  markers: mapboxgl.Marker[] = [];

  constructor(private dialogsService: DialogsService) {
  }

  ngAfterViewInit(): void {
    this.map = new mapboxgl.Map({
      accessToken: 'pk.eyJ1IjoibGZqMTgyIiwiYSI6ImNsZHVybGh4bjAwZXozd3Fia3lrN2p5MmsifQ.-whO_Kv5SLdi0ObNU5jjjA',
      container: this.mapContainer.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-48.5012, -1.4558],
      zoom: 12,
    });

    this.map.on('load', () => {
      this.updateMarkers();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['places'] && this.map) {
      this.updateMarkers();
    }
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
    console.log(place);
    this.dialogsService.openPlaceDialog(place);
  }

  ngOnDestroy(): void {
    this.map.remove();
  }
}
