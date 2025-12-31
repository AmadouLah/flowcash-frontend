import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceApi } from '../../core/services/service-api.service';
import { firstValueFrom } from 'rxjs';

interface Categorie {
  id: number;
  nom: string;
  description?: string;
  couleur?: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  categories: Categorie[] = [];
  afficherFormulaire = false;
  enChargement = false;
  formulaire: FormGroup;

  constructor(
    private serviceApi: ServiceApi,
    private fb: FormBuilder
  ) {
    this.formulaire = this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      couleur: ['#3b82f6']
    });
  }

  async ngOnInit(): Promise<void> {
    await this.chargerCategories();
  }

  async chargerCategories(): Promise<void> {
    this.enChargement = true;
    try {
      this.categories = await firstValueFrom(
        this.serviceApi.get<Categorie[]>('/categories')
      );
    } catch (error) {
      console.error('Erreur lors du chargement des catégories', error);
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
        this.serviceApi.post('/categories', this.formulaire.value)
      );
      this.afficherFormulaire = false;
      this.formulaire.reset();
      await this.chargerCategories();
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie', error);
    }
  }

  async supprimer(id: number): Promise<void> {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    try {
      await firstValueFrom(
        this.serviceApi.delete(`/categories/${id}`)
      );
      await this.chargerCategories();
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie', error);
    }
  }

  annuler(): void {
    this.afficherFormulaire = false;
    this.formulaire.reset();
  }
}

