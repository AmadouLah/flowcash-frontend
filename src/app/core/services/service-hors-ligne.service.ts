import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

interface DepenseOffline {
  id?: number;
  montant: number;
  description?: string;
  categorieId: number;
  dateDepense: Date;
  latitude?: number;
  longitude?: number;
  adresse?: string;
  synchronise: boolean;
  dateCreation: Date;
}

class BaseDonneesOffline extends Dexie {
  depenses!: Table<DepenseOffline, number>;

  constructor() {
    super('FlowCashDB');
    const stores: Record<string, string> = {
      depenses: '++id, synchronise, dateCreation'
    };
    this.version(1).stores(stores);
  }
}

@Injectable({
  providedIn: 'root'
})
export class ServiceHorsLigne {
  private db = new BaseDonneesOffline();

  async ajouterDepense(depense: Omit<DepenseOffline, 'id' | 'synchronise' | 'dateCreation'>): Promise<number> {
    return await this.db.depenses.add({
      ...depense,
      synchronise: false,
      dateCreation: new Date()
    } as DepenseOffline);
  }

  async obtenirDepensesNonSynchronisees(): Promise<DepenseOffline[]> {
    return await this.db.depenses
      .filter(depense => depense.synchronise === false)
      .toArray();
  }

  async marquerCommeSynchronise(id: number): Promise<void> {
    await this.db.depenses.update(id, { synchronise: true });
  }

  async obtenirToutesDepenses(): Promise<DepenseOffline[]> {
    return await this.db.depenses.toArray();
  }

  async supprimerDepense(id: number): Promise<void> {
    await this.db.depenses.delete(id);
  }
}

