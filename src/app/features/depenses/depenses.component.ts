import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceApi } from '../../core/services/service-api.service';
import { ServiceHorsLigne } from '../../core/services/service-hors-ligne.service';
import { ComposantFormulaireDepense, DepenseFormData } from '../../shared/components/composant-formulaire-depense/composant-formulaire-depense.component';
import { firstValueFrom } from 'rxjs';

interface Depense {
  id: number;
  montant: number;
  description?: string;
  categorieId: number;
  nomCategorie: string;
  dateDepense: Date;
  adresse?: string;
}

@Component({
  selector: 'app-depenses',
  standalone: true,
  imports: [CommonModule, ComposantFormulaireDepense],
  templateUrl: './depenses.component.html',
  styleUrl: './depenses.component.css'
})
export class DepensesComponent implements OnInit {
  depenses: Depense[] = [];
  categories: Array<{ id: number; nom: string }> = [];
  afficherFormulaire = false;
  enChargement = false;

  constructor(
    private serviceApi: ServiceApi,
    private serviceHorsLigne: ServiceHorsLigne
  ) {}

  async ngOnInit(): Promise<void> {
    await this.chargerCategories();
    await this.chargerDepenses();
  }

  async chargerCategories(): Promise<void> {
    try {
      this.categories = await firstValueFrom(this.serviceApi.get<Array<{ id: number; nom: string }>>('/categories')) || [];
    } catch (error) {
      console.error('Erreur lors du chargement des catégories', error);
    }
  }

  async chargerDepenses(): Promise<void> {
    this.enChargement = true;
    try {
      const result = await firstValueFrom(this.serviceApi.get<{ content: Depense[] }>('/depenses?page=0&size=20'));
      this.depenses = result?.content || [];
    } catch (error) {
      console.error('Erreur lors du chargement des dépenses', error);
      const depensesOffline = await this.serviceHorsLigne.obtenirToutesDepenses();
      this.depenses = depensesOffline.map(d => ({
        id: d.id || 0,
        montant: d.montant,
        description: d.description,
        categorieId: d.categorieId,
        nomCategorie: this.categories.find(c => c.id === d.categorieId)?.nom || 'Inconnue',
        dateDepense: d.dateDepense,
        adresse: d.adresse
      }));
    } finally {
      this.enChargement = false;
    }
  }

  async onSoumettreDepense(donnees: DepenseFormData): Promise<void> {
    try {
      const dateDepense = donnees.dateDepense instanceof Date 
        ? donnees.dateDepense.toISOString().replace('Z', '')
        : donnees.dateDepense;
      
      await firstValueFrom(this.serviceApi.post('/depenses', {
        ...donnees,
        dateDepense: dateDepense
      }));
      this.afficherFormulaire = false;
      await this.chargerDepenses();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la dépense', error);
      await this.serviceHorsLigne.ajouterDepense({
        montant: donnees.montant,
        description: donnees.description,
        categorieId: donnees.categorieId,
        dateDepense: donnees.dateDepense,
        latitude: donnees.latitude,
        longitude: donnees.longitude,
        adresse: donnees.adresse
      });
      this.afficherFormulaire = false;
      await this.chargerDepenses();
    }
  }

  onAnnulerFormulaire(): void {
    this.afficherFormulaire = false;
  }
}

