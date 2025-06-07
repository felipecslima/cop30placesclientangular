import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PwaService {
  constructor(private swUpdate: SwUpdate) {
    if (swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(
          filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
        )
        .subscribe(() => {
          const reload = confirm('Nova versão disponível. Deseja atualizar agora?');
          console.log('reload',  reload);
          if (reload) {
            this.swUpdate.activateUpdate().then(() => document.location.reload());
          }
        });
    }
  }
}
