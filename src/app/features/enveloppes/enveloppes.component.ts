import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ServiceApi } from '../../core/services/service-api.service';
import { firstValueFrom } from 'rxjs';

interface Enveloppe {
  id: number;
  nom: string;
  montantAlloue: number;
  montantDepense: number;
  budgetId: number;
}

interface Budget {
  id: number;
  montant: number;
}

@Component({
  selector: 'app-enveloppes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './enveloppes.component.html',
  styleUrl: './enveloppes.component.css'
})
export class EnveloppesComponent implements OnInit {
  enveloppes: Enveloppe[] = [];
  budgets: Budget[] = [];
  budgetSelectionne: number | null = null;
  afficherFormulaire = false;
  enChargement = false;
  formulaire: FormGroup;

  constructor(
    private serviceApi: ServiceApi,
    private fb: FormBuilder
  ) {
    this.formulaire = this.fb.group({
      nom: ['', Validators.required],
      montantAlloue: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.chargerBudgets();
  }

  async chargerBudgets(): Promise<void> {
    try {
      this.budgets = await firstValueFrom(
        this.serviceApi.get<Budget[]>('/budgets')
      );
      if (this.budgets.length > 0) {
        this.budgetSelectionne = this.budgets[0].id;
        await this.chargerEnveloppes();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des budgets', error);
    }
  }

  async chargerEnveloppes(): Promise<void> {
    if (!this.budgetSelectionne) {
      return;
    }

    this.enChargement = true;
    try {
      this.enveloppes = await firstValueFrom(
        this.serviceApi.get<Enveloppe[]>(`/enveloppes/budget/${this.budgetSelectionne}`)
      );
    } catch (error) {
      console.error('Erreur lors du chargement des enveloppes', error);
    } finally {
      this.enChargement = false;
    }
  }

  async soumettre(): Promise<void> {
    if (!this.formulaire.valid || !this.budgetSelectionne) {
      return;
    }

    try {
      await firstValueFrom(
        this.serviceApi.post(`/enveloppes/budget/${this.budgetSelectionne}`, this.formulaire.value)
      );
      this.afficherFormulaire = false;
      this.formulaire.reset();
      await this.chargerEnveloppes();
    } catch (error) {
      console.error('Erreur lors de la création de l\'enveloppe', error);
    }
  }

  annuler(): void {
    this.afficherFormulaire = false;
    this.formulaire.reset();
  }

  obtenirPourcentageUtilise(enveloppe: Enveloppe): number {
    if (enveloppe.montantAlloue === 0) {
      return 0;
    }
    return Math.min(100, (enveloppe.montantDepense / enveloppe.montantAlloue) * 100);
  }
}

