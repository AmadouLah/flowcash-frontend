import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ServiceApi } from '../../core/services/service-api.service';
import { firstValueFrom } from 'rxjs';

interface Apercu {
  depensesMois: number;
  budgetRestant: number;
  depensesJour: number;
  tendance: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  apercu: Apercu | null = null;
  enChargement = true;

  constructor(private serviceApi: ServiceApi) {}

  async ngOnInit(): Promise<void> {
    await this.chargerApercu();
  }

  async chargerApercu(): Promise<void> {
    try {
      // Calculer l'aperçu à partir des dépenses
      const depenses = await firstValueFrom(
        this.serviceApi.get<{ content: any[] }>('/depenses?page=0&size=100')
      );
      
      const maintenant = new Date();
      const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
      const depensesMois = depenses.content
        ?.filter(d => new Date(d.dateDepense) >= debutMois)
        .reduce((sum, d) => sum + (d.montant || 0), 0) || 0;
      
      const depensesAujourdhui = depenses.content
        ?.filter(d => {
          const dateDepense = new Date(d.dateDepense);
          return dateDepense.toDateString() === maintenant.toDateString();
        })
        .reduce((sum, d) => sum + (d.montant || 0), 0) || 0;
      
      this.apercu = {
        depensesMois,
        budgetRestant: 0, // À calculer avec les budgets
        depensesJour: depensesAujourdhui,
        tendance: depensesMois > 0 ? 'En hausse' : 'Stable'
      };
    } catch (error) {
      console.error('Erreur lors du chargement de l\'aperçu', error);
      this.apercu = {
        depensesMois: 0,
        budgetRestant: 0,
        depensesJour: 0,
        tendance: 'Stable'
      };
    } finally {
      this.enChargement = false;
    }
  }
}

