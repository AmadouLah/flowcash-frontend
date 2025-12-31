import { Routes } from '@angular/router';
import { ConnexionComponent } from './features/connexion/connexion.component';
import { ComposantLayout } from './shared/components/composant-layout/composant-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DepensesComponent } from './features/depenses/depenses.component';
import { BudgetsComponent } from './features/budgets/budgets.component';
import { EnveloppesComponent } from './features/enveloppes/enveloppes.component';
import { CategoriesComponent } from './features/categories/categories.component';
import { GroupesComponent } from './features/groupes/groupes.component';
import { TicketsComponent } from './features/tickets/tickets.component';
import { DefisComponent } from './features/defis/defis.component';
import { AssistantComponent } from './features/assistant/assistant.component';

export const routes: Routes = [
  { path: 'connexion', component: ConnexionComponent },
  {
    path: '',
    component: ComposantLayout,
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'depenses', component: DepensesComponent },
      { path: 'budgets', component: BudgetsComponent },
      { path: 'enveloppes', component: EnveloppesComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'groupes', component: GroupesComponent },
      { path: 'tickets', component: TicketsComponent },
      { path: 'defis', component: DefisComponent },
      { path: 'assistant', component: AssistantComponent }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
