import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ServiceAuthentification } from '../../../core/services/service-authentification.service';

@Component({
  selector: 'app-composant-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './composant-layout.component.html',
  styleUrl: './composant-layout.component.css'
})
export class ComposantLayout implements OnInit {
  utilisateurConnecte = false;
  nomUtilisateur = '';

  constructor(
    private serviceAuth: ServiceAuthentification,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.serviceAuth.utilisateur$.subscribe(utilisateur => {
      this.utilisateurConnecte = utilisateur !== null;
      if (utilisateur) {
        this.nomUtilisateur = utilisateur.prenom || utilisateur.email;
      }
    });
  }

  deconnecter(): void {
    this.serviceAuth.deconnecter();
    this.router.navigate(['/connexion']);
  }
}

