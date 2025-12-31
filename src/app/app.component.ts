import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ServicePWA } from './core/services/service-pwa.service';
import { ServiceTheme } from './core/services/service-theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'FlowCash';
  afficherPromptInstall = false;
  afficherUpdateDisponible = false;

  constructor(
    private servicePWA: ServicePWA,
    private serviceTheme: ServiceTheme
  ) {}

  ngOnInit(): void {
    this.servicePWA.installPrompt$.subscribe(disponible => {
      this.afficherPromptInstall = disponible;
    });

    this.servicePWA.updateAvailable$.subscribe(disponible => {
      this.afficherUpdateDisponible = disponible;
    });
  }

  async installerApp(): Promise<void> {
    await this.servicePWA.promptInstall();
  }

  async mettreAJourApp(): Promise<void> {
    await this.servicePWA.updateApp();
  }

  fermerPromptInstall(): void {
    this.afficherPromptInstall = false;
  }

  fermerPromptUpdate(): void {
    this.afficherUpdateDisponible = false;
  }
}
