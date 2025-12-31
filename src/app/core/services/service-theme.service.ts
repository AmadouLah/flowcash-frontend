import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'zen' | 'focus' | 'alert' | 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ServiceTheme {
  private themeSubject = new BehaviorSubject<Theme>('light');
  public theme$: Observable<Theme> = this.themeSubject.asObservable();

  constructor() {
    const themeSauvegarde = localStorage.getItem('theme') as Theme;
    if (themeSauvegarde) {
      this.appliquerTheme(themeSauvegarde);
    }
  }

  calculerThemeSelonSanteFinanciere(pourcentageSante: number): Theme {
    if (pourcentageSante < 20) {
      return 'alert';
    } else if (pourcentageSante < 50) {
      return 'focus';
    } else {
      return 'zen';
    }
  }

  appliquerTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  obtenirThemeActuel(): Theme {
    return this.themeSubject.value;
  }
}

