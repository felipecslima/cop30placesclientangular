import { AfterViewInit, Component, Inject, OnDestroy } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheet } from '@angular/material/bottom-sheet';
import { Place } from '../../core/services/api.service';
import { MaterialModule } from '../ material.module';
import { NgIf } from '@angular/common';

@Component({
  imports: [MaterialModule, NgIf],
  selector: 'place-dialog',
  standalone: true,
  template: `
    <mat-card class="example-card" appearance="outlined">
      <mat-card-header class="mb-4">
        <mat-card-title>{{ place.name }}</mat-card-title>
      </mat-card-header>
      <img mat-card-image *ngIf="place?.images?.length" [src]="getImageUrl(place)" alt="Photo of a Shiba Inu">
      <mat-card-content class="mt-4 mb-4">
        @for (detail of place.details; track detail) {
          @for (children of detail.children; track children) {
            <p [innerHTML]="children.text"></p>
          }
        }
      </mat-card-content>
      <mat-card-actions>
        <div class="flex gap-1 w-100">
          <button class="flex-1" (click)="matBottomSheet.dismiss()" mat-stroked-button>Voltar</button>
          <button class="flex-1" color="primary" mat-stroked-button>Mais detalhes</button>
        </div>

      </mat-card-actions>
    </mat-card>

  `,
  styles: ``
})
export class PlaceDialogComponent implements AfterViewInit, OnDestroy {

  constructor(
    public matBottomSheet: MatBottomSheet,
    @Inject(MAT_BOTTOM_SHEET_DATA) public place: Place,
  ) {
    console.log('placeDialog', place);
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }

  getImageUrl(place: Place): string {
    return place?.images?.length > 0 ? place.images[0].url : '';
  }
}
