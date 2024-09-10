import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { take } from 'rxjs/operators';
import { ReportsOperationService } from 'src/app/core/services/reports-operation.service';
// import { ReportsO2OService } from 'src/app/core/services/reports-o2o.service';
import { LoadingService } from 'src/app/shared/services/loading.service';

@Component({
  selector: 'app-saved-filters',
  templateUrl: './saved-filters.component.html',
  styleUrls: ['./saved-filters.component.scss'],
})
export class SavedFiltersComponent implements OnInit {
  @Input() showSidebar = false;
  @Input() userFilters: any[];
  @Output() hideSidebar = new EventEmitter();

  nameFilters: any = {
    created_start: 'Data de criação Mín.',
    created_end: 'Data de criação Máx.',
    order_id: 'ID pedido',
    status: 'Status',
    time_start: 'Tempo Mín.',
    time_end: 'Tempo Máx.',
    operator_id: 'ID do operador',
    delivery_id: 'ID da entrega',
    cities: 'Cidades',
    delays: 'Age',
    stores_id: 'IDs de Lojas',
    created_at: 'Data da criação',
    deliveryman_id: 'ID do entregador',
    counter_min: 'Contador Mín.',
    counter_max: 'Contador Máx.',
    modal: 'Modal',
    purchase_date_start: 'Data de compra Mín.',
    purchase_date_end: 'Data de compra Máx.',
    value_start: 'Valor Mín.',
    value_end: 'Valor Máx.',
    bonus_start: 'Bônus Mín.',
    bonus_end: 'Bônus Máx.',
    distance_start: 'Distância Mín.',
    distance_end: 'Distância Máx.',
    route_id: 'ID da rota',
    deliveryman: 'Entregador',

    media_min: 'Média de resolução Mín.',
    media_max: 'Média de resolução Máx.',
    qnt_occurrences_min: 'Quantidade de ocorrencias Mín.',
    qnt_occurrences_max: 'Quantidade de ocorrencias Máx.',
    qnt_orders_min: 'Quantidade de pedidos Máx.',
    qnt_orders_max: 'Quantidade de pedidos Máx.',
    qnt_occurrences: 'Quantidade de ocorrências',
    operators_id: 'IDs dos operadores',
    period: 'Período',

    attributed_min: 'Quantidade de atribuídos Mín.',
    attributed_max: 'Quantidade de atribuídos Máx.',
    sectors: 'IDs dos setores',
    padlock: 'Cadeado',
    time_min:'Hora inicial',
    time_max:'Hora final',
  };

  constructor(
    // private reportService: ReportsO2OService,
    private loadingService: LoadingService,
    private confirmationService: ConfirmationService,
    private reportService: ReportsOperationService,
  ) {}

  ngOnInit() {}

  prepare() {
    this.userFilters.forEach((e) => {
      e['expanded'] = false;
    });
  }

  paramsOnly(item) {
    let params = { ...item };
    delete params.filter_name;
    delete params.id;
    delete params.name;
    delete params.expanded;

    return params;
  }

  translateKey(key) {
    return this.nameFilters.hasOwnProperty(key) ? this.nameFilters[key] : key;
  }

  deleteFilter(filter, index) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o filtro salvo <b>${filter.name}</b>?`,
      header: `Tem certeza?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      acceptButtonStyleClass: 'packk',
      rejectButtonStyleClass: 'packk',
      rejectLabel: 'Não',
      accept: () => {
        this.loadingService.loadingOn();
        this.reportService
          .deleteFilter(filter.filter_name, filter.id)
          .pipe(take(1))
          .subscribe({
            next: () => {
              this.userFilters.splice(index, 1);
              this.loadingService.loadingOff();
              if(!this.userFilters.length) this.hideFilters();
            },
            error: () => this.loadingService.loadingOff(),
          });
      },
    });
  }

  hideFilters() {
    this.hideSidebar.emit(true);
  }
}
