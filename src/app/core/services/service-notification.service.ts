import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServiceNotification {
  private permission: NotificationPermission = 'default';

  constructor() {
    this.verifierPermission();
  }

  private async verifierPermission(): Promise<void> {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async demanderPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Les notifications ne sont pas supportées');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'default') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  async envoyerNotification(titre: string, options?: NotificationOptions): Promise<void> {
    if (this.permission !== 'granted') {
      const autorise = await this.demanderPermission();
      if (!autorise) {
        return;
      }
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(titre, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        vibrate: [200, 100, 200],
        ...options
      });
    } else if ('Notification' in window) {
      new Notification(titre, {
        icon: '/icons/icon-192x192.png',
        ...options
      });
    }
  }

  async envoyerNotificationDepensePartagee(nomUtilisateur: string, montant: number): Promise<void> {
    await this.envoyerNotification(
      'Nouvelle dépense partagée',
      {
        body: `${nomUtilisateur} a ajouté une dépense de ${montant}€`,
        tag: 'depense-partagee',
        requireInteraction: false
      }
    );
  }

  async envoyerNotificationDefiComplete(titreDefi: string): Promise<void> {
    await this.envoyerNotification(
      'Défi complété ! 🎉',
      {
        body: `Félicitations ! Vous avez complété le défi : ${titreDefi}`,
        tag: 'defi-complete',
        requireInteraction: true
      }
    );
  }

  async envoyerNotificationBudgetDepasse(nomBudget: string): Promise<void> {
    await this.envoyerNotification(
      'Budget dépassé ⚠️',
      {
        body: `Attention ! Vous avez dépassé votre budget : ${nomBudget}`,
        tag: 'budget-depasse',
        requireInteraction: true
      }
    );
  }

  estAutorise(): boolean {
    return this.permission === 'granted';
  }
}

