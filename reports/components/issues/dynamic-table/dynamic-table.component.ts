import {
  Component,
  OnInit,
  // OnChanges,
  OnDestroy,
  ViewEncapsulation,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { take } from 'rxjs/operators';
import { OverlayPanel } from 'primeng/overlaypanel';
import { LazyLoadEvent } from 'primeng/api';
import { ReportsOperationService } from 'src/app/core/services/reports-operation.service';
import { format } from 'date-fns';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DynamicTableComponent implements OnInit, OnDestroy {
  // @Input() intervalData;
  @Input() quickFilters;
  @Input() headerTable;
  @Input() configForm;
  @Input() tableName;
  @Input() tableTitle;
  @Input() tableIcon;
  @Input() enableSearchField = false;
  @Input() enableDownload = false;
  @Input() pagination = false;

  @Input() userFilters: any;
  @Input() operators: any[];
  @Input() sectors: any[];
  @Input() types: any[];

  @Output() showSidebarAllocate = new EventEmitter();

  isLoading: boolean = false;

  isLastPage: boolean = false;

  filtered: boolean = false;
  wordSearched: string = '';

  // page: number = 1;
  showFilters: boolean = false;
  selectedFilter: any;
  selectedUserFilter: any;

  firstLoad: boolean = true;

  showSavedFilters: boolean = false;

  filters: any = {};

  searchParam: any = '';
  orderField: string;
  orderBy: string;
  atualSort: any;

  countFilters: number = 0;

  orders: any = [];
  ordersDetails: any = [];

  // cities: any[];
  // stores: any[];

  maxDate = new Date();
  interval_min: any;
  interval_max: any;

  intervalId: any;

  constructor(
    private reportService: ReportsOperationService,
    private router: Router
  ) {}

  originalOrder = () => 0;

  ngOnInit() {
    this.getSavedSessionFilters();
  }

  @Input()
  set intervalData(value) {
    this.filters = { ...this.filters, ...value };
    if (this.quickFilters?.period) {
      let item = this.quickFilters.period;
      item.selecteds = null;
      item.selectedAux = null;
      item.customInterval = false;
    }
    if (!this.firstLoad) this.listOrders();
  }

  updateTable() {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.listOrders();
    }, 180000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  isFiltered(item) {
    return (item.selecteds?.length || item.value?.selecteds > 0) &&
      item.filtered
      ? true
      : false;
  }

  showQuickFilter(event, opFilters, filter) {
    this.selectedFilter = filter;
    opFilters.hide();
    setTimeout(() => {
      opFilters.toggle(event);
    }, 100);
  }

  operatorAllocate(item) {
    let isReallocate = item.operator ? true : false;
    const params = {
      occurrence_id: isReallocate ? item.issue_id : item.occurrence_id,
      isReallocate: isReallocate,
      atualOperator: item?.operator,
      occurrence: isReallocate ? item.issue : item.occurrence,
      operators: this.operators,
      sector: item.sector,
      created: this.convertMinutes(item.minutes_ago_created),
    };
    this.showSidebarAllocate.emit(params);
  }

  saveSessionFilters() {
    sessionStorage.setItem(
      `filters-${this.tableName}`,
      JSON.stringify({
        filters: this.filters,
        headerTable: this.headerTable,
        quickFilters: this.quickFilters,
        selectedUserFilter: this.selectedUserFilter,
        interval_min: this.interval_min,
        interval_max: this.interval_max,
      })
    );
  }

  getSavedSessionFilters() {
    let userFilterId;
    let filtersSession;
    if (sessionStorage.getItem(`filters-${this.tableName}`)) {
      filtersSession = JSON.parse(
        sessionStorage.getItem(`filters-${this.tableName}`)
      );
      this.filters = filtersSession.filters;
      userFilterId = filtersSession.selectedUserFilter?.id;
      this.headerTable = filtersSession.headerTable;
      this.quickFilters = filtersSession.quickFilters;
      this.interval_min = new Date(filtersSession.interval_min);
      this.interval_max = new Date(filtersSession.interval_max);
    }
    if (userFilterId) {
      this.getSelectedFilter(userFilterId);
      this.countSavedFilter(filtersSession.selectedUserFilter);
    }

    setTimeout(() => {
      this.listOrders();
    }, 1000);
  }

  includeSavedFilter(newFilter) {
    this.userFilters = [...this.userFilters, ...[newFilter]];
    this.getSelectedFilter(newFilter.id);
  }

  getSelectedFilter(filterId) {
    if (filterId) {
      const index = this.userFilters.findIndex((obj) => obj.id === filterId);
      this.selectedUserFilter = this.userFilters[index];
    }
  }

  countSavedFilter(filters) {
    this.countFilters = 0;
    const ignoreKeys = ['id', 'filter_name', 'name'];
    Object.keys(filters).forEach((key) => {
      if (!ignoreKeys.includes(key) && filters[key]) this.countFilters++;
    });
  }

  filter(filters) {
    this.filters = filters;
    this.listOrders();
    this.countFilters = 0;
    Object.keys(filters).forEach((key) => {
      if (key != 'page') this.countFilters++;
    });
  }

  openFilters(op, event) {
    if (this.userFilters?.length) {
      op.toggle(event);
    } else {
      this.showFilters = true;
    }
  }

  search() {
    this.filters['search'] = this.searchParam;
    this.listOrders();
    this.filtered = true;
    this.wordSearched = this.searchParam;
    this.searchParam = '';
  }

  filterInterval(selectedFilter, opFilter) {
    opFilter.hide();
    if (this.interval_max && this.interval_min) {
      selectedFilter.selecteds = selectedFilter.selectedAux;
      const min = format(new Date(this.interval_min), 'yyyy-MM-dd');
      const max = format(new Date(this.interval_max), 'yyyy-MM-dd');
      selectedFilter.filtered = true;
      this.paramFilter({
        period: 'custom_range',
        start_date: min,
        end_date: max,
      });
    }
  }

  quickFilter(selectedFilter, opFilter) {
    opFilter.hide();
    selectedFilter.selecteds = selectedFilter.selectedAux;
    const key = selectedFilter.field;
    const value = selectedFilter.selecteds;
    if (key && value) {
      let param = {};
      param[key] = value;
      this.filters = { ...this.filters, ...param };
      this.listOrders();
      selectedFilter.filtered = true;
    }
    // }
  }

  paramFilter(param) {
    this.filters = { ...this.filters, ...param };
    this.listOrders();
  }

  applySavedFilter(item) {
    let filter = { ...item };
    delete filter.id;
    delete filter.name;
    delete filter.filter_name;
    this.filter(filter);
  }

  clearQuickFilter(item) {
    item.selecteds = null;
    item.selectedAux = null;
    item.filtered = false;
    item.customInterval = false;
    let param = {};
    param[item.field] = null;
    this.paramFilter(param);
  }

  convertMinutes(hour, hourFormat = false) {
    if (hourFormat) {
      const formattedTime = format(
        new Date(`2000-01-01T${hour}`),
        "h'h' mm'm'"
      );
      return formattedTime;
    } else {
      const minutes = Number(hour);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.floor(minutes % 60);
      const formattedTime = `${hours
        .toString()
        .padStart(2, '0')}h ${remainingMinutes.toString().padStart(2, '0')}m`;
      return formattedTime;
    }
  }

  tagFilter(item, field) {
    if (field == 'period') {
      switch (item.selecteds) {
        case 'realtime':
          return 'Tempo real';
        case 'last_7_days':
          return '7 dias';
        case 'last_30_days':
          return '30 dias';
        case 'last_3_months':
          return '3 meses';
        case 'custom_range':
          return `${format(
            new Date(this.interval_min),
            'dd/MM/yyyy'
          )} a ${format(new Date(this.interval_max), 'dd/MM/yyyy')}`;
        default:
          return '1';
          break;
      }
    } else {
      return '1';
    }
  }

  public listOrders() {
    this.orders = [];
    this.isLoading = true;
    // this.page = 1;
    this.isLastPage = false;
    // this.filters.page = 1;
    if (!this.firstLoad) this.saveSessionFilters();
    this.reportService
      .getItemsTable(this.filters, this.tableName)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          // this.isLastPage = response.data.next_page_url ? false : true;
          // this.orders = response.data.data;
          this.orders = response.data;
          this.isLoading = false;
          this.firstLoad = false;
        },
      });
  }

  sort(item) {
    this.headerTable.forEach((element) => {
      element.sorted = false;
    });
    const orderBy =
      !this.filters.order_by || this.filters.order_by == 'desc'
        ? 'asc'
        : 'desc';

    const field = item.sortField ? item.sortField : item.field;
    const param = { order_field: field, order_by: orderBy };
    this.filters = { ...this.filters, ...param };
    item.sorted = true;
    this.atualSort = item;
    this.saveSessionFilters();
  }

  filterOptions(event, filter) {
    const param = event.target.value;
    let items = null;
    if (filter.field == 'operators_id') items = this.operators;

    const filtereds = items.filter((obj) => {
      return Object.values(obj).some((val) => {
        return String(val).toLowerCase().includes(param.toLowerCase());
      });
    });
    this.quickFilters[filter.field].options = filtereds;
  }

  removeSearch() {
    this.filtered = false;
    this.wordSearched = '';
    this.searchParam = '';
    this.filters.search = null;
    this.listOrders();
  }

  clearSearch() {
    this.filters = {};
    this.countFilters = 0;
    this.selectedFilter = null;
    this.selectedUserFilter = null;
    Object.keys(this.quickFilters).forEach((key) => {
      this.quickFilters[key].selecteds = null;
      this.quickFilters[key].selectedAux = null;
    });
    if (this.filtered) {
      this.removeSearch();
    } else {
      this.listOrders();
    }
  }
}
