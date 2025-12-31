import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-composant-prompt-install',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './composant-prompt-install.component.html',
  styleUrl: './composant-prompt-install.component.css'
})
export class ComposantPromptInstall {
  @Input() visible = false;
  @Output() installer = new EventEmitter<void>();
  @Output() fermer = new EventEmitter<void>();

  onInstaller(): void {
    this.installer.emit();
  }

  onFermer(): void {
    this.fermer.emit();
  }
}

