import { Injectable } from '@angular/core';
import { ServiceApi } from './service-api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

export interface Utilisateur {
  id: number;
  email: string;
  prenom?: string;
  nom?: string;
  actif: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceAuthentification {
  private utilisateurSubject = new BehaviorSubject<Utilisateur | null>(null);
  public utilisateur$: Observable<Utilisateur | null> = this.utilisateurSubject.asObservable();

  constructor(private serviceApi: ServiceApi) {
    const utilisateurSauvegarde = localStorage.getItem('utilisateur');
    if (utilisateurSauvegarde) {
      this.utilisateurSubject.next(JSON.parse(utilisateurSauvegarde));
      const utilisateur = JSON.parse(utilisateurSauvegarde);
      this.serviceApi.setUtilisateurId(utilisateur.id);
    }
  }

  async connecter(email: string, motDePasse: string): Promise<Utilisateur> {
    const utilisateur = await firstValueFrom(
      this.serviceApi.post<Utilisateur>('/auth/login', { email, motDePasse })
    );
    this.utilisateurSubject.next(utilisateur);
    this.serviceApi.setUtilisateurId(utilisateur.id);
    localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
    return utilisateur;
  }

  async creerCompte(email: string, motDePasse: string, prenom?: string, nom?: string): Promise<Utilisateur> {
    const utilisateur = await firstValueFrom(
      this.serviceApi.post<Utilisateur>('/auth/register', { email, motDePasse, prenom, nom })
    );
    this.utilisateurSubject.next(utilisateur);
    this.serviceApi.setUtilisateurId(utilisateur.id);
    localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
    return utilisateur;
  }

  deconnecter(): void {
    this.utilisateurSubject.next(null);
    this.serviceApi.setUtilisateurId(0);
    localStorage.removeItem('utilisateur');
  }

  obtenirUtilisateurActuel(): Utilisateur | null {
    return this.utilisateurSubject.value;
  }
}

