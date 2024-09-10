import { Routes, RouterModule } from '@angular/router';
import { DashO2oComponent } from './pages/dash-o2o/dash-o2o.component';
import { IssuesReportComponent } from './pages/issues-report/issues-report.component';
import { NgModule } from '@angular/core';


const routes: Routes = [
  {
    path: 'o2o',
    component: DashO2oComponent,
    data: { title: 'Gestor de O2O' }
  },
  {
    path: 'issues',
    component: IssuesReportComponent,
    data: { title: 'Gestor de Operação' }
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestaoO2oRoutingModule { }