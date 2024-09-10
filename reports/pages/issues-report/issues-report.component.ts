import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { take } from 'rxjs/operators';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { format } from 'date-fns';
import { ReportsOperationService } from 'src/app/core/services/reports-operation.service';
import { DynamicFormConfig } from '../../models/dynamic-form-config.model';

interface Operator {
  id: number;
  nome: string;
  sobrenome: string;
}

@Component({
  selector: 'app-issues-report',
  templateUrl: './issues-report.component.html',
  styleUrls: ['./issues-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class IssuesReportComponent implements OnInit {
  showSidebarAllocate: boolean = false;
  paramsAllocate: any;
  operatorsOpened: boolean = true;
  issuesOpened: boolean = true;

  customInterval: boolean = false;

  today = new Date();

  intervalInfo: string;
  interval_min: any;
  interval_max: any;

  sharedInterval: { period; start_date?; end_date? };

  intervalData = [
    { value: 'today', title: 'Hoje' },
    { value: 'last_7_days', title: 'Últimos 7 dias' },
    { value: 'last_30_days', title: 'Últimos 30 dias' },
    { value: 'last_3_months', title: 'Últimos 3 meses' },
    { value: 'custom_range', title: 'Definir intervalo' },
  ];
  metricCards: any;
  metricOrders: any;
  storesOverload: any;

  // Shared Infos

  operators: Operator[] = [];
  types: [{ issue; flag }];
  sectors: [{ id; name }];
  filters: any;

  constructor(
    private loadingService: LoadingService,
    private reportsService: ReportsOperationService
  ) {}

  ngOnInit() {
    this.metricCards = [
      {
        field: 'assigned_occurrences',
        title: 'Ocorrências atribuídas',
        value: null,
        class: 'text-green text-4xl',
      },
      {
        field: 'unassigned_occurrences',
        title: 'Ocorrências sem atribuição',
        value: null,
        class: 'text-danger-light text-4xl',
      },
      {
        field: 'completed_occurrences',
        title: 'Ocorrências finalizadas',
        value: null,
        class: 'text-green text-4xl',
      },
      {
        field: 'online_operators',
        title: 'Operadores online',
        value: null,
        class: 'text-green text-4xl',
      },
    ];
    this.getSavedPeriod();
    // this.listQuickStats('today');
    this.getInfos();
  }

  getInfos() {
    this.reportsService
      .getInfosSetup()
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          //Operadores
          this.operators = res.data.operators.map((v) => {
            return {
              title: `${v.nome} ${v.sobrenome}`,
              value: Number(v.id),
            };
          });
          this.quickFilterPerformance.operators_id.options = this.operators;
          this.quickFilterOperatorsOn.operators_id.options = this.operators;

          //Tipo de ocorrencia
          this.types = this.fillOptions(res.data.types, 'issue', 'flag');
          this.quickFilterUnallocated.issue_flag.options = this.types;
          this.quickFilterIssuesInProgress.issue_flag.options = this.types;
          this.quickFilterIssuesFinished.issue_flag.options = this.types;
          this.quickFilterIssuesType.issue_flag.options = this.types;

          //SETOR
          this.sectors = this.fillOptions(res.data.sectors, 'name', 'id');
          this.quickFilterOperatorsOn.sectors.options = this.sectors;
          this.quickFilterUnallocated.sectors_id.options = this.sectors;
          this.quickFilterIssuesInProgress.sectors_id.options = this.sectors;
          this.quickFilterIssuesFinished.sectors_id.options = this.sectors;
          this.quickFilterIssuesType.sectors_id.options = this.sectors;

          //Filtros salvos
          this.filters = res.data.filters;
        },
      });
  }

  fillOptions(options, title, value) {
    let formattedOptions = options.map((v) => {
      return {
        title: v[title],
        value: v[value],
      };
    });
    return formattedOptions;
  }

  getSavedPeriod() {
    const infos = JSON.parse(sessionStorage.getItem('period-filter'));
    this.intervalInfo = infos?.intervalInfo ? infos.intervalInfo : 'today';
    this.customInterval = infos?.customInterval;
    infos?.interval_min
      ? (this.interval_min = new Date(infos.interval_min))
      : null;
    infos?.interval_max
      ? (this.interval_max = new Date(infos.interval_max))
      : null;

    if (infos?.intervalInfo == 'custom_range') {
      this.listQuickStats(this.getCustomInterval());
    } else {
      this.listQuickStats(this.intervalInfo);
    }
  }

  defaultPeriod() {
    this.interval_min = null;
    this.interval_max = null;
    this.customInterval = false;
    this.intervalInfo = this.intervalData[0].value;
    this.setInterval('today');
  }

  // ----------- PERFORMACE DE OPERADORES -------------- //

  headerPerformance: any = [
    {
      title: 'Operador',
      sort: true,
      field: 'operator',
    },
    {
      title: 'Nº de ocorrências',
      sort: true,
      field: 'quantity_occurrences',
    },
    {
      title: 'Nº de pedidos',
      sort: true,
      field: 'quantity_orders',
    },
    {
      title: 'Tempo médio de resolução',
      sort: true,
      field: 'media_in_minutes',
      isTime: true,
    },
  ];

  quickFilterPerformance: any = {
    period: {
      label: 'Período de análise',
      field: 'period',
      filtered: false,
      singleSelect: true,
      enableSearch: false,
      search: null,
      customInterval: false,
      class: 'w-20rem',
      options: [
        { value: 'today', title: 'Hoje' },
        { value: 'last_7_days', title: 'Últimos 7 dias' },
        { value: 'last_30_days', title: 'Últimos 30 dias' },
        { value: 'last_3_months', title: 'Últimos 3 meses' },
        { value: 'custom_range', title: 'Período personalizado' },
      ],
      selectedAux: null,
      selecteds: null,
    },
    operators_id: {
      label: 'Operador',
      filtered: false,
      field: 'operators_id',
      singleSelect: false,
      enableSearch: true,
      search: null,
      options: [],
      selectedAux: null,
      selecteds: null,
    },
    qnt_occurrences: {
      label: 'Nº de ocorrências',
      filtered: false,
      field: 'qnt_occurrences',
      singleSelect: false,
      enableSearch: false,
      class: 'w-12rem',
      options: [
        { value: 1, title: '1' },
        { value: 2, title: '2' },
        { value: 3, title: '3' },
        { value: 4, title: '4' },
        { value: 5, title: '5' },
        { value: 6, title: '6' },
        { value: 7, title: '7' },
        { value: 8, title: '8' },
        { value: 9, title: '9' },
        { value: 10, title: '10' },
      ],
      selectedAux: null,
      selecteds: null,
    },
  };

  filtersPerformance: DynamicFormConfig[] = [
    {
      type: 'multiselect',
      label: 'Operador',
      key: 'operators_id',
      placeholder: 'Todos',
      allowFilter: true,
    },
    {
      type: 'dual-number',
      label: 'Número de ocorrências',
      dualField: true,
      key_min: 'qnt_occurrences_min',
      key_max: 'qnt_occurrences_max',
    },
    {
      type: 'dual-number',
      label: 'Número de pedidos',
      dualField: true,
      key_min: 'qnt_orders_min',
      key_max: 'qnt_orders_max',
    },
    {
      type: 'dual-number',
      label: 'Tempo médio de resolução',
      dualField: true,
      key_min: 'media_min',
      key_max: 'media_max',
    },
  ];

  //----------- OPERADORES ONLINE ------------ //

  headerOperatorsOn: any = [
    {
      title: 'Operador',
      sort: false,
      field: 'operator',
    },
    {
      title: 'Setor',
      sort: true,
      field: 'sector',
    },
    {
      title: 'Hora',
      sort: true,
      field: 'time',
    },
    { title: 'Atribuído', sort: true, field: 'attributed' },
    {
      title: 'Cadeado',
      sort: true,
      field: 'padlock',
    },
  ];

  quickFilterOperatorsOn: any = {
    operators_id: {
      label: 'Operador',
      filtered: false,
      field: 'operators_id',
      singleSelect: false,
      enableSearch: true,
      search: null,
      options: [],
      selectedAux: null,
      selecteds: null,
    },
    sectors: {
      label: 'Setor',
      filtered: false,
      field: 'sectors',
      singleSelect: false,
      enableSearch: false,
      options: [],
      selectedAux: null,
      selecteds: null,
    },
    padlock: {
      label: 'Cadeado',
      field: 'padlock',
      class: 'w-10rem',
      filtered: false,
      singleSelect: true,
      enableSearch: false,
      options: [
        { value: '', title: 'Todos' },
        { value: 'livre', title: 'Livre' },
        { value: 'bloqueado', title: 'Bloqueado' },
      ],
      selectedAux: null,
      selecteds: null,
    },
  };

  filtersOperatorsOn: DynamicFormConfig[] = [
    {
      type: 'multiselect',
      label: 'Operador',
      key: 'operators_id',
      placeholder: 'Todos',
      allowFilter: true,
    },
    {
      type: 'multiselect',
      label: 'Setor',
      key: 'sectors',
      placeholder: 'Todos',
    },
    {
      type: 'dual-number',
      label: 'Hora',
      dualField: true,
      key_min: 'time_min',
      key_max: 'time_max',
      suffix: ':00',
      min_value: 0,
      max_value: 24,
    },
    {
      type: 'dual-number',
      label: 'Atribuído',
      dualField: true,
      key_min: 'attributed_min',
      key_max: 'attributed_max',
    },
    {
      type: 'dropdown',
      label: 'Cadeado',
      key: 'padlock',
      placeholder: 'Todos',
    },
  ];

  //----------- Ocorrências sem atribuição ------------ //

  headerUnallocated: any = [
    {
      title: 'Ocorrência',
      sort: false,
      field: 'occurrence',
    },
    {
      title: 'ID ocorrência',
      sort: false,
      field: 'occurrence_id',
      orderLink: true,
    },
    {
      title: 'Setor',
      sort: true,
      field: 'sector',
    },
    {
      title: 'Criado a',
      sort: true,
      field: 'minutes_ago_created',
      isTime: true,
    },
    {
      title: 'Atribuir ocorrência',
      sort: false,
      field: 'allocate',
      isAllocate: true,
    },
  ];

  quickFilterUnallocated: any = {
    issue_flag: {
      label: 'Ocorrência',
      filtered: false,
      field: 'issue_flag',
      class: 'w-17rem',
      singleSelect: true,
      enableSearch: false,
      options: [],
      selectedAux: null,
      selecteds: null,
    },
    sectors_id: {
      label: 'Setor',
      filtered: false,
      field: 'sectors_id',
      singleSelect: false,
      enableSearch: false,
      search: null,
      options: [],
      selectedAux: null,
      selecteds: null,
    },
    period: {
      label: 'Criado a',
      field: 'period',
      class: 'w-20rem',
      filtered: false,
      singleSelect: true,
      enableSearch: false,
      options: [
        { value: 'last_30_minutes', title: 'Até 00h 30m' },
        { value: '31_minutes_to_1_hour', title: 'De 00h 31m a 01h 00m' },
        { value: '1_hour_to_2_hours', title: 'De 01h 01m a 02h 00m' },
        { value: 'more_2_hours', title: 'Acima de 02h 01m' },
      ],
      selectedAux: null,
      selecteds: null,
    },
  };

  filtersUnallocated: DynamicFormConfig[] = [
    {
      type: 'dropdown',
      label: 'Ocorrência',
      key: 'issue_flag',
      placeholder: 'Todos',
      allowFilter: true,
    },
    {
      type: 'input-number',
      label: 'ID ocorrência',
      key: 'issue_id',
      placeholder: 'Todos',
    },
    {
      type: 'multiselect',
      label: 'Setor',
      key: 'sectors_id',
      placeholder: 'Todos',
    },
    {
      type: 'dual-number',
      label: 'Criado a',
      dualField: true,
      key_min: 'minutes_ago_created_min',
      key_max: 'minutes_ago_created_max',
      suffix: ' min',
    },
  ];

  //----------- Ocorrências em andamento ------------ //

  headerIssuesInProgress: any = [
    {
      title: 'Ocorrência',
      sort: false,
      field: 'issue',
    },
    {
      title: 'ID ocorrência',
      sort: false,
      field: 'issue_id',
      orderLink: true,
    },
    {
      title: 'Setor',
      sort: true,
      field: 'sector',
    },
    {
      title: 'Operador',
      sort: false,
      field: 'operator',
    },
    {
      title: 'Duração',
      sort: true,
      field: 'minutes_ago_created',
      isTime: true,
    },
    {
      title: 'Atribuir ocorrência',
      sort: false,
      field: 'allocate',
      isAllocate: true,
    },
  ];

  quickFilterIssuesInProgress: any = {
    issue_flag: {
      label: 'Ocorrência',
      filtered: false,
      field: 'issue_flag',
      class: 'w-17rem',
      singleSelect: true,
      enableSearch: false,
      options: [],
      selectedAux: null,
      selecteds: null,
    },
    sectors_id: {
      label: 'Setor',
      filtered: false,
      field: 'sectors_id',
      singleSelect: false,
      enableSearch: false,
      search: null,
      options: [],
      selectedAux: null,
      selecteds: null,
    },
    period: {
      label: 'Duração',
      field: 'period',
      class: 'w-20rem',
      filtered: false,
      singleSelect: true,
      enableSearch: false,
      options: [
        { value: 'last_30_minutes', title: 'Até 00h 30m' },
        { value: '31_minutes_to_1_hour', title: 'De 00h 31m a 01h 00m' },
        { value: '1_hour_to_2_hours', title: 'De 01h 01m a 02h 00m' },
        { value: 'more_2_hours', title: 'Acima de 02h 01m' },
      ],
      selectedAux: null,
      selecteds: null,
    },
  };

  filtersIssuesInProgress: DynamicFormConfig[] = [
    {
      type: 'dropdown',
      label: 'Ocorrência',
      key: 'issue_flag',
      placeholder: 'Todos',
      allowFilter: true,
    },
    {
      type: 'input-number',
      label: 'ID ocorrência',
      key: 'issue_id',
      placeholder: 'Todos',
    },
    {
      type: 'multiselect',
      label: 'Setor',
      key: 'sectors_id',
      placeholder: 'Todos',
    },
    {
      type: 'dropdown',
      label: 'Operador',
      key: 'operator_id',
      placeholder: 'Todos',
      allowFilter: true,
    },
    {
      type: 'dual-number',
      label: 'Criado a',
      dualField: true,
      key_min: 'minutes_ago_created_min',
      key_max: 'minutes_ago_created_max',
      suffix: ' min',
    },
  ];

  //----------- Ocorrências Finalizadas ------------ //

  headerIssuesFinished: any = [
    {
      title: 'Ocorrência',
      sort: false,
      field: 'issue',
    },
    {
      title: 'ID ocorrência',
      sort: false,
      field: 'issue_id',
      orderLink: true,
    },
    {
      title: 'ID pedido',
      sort: false,
      field: 'order_id',
    },
    {
      title: 'Setor',
      sort: true,
      field: 'sector',
    },
    {
      title: 'Operador',
      sort: false,
      field: 'operator',
    },
    {
      title: 'Aberta',
      sort: true,
      field: 'opened',
      isTime: true,
      hourFormat: true,
    },
    {
      title: 'Finalizada',
      sort: true,
      field: 'finished',
      isTime: true,
      hourFormat: true,
    },
    {
      title: 'Duração',
      sort: true,
      field: 'duration_in_minutes',
      isTime: true,
    },
  ];

  quickFilterIssuesFinished: any = {
    issue_flag: {
      label: 'Ocorrência',
      filtered: false,
      field: 'issues_flag',
      class: 'w-17rem',
      singleSelect: false,
      enableSearch: false,
      options: [],
      selectedAux: null,
      selecteds: null,
    },
    sectors_id: {
      label: 'Setor',
      filtered: false,
      field: 'sectors_id',
      singleSelect: false,
      enableSearch: false,
      search: null,
      options: [],
      selectedAux: null,
      selecteds: null,
    },
    period: {
      label: 'Duração',
      field: 'period',
      class: 'w-20rem',
      filtered: false,
      singleSelect: true,
      enableSearch: false,
      options: [
        { value: 'last_30_minutes', title: 'Até 00h 30m' },
        { value: '31_minutes_to_1_hour', title: 'De 00h 31m a 01h 00m' },
        { value: '1_hour_to_2_hours', title: 'De 01h 01m a 02h 00m' },
        { value: 'more_2_hours', title: 'Acima de 02h 01m' },
      ],
      selectedAux: null,
      selecteds: null,
    },
  };

  filtersIssuesFinished: DynamicFormConfig[] = [
    {
      type: 'multiselect',
      label: 'Ocorrência',
      key: 'issues_flag',
      placeholder: 'Todas',
      allowFilter: true,
    },
    {
      type: 'input-number',
      label: 'ID ocorrência',
      key: 'issue_id',
      placeholder: 'Todos',
    },
    {
      type: 'input-number',
      label: 'ID pedido',
      key: 'order_id',
      placeholder: 'Todos',
    },
    {
      type: 'multiselect',
      label: 'Setor',
      key: 'sectors_id',
      placeholder: 'Todos',
    },
    {
      type: 'dropdown',
      label: 'Operador',
      key: 'operator_id',
      placeholder: 'Todos',
      allowFilter: true,
    },
    {
      type: 'dual-number',
      label: 'Aberta',
      dualField: true,
      key_min: 'opened_min',
      key_max: 'opened_max',
      suffix: ':00',
      min_value: 0,
      max_value: 24,
    },
    {
      type: 'dual-number',
      label: 'Finalizada',
      dualField: true,
      key_min: 'finished_min',
      key_max: 'finished_max',
      suffix: ':00',
      min_value: 0,
      max_value: 24,
    },
    {
      type: 'dual-number',
      label: 'Duração',
      dualField: true,
      key_min: 'duration_min',
      key_max: 'duration_max',
      suffix: ' min',
    },
  ];

  //----------- Performance por tipo de ocorrência ------------ //

  headerIssuesType: any = [
    {
      title: 'Ocorrência',
      sort: false,
      field: 'issue',
    },
    {
      title: 'Qtd. atribuídas',
      sort: true,
      field: 'quantity_assigned',
    },
    {
      title: 'Tempo médio de resolução',
      sort: true,
      field: 'mean_resolution_time_min',
      isTime: true,
    },
    {
      title: 'Qtd. sem atribuição',
      sort: false,
      field: 'quantity_unassigned',
    },
    {
      title: 'Quantidade total',
      sort: true,
      field: 'quantity_total',
    },
    {
      title: 'Setor',
      sort: true,
      field: 'sector',
    },
  ];

  quickFilterIssuesType: any = {
    period: {
      label: 'Período de análise',
      field: 'period',
      filtered: false,
      singleSelect: true,
      enableSearch: false,
      customInterval: false,
      class: 'w-20rem',
      options: [
        { value: 'today', title: 'Hoje' },
        { value: 'last_7_days', title: 'Últimos 7 dias' },
        { value: 'last_30_days', title: 'Últimos 30 dias' },
        { value: 'last_3_months', title: 'Últimos 3 meses' },
        { value: 'custom_range', title: 'Período personalizado' },
      ],
      selectedAux: null,
      selecteds: null,
    },
    issue_flag: {
      label: 'Ocorrência',
      filtered: false,
      field: 'issues_flag',
      class: 'w-17rem',
      singleSelect: false,
      enableSearch: false,
      options: [],
      selectedAux: null,
      selecteds: null,
    },
    sectors_id: {
      label: 'Setor',
      filtered: false,
      field: 'sectors_id',
      singleSelect: false,
      enableSearch: false,
      search: null,
      options: [],
      selectedAux: null,
      selecteds: null,
    },
    quantity_total: {
      label: 'Quantidade total',
      field: 'quantity_total',
      filtered: false,
      singleSelect: true,
      enableSearch: false,
      customInterval: false,
      class: 'w-20rem',
      options: [
        { value: 'up_to_30', title: 'Até 30' },
        { value: '31_to_50', title: 'De 31 a 50' },
        { value: '51_to_70', title: 'De 51 a 70' },
        { value: '71_to_100', title: 'De 71 a 100' },
        { value: 'over_100', title: 'Acima de 100' },
      ],
      selectedAux: null,
      selecteds: null,
    },
  };

  filtersIssuesType: DynamicFormConfig[] = [
    {
      type: 'multiselect',
      label: 'Ocorrência',
      key: 'issues_flag',
      placeholder: 'Todas',
      allowFilter: true,
    },
    {
      type: 'dual-number',
      label: 'Quantidade atribuída',
      dualField: true,
      key_min: 'quantity_assigned_min',
      key_max: 'quantity_assigned_max',
    },
    {
      type: 'dual-number',
      label: 'Tempo médio de resolução',
      dualField: true,
      key_min: 'resolution_time_min',
      key_max: 'resolution_time_max',
      suffix: ' min',
    },
    {
      type: 'dual-number',
      label: 'Quantidade sem atribuição',
      dualField: true,
      key_min: 'quantity_unassigned_min',
      key_max: 'quantity_unassigned_max',
    },
    {
      type: 'dual-number',
      label: 'Quantidade total',
      dualField: true,
      key_min: 'quantity_total_min',
      key_max: 'quantity_total_max',
    },
    {
      type: 'multiselect',
      label: 'Setor',
      key: 'sectors_id',
      placeholder: 'Todos',
    },
  ];

  showAllocate(params) {
    this.paramsAllocate = params;
    this.showSidebarAllocate = true;
  }

  setInterval(interval) {
    if (interval == 'custom_range') {
      this.customInterval = true;
      if (this.interval_max && this.interval_min) {
        const min = format(new Date(this.interval_min), 'yyyy-MM-dd');
        const max = format(new Date(this.interval_max), 'yyyy-MM-dd');
        const period = `custom_range&start_date=${min}&end_date=${max}`;
        this.listQuickStats(period);
        this.sharedInterval = {
          period: interval,
          start_date: min,
          end_date: max,
        };
      }
    } else {
      this.listQuickStats(interval);
      this.sharedInterval = { period: interval };
    }
    sessionStorage.setItem(
      'period-filter',
      JSON.stringify({
        intervalInfo: this.intervalInfo,
        customInterval: this.customInterval,
        interval_min: this.interval_min,
        interval_max: this.interval_max,
      })
    );
  }

  getCustomInterval() {
    const min = format(new Date(this.interval_min), 'yyyy-MM-dd');
    const max = format(new Date(this.interval_max), 'yyyy-MM-dd');
    return `custom_range&start_date=${min}&end_date=${max}`;
  }

  fillCards(json) {
    this.metricCards.forEach((card) => {
      Object.keys(json).forEach((stats) => {
        if (stats == card.field) {
          card.value = json[stats];
        }
      });
    });
  }

  listQuickStats(period) {
    this.loadingService.loadingOn();
    this.reportsService
      .getQuickStats(period)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.fillCards(response.data);
          this.loadingService.loadingOff();
        },
        error: () => {
          this.loadingService.loadingOff();
        },
      });
  }

  porcent(value: number) {
    return value?.toFixed(2);
  }
}
