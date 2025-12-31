import { Injectable, Optional } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ServicePWA {
  private installPromptEvent: any = null;
  private installPromptSubject = new BehaviorSubject<boolean>(false);
  public installPrompt$: Observable<boolean> = this.installPromptSubject.asObservable();

  private updateAvailableSubject = new BehaviorSubject<boolean>(false);
  public updateAvailable$: Observable<boolean> = this.updateAvailableSubject.asObservable();

  constructor(@Optional() private swUpdate: SwUpdate | null) {
    this.initializeInstallPrompt();
    this.initializeUpdateCheck();
  }

  private initializeInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.installPromptEvent = event;
      this.installPromptSubject.next(true);
    });

    window.addEventListener('appinstalled', () => {
      this.installPromptEvent = null;
      this.installPromptSubject.next(false);
    });
  }

  private initializeUpdateCheck(): void {
    if (this.swUpdate?.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(
          filter((evt: any): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
        )
        .subscribe(() => {
          this.updateAvailableSubject.next(true);
        });

      this.swUpdate.checkForUpdate();
      
      setInterval(() => {
        this.swUpdate?.checkForUpdate();
      }, 6 * 60 * 60 * 1000);
    }
  }

  async promptInstall(): Promise<boolean> {
    if (!this.installPromptEvent) {
      return false;
    }

    this.installPromptEvent.prompt();
    const { outcome } = await this.installPromptEvent.userChoice;
    
    if (outcome === 'accepted') {
      this.installPromptEvent = null;
      this.installPromptSubject.next(false);
      return true;
    }
    
    return false;
  }

  async updateApp(): Promise<void> {
    if (this.swUpdate?.isEnabled) {
      await this.swUpdate.activateUpdate();
      window.location.reload();
    }
  }

  isInstallable(): boolean {
    return this.installPromptEvent !== null;
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailableSubject.value;
  }
}

