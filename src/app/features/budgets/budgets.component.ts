import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceApi } from '../../core/services/service-api.service';
import { firstValueFrom } from 'rxjs';

interface Budget {
  id: number;
  montant: number;
  dateDebut: string;
  dateFin: string;
  actif: boolean;
}

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './budgets.component.html',
  styleUrl: './budgets.component.css'
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];
  afficherFormulaire = false;
  enChargement = false;
  formulaire: FormGroup;

  constructor(
    private serviceApi: ServiceApi,
    private fb: FormBuilder
  ) {
    this.formulaire = this.fb.group({
      montant: [0, [Validators.required, Validators.min(0.01)]],
      dateDebut: [new Date().toISOString().split('T')[0], Validators.required],
      dateFin: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.chargerBudgets();
  }

  async chargerBudgets(): Promise<void> {
    this.enChargement = true;
    try {
      this.budgets = await firstValueFrom(
        this.serviceApi.get<Budget[]>('/budgets')
      );
    } catch (error) {
      console.error('Erreur lors du chargement des budgets', error);
    } finally {
      this.enChargement = false;
    }
  }

  async soumettre(): Promise<void> {
    if (!this.formulaire.valid) {
      return;
    }

    try {
      await firstValueFrom(
        this.serviceApi.post('/budgets', this.formulaire.value)
      );
      this.afficherFormulaire = false;
      this.formulaire.reset();
      await this.chargerBudgets();
    } catch (error) {
      console.error('Erreur lors de la création du budget', error);
    }
  }

  annuler(): void {
    this.afficherFormulaire = false;
    this.formulaire.reset();
  }
}

