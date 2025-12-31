import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceApi {
  private apiUrl = 'http://localhost:9999/api';
  private utilisateurIdSubject = new BehaviorSubject<number | null>(null);
  public utilisateurId$ = this.utilisateurIdSubject.asObservable();

  constructor(private http: HttpClient) {}

  setUtilisateurId(id: number): void {
    this.utilisateurIdSubject.next(id);
  }

  private getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-User-Id': this.utilisateurIdSubject.value?.toString() || ''
    });
    return headers;
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    const isFormData = data instanceof FormData;
    const headers = isFormData ? new HttpHeaders({
      'X-User-Id': this.utilisateurIdSubject.value?.toString() || ''
    }) : this.getHeaders();
    
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, {
      headers: headers
    }).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      errorMessage = `Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  };
}

