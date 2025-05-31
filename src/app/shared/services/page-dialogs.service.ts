import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PlaceDialogComponent } from '../dialogs/place.dialog.component';
import { Place } from '../../core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class DialogsService {
  constructor(
    readonly bottomSheet: MatBottomSheet,
    private dialog: MatDialog) {
  }


  // public openOrganizationAuthInviteForm(
  //   values = {},
  // ): Observable<boolean> {
  //   let dialogRef: MatDialogRef<OrganizationDialogAuthInviteFormComponent>;
  //   dialogRef = this.dialog.open(OrganizationDialogAuthInviteFormComponent, {
  //     width: '512px',
  //     data: { ...values },
  //   });
  //   return dialogRef.afterClosed();
  // }

  public openPlaceDialog(
    place: Place,
  ): Observable<boolean> {
    const bottomSheetRef = this.bottomSheet.open(PlaceDialogComponent, {
      data: place
    });
    return bottomSheetRef.afterDismissed();
  }


}
