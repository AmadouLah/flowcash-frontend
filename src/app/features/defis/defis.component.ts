import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceApi } from '../../core/services/service-api.service';
import { firstValueFrom } from 'rxjs';

interface Defi {
  id: number;
  nom: string;
  description?: string;
  montantCible: number;
  montantActuel: number;
  dateDebut: string;
  dateFin: string;
  termine: boolean;
}

@Component({
  selector: 'app-defis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './defis.component.html',
  styleUrl: './defis.component.css'
})
export class DefisComponent implements OnInit {
  defis: Defi[] = [];
  enChargement = false;

  constructor(private serviceApi: ServiceApi) {}

  async ngOnInit(): Promise<void> {
    await this.chargerDefis();
  }

  async chargerDefis(): Promise<void> {
    this.enChargement = true;
    try {
      // Note: Il faudra créer l'endpoint /defis dans le backend
      this.defis = await firstValueFrom(
        this.serviceApi.get<Defi[]>('/defis')
      ).catch(() => []);
    } catch (error) {
      console.error('Erreur lors du chargement des défis', error);
    } finally {
      this.enChargement = false;
    }
  }

  obtenirPourcentage(defi: Defi): number {
    if (defi.montantCible === 0) {
      return 0;
    }
    return Math.min(100, (defi.montantActuel / defi.montantCible) * 100);
  }
}

