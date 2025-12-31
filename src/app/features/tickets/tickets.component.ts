import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceApi } from '../../core/services/service-api.service';
import { firstValueFrom } from 'rxjs';

interface Ticket {
  id: number;
  urlImage: string;
  depenseId: number;
  articlesExtraits?: string;
}

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.css'
})
export class TicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  enChargement = false;
  fichierSelectionne: File | null = null;
  depenseIdSelectionnee: number | null = null;

  constructor(private serviceApi: ServiceApi) {}

  async ngOnInit(): Promise<void> {
    // Les tickets sont chargés via les dépenses
  }

  onFichierSelectionne(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fichierSelectionne = input.files[0];
    }
  }

  async scannerTicket(): Promise<void> {
    if (!this.fichierSelectionne || !this.depenseIdSelectionnee) {
      return;
    }

    this.enChargement = true;
    try {
      const formData = new FormData();
      formData.append('fichier', this.fichierSelectionne);
      formData.append('urlImage', '');

      // Note: Le backend attend un MultipartFile, mais HttpClient gère cela automatiquement
      await firstValueFrom(
        this.serviceApi.post(`/tickets/scanner/${this.depenseIdSelectionnee}`, formData)
      );
      
      this.fichierSelectionne = null;
      this.depenseIdSelectionnee = null;
    } catch (error) {
      console.error('Erreur lors du scan du ticket', error);
    } finally {
      this.enChargement = false;
    }
  }
}

