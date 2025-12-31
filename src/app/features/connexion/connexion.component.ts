import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceAuthentification } from '../../core/services/service-authentification.service';
import { ServiceApi } from '../../core/services/service-api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './connexion.component.html',
  styleUrl: './connexion.component.css'
})
export class ConnexionComponent implements OnInit {
  formulaire: FormGroup;
  estInscription = false;
  erreur = '';
  enChargement = false;

  constructor(
    private fb: FormBuilder,
    private serviceAuth: ServiceAuthentification,
    private serviceApi: ServiceApi,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formulaire = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      prenom: [''],
      nom: ['']
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['google'] === 'success') {
        this.traiterCallbackGoogle();
      }
    });
  }

  async traiterCallbackGoogle(): Promise<void> {
    this.enChargement = true;
    try {
      const response = await firstValueFrom(
        this.serviceApi.get<any>('/auth/oauth2/user')
      );
      
      if (response && response.utilisateur) {
        this.serviceAuth['utilisateurSubject'].next(response.utilisateur);
        this.serviceApi.setUtilisateurId(response.utilisateur.id);
        localStorage.setItem('utilisateur', JSON.stringify(response.utilisateur));
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      this.erreur = 'Erreur lors de la connexion avec Google';
      console.error('Erreur callback Google', error);
    } finally {
      this.enChargement = false;
    }
  }

  basculerMode(): void {
    this.estInscription = !this.estInscription;
    this.erreur = '';
    if (this.estInscription) {
      this.formulaire.get('prenom')?.setValidators([]);
      this.formulaire.get('nom')?.setValidators([]);
    } else {
      this.formulaire.get('prenom')?.clearValidators();
      this.formulaire.get('nom')?.clearValidators();
    }
    this.formulaire.get('prenom')?.updateValueAndValidity();
    this.formulaire.get('nom')?.updateValueAndValidity();
  }

  async soumettre(): Promise<void> {
    if (!this.formulaire.valid) {
      return;
    }

    this.enChargement = true;
    this.erreur = '';

    try {
      const { email, motDePasse, prenom, nom } = this.formulaire.value;
      
      if (this.estInscription) {
        await this.serviceAuth.creerCompte(email, motDePasse, prenom, nom);
      } else {
        await this.serviceAuth.connecter(email, motDePasse);
      }

      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.erreur = error.message || 'Une erreur est survenue';
    } finally {
      this.enChargement = false;
    }
  }

  async connecterAvecGoogle(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.serviceApi.get<{ url: string }>('/auth/google/url')
      );
      window.location.href = `http://localhost:9999${response.url}`;
    } catch (error) {
      this.erreur = 'Impossible de se connecter avec Google';
      console.error('Erreur URL Google', error);
    }
  }
}

