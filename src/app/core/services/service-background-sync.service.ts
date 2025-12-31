import { Injectable } from '@angular/core';
import { ServiceSynchronisation } from './service-synchronisation.service';
import { ServiceHorsLigne } from './service-hors-ligne.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceBackgroundSync {
  constructor(
    private serviceSynchronisation: ServiceSynchronisation,
    private serviceHorsLigne: ServiceHorsLigne
  ) {
    this.initializeBackgroundSync();
  }

  private initializeBackgroundSync(): void {
    if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration: any) => {
        registration.sync.register('sync-depenses').catch(() => {
          console.log('Background sync non disponible');
        });
      });
    }
  }

  async synchroniserDepenses(): Promise<void> {
    try {
      await this.serviceSynchronisation.synchroniser();
    } catch (error) {
      console.error('Erreur lors de la synchronisation en arrière-plan', error);
    }
  }

  async enregistrerPourSynchronisation(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in (window as any).ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      try {
        await (registration as any).sync.register('sync-depenses');
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la synchronisation', error);
      }
    }
  }
}

