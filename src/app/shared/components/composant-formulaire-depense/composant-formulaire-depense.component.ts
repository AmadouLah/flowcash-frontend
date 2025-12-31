import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface DepenseFormData {
  montant: number;
  description?: string;
  categorieId: number;
  dateDepense: Date;
  latitude?: number;
  longitude?: number;
  adresse?: string;
}

@Component({
  selector: 'app-composant-formulaire-depense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './composant-formulaire-depense.component.html',
  styleUrl: './composant-formulaire-depense.component.css'
})
export class ComposantFormulaireDepense {
  @Input() categories: Array<{ id: number; nom: string }> = [];
  @Output() soumettre = new EventEmitter<DepenseFormData>();
  @Output() annuler = new EventEmitter<void>();

  formulaire: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formulaire = this.fb.group({
      montant: [0, [Validators.required, Validators.min(0.01)]],
      description: [''],
      categorieId: [null, Validators.required],
      dateDepense: [new Date(), Validators.required],
      adresse: ['']
    });
  }

  onSubmit(): void {
    if (this.formulaire.valid) {
      const valeur = { ...this.formulaire.value };
      // Convertir la date string en Date si nécessaire
      if (typeof valeur.dateDepense === 'string') {
        valeur.dateDepense = new Date(valeur.dateDepense);
      }
      this.soumettre.emit(valeur);
    }
  }

  onAnnuler(): void {
    this.annuler.emit();
  }
}

