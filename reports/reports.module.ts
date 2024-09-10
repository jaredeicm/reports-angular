import { DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimengModule } from 'src/app/shared/primeng.module';
import { SharedModule } from '../../shared/shared.module';
import { DashO2oComponent } from './pages/dash-o2o/dash-o2o.component';
import { GestaoO2oRoutingModule } from './reports.routing';
import { OrdersFiltersComponent } from './components/dash-o2o/orders-filters/orders-filters.component';
import { FailedFiltersComponent } from './components/dash-o2o/failed-filters/failed-filters.component';
import { FailedDeliveryTableComponent } from './components/dash-o2o/failed-delivery-table/failed-delivery-table.component';
import { DistanceErrorTableComponent } from './components/dash-o2o/distance-error-table/distance-error-table.component';
import { DeliveryDelayTableComponent } from './components/dash-o2o/delivery-delay-table/delivery-delay-table.component';
import { ZoneParamsTableComponent } from './components/dash-o2o/zone-params-table/zone-params-table.component';
import { OrdersTableComponent } from './components/dash-o2o/orders-table/orders-table.component';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SidebarSavedFiltersComponent } from './components/dash-o2o/sidebar-saved-filters/sidebar-saved-filters.component';
import { FiltersZoneParamsComponent } from './components/dash-o2o/filters-zone-params/filters-zone-params.component';
import { FiltersDelayComponent } from './components/dash-o2o/filters-delay/filters-delay.component';
import { FiltersActionsComponent } from './components/dash-o2o/filters-actions/filters-actions.component';
import { ActionsTableComponent } from './components/dash-o2o/actions-table/actions-table.component';
import { FiltersDistanceComponent } from './components/dash-o2o/filters-distance/filters-distance.component';
import { IssuesReportComponent } from './pages/issues-report/issues-report.component';
import { DynamicTableComponent } from './components/issues/dynamic-table/dynamic-table.component';
import { DynamicFiltersComponent } from './components/issues/dynamic-filters/dynamic-filters.component';
import { SavedFiltersComponent } from './components/issues/saved-filters/saved-filters.component';
import { SidebarIssueAllocateComponent } from './components/issues/sidebar-issue-allocate/sidebar-issue-allocate.component';

import ptBr from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

registerLocaleData(ptBr);


@NgModule({
  declarations: [
    DashO2oComponent,
    SidebarSavedFiltersComponent,
    OrdersFiltersComponent,
    FailedFiltersComponent,
    FiltersZoneParamsComponent,
    FiltersDelayComponent,
    FiltersActionsComponent,
    FiltersDistanceComponent,
    FailedDeliveryTableComponent,
    DistanceErrorTableComponent,
    DeliveryDelayTableComponent,
    ActionsTableComponent,
    ZoneParamsTableComponent,
    OrdersTableComponent,
    IssuesReportComponent,
    DynamicTableComponent,
    DynamicFiltersComponent,
    SavedFiltersComponent,
    SidebarIssueAllocateComponent,
  ],
  imports: [
    CommonModule,
    PrimengModule,
    SharedModule,
    GestaoO2oRoutingModule,
    ToggleButtonModule,
  ],
  providers:    [
    { provide: LOCALE_ID, useValue: 'pt' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
  ],
})
export class ReportsModule {}
