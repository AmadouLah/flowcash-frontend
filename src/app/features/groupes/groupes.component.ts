import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceApi } from '../../core/services/service-api.service';
import { firstValueFrom } from 'rxjs';

interface Groupe {
  id: number;
  nom: string;
  description?: string;
  createurId: number;
}

@Component({
  selector: 'app-groupes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './groupes.component.html',
  styleUrl: './groupes.component.css'
})
export class GroupesComponent implements OnInit {
  groupes: Groupe[] = [];
  afficherFormulaire = false;
  enChargement = false;
  formulaire: FormGroup;

  constructor(
    private serviceApi: ServiceApi,
    private fb: FormBuilder
  ) {
    this.formulaire = this.fb.group({
      nom: ['', Validators.required],
      description: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    await this.chargerGroupes();
  }

  async chargerGroupes(): Promise<void> {
    this.enChargement = true;
    try {
      this.groupes = await firstValueFrom(
        this.serviceApi.get<Groupe[]>('/groupes')
      );
    } catch (error) {
      console.error('Erreur lors du chargement des groupes', error);
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
        this.serviceApi.post('/groupes', this.formulaire.value)
      );
      this.afficherFormulaire = false;
      this.formulaire.reset();
      await this.chargerGroupes();
    } catch (error) {
      console.error('Erreur lors de la création du groupe', error);
    }
  }

  annuler(): void {
    this.afficherFormulaire = false;
    this.formulaire.reset();
  }
}

