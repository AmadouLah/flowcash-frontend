import { Injectable } from '@angular/core';
import { ServiceApi } from './service-api.service';
import { ServiceHorsLigne } from './service-hors-ligne.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceSynchronisation {
  constructor(
    private serviceApi: ServiceApi,
    private serviceHorsLigne: ServiceHorsLigne
  ) {}

  async synchroniser(): Promise<void> {
    const depensesNonSync = await this.serviceHorsLigne.obtenirDepensesNonSynchronisees();
    
    for (const depense of depensesNonSync) {
      try {
        await firstValueFrom(
          this.serviceApi.post('/depenses', {
            montant: depense.montant,
            description: depense.description,
            categorieId: depense.categorieId,
            dateDepense: depense.dateDepense,
            latitude: depense.latitude,
            longitude: depense.longitude,
            adresse: depense.adresse
          })
        );
        
        if (depense.id) {
          await this.serviceHorsLigne.marquerCommeSynchronise(depense.id);
        }
      } catch (error) {
        console.error('Erreur lors de la synchronisation de la dépense', error);
      }
    }
  }

  async exporterDonnees(): Promise<string> {
    const depenses = await this.serviceHorsLigne.obtenirToutesDepenses();
    return JSON.stringify(depenses, null, 2);
  }

  async importerDonnees(json: string): Promise<void> {
    const depenses = JSON.parse(json);
    for (const depense of depenses) {
      await this.serviceHorsLigne.ajouterDepense(depense);
    }
  }
}

