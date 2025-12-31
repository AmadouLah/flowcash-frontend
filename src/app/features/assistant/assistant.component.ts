import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceApi } from '../../core/services/service-api.service';
import { firstValueFrom } from 'rxjs';

interface Message {
  role: 'user' | 'assistant';
  contenu: string;
  timestamp: Date;
}

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './assistant.component.html',
  styleUrl: './assistant.component.css'
})
export class AssistantComponent implements OnInit {
  messages: Message[] = [];
  formulaire: FormGroup;
  enChargement = false;

  constructor(
    private serviceApi: ServiceApi,
    private fb: FormBuilder
  ) {
    this.formulaire = this.fb.group({
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.messages.push({
      role: 'assistant',
      contenu: 'Bonjour ! Je suis votre assistant IA FlowCash. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date()
    });
  }

  async envoyerMessage(): Promise<void> {
    if (!this.formulaire.valid || this.enChargement) {
      return;
    }

    const messageUtilisateur = this.formulaire.get('message')?.value;
    this.messages.push({
      role: 'user',
      contenu: messageUtilisateur,
      timestamp: new Date()
    });

    this.formulaire.reset();
    this.enChargement = true;

    try {
      const reponse = await firstValueFrom(
        this.serviceApi.post<{ reponse: string; historique: any[] }>('/ia/chat', {
          message: messageUtilisateur,
          historique: this.messages.slice(-10).map(m => ({
            role: m.role,
            content: m.contenu
          }))
        })
      );

      this.messages.push({
        role: 'assistant',
        contenu: reponse.reponse || 'Désolé, je n\'ai pas pu traiter votre demande.',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message', error);
      this.messages.push({
        role: 'assistant',
        contenu: 'Une erreur est survenue. Veuillez réessayer.',
        timestamp: new Date()
      });
    } finally {
      this.enChargement = false;
    }
  }
}

