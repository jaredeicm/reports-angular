import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  UntypedFormBuilder,
  UntypedFormGroup,
} from '@angular/forms';
import { take } from 'rxjs/operators';
// import { ReportsO2OService } from 'src/app/core/services/reports-o2o.service';
import { format } from 'date-fns';
import { DynamicFormConfig } from '../../../models/dynamic-form-config.model';
import { ReportsOperationService } from 'src/app/core/services/reports-operation.service';

@Component({
  selector: 'app-dynamic-filters',
  templateUrl: './dynamic-filters.component.html',
  styleUrls: ['./dynamic-filters.component.scss'],
})
export class DynamicFiltersComponent implements OnInit {
  @Input() configForm: DynamicFormConfig[];
  @Input() tableTitle: string;
  @Input() tableName: string;
  @Input() cities: [{ cidade }];
  @Input() stores: [{ id; nome }];
  @Input() operators: [{ value; title }];
  @Input() sectors: [{ value; title }];
  @Input() types: [{ value; title }];
  @Input() showSidebar = false;
  @Output() hideSidebar = new EventEmitter();
  @Output() onFilter = new EventEmitter();
  @Output() onSaveFilter = new EventEmitter();
  @Output() onLoadFilter = new EventEmitter();

  formValues: any;

  savingFilter: boolean = false;
  nameFilter: string;

  padlock: { value; title }[] = [
    { value: '', title: 'Todos' },
    { value: 'livre', title: 'livre' },
    { value: 'bloqueado', title: 'bloqueado' },
  ];

  // form: UntypedFormGroup;
  form: UntypedFormGroup = new FormGroup({});

  // ageOptions = [
  //   { value: 'D0' },
  //   { value: 'D1' },
  //   { value: 'D2' },
  //   { value: 'D3' },
  //   { value: 'D4' },
  // ];
  // modalOptions = [
  //   { title: 'Carro', value: 'CARRO' },
  //   { title: 'Moto baú', value: 'BAU' },
  //   { title: 'Moto bag', value: 'NORMAL' },
  //   { title: 'Bike', value: 'BIKE' },
  // ];
  // deliveryOptions = [
  //   { title: 'Todos', value: 'all' },
  //   { title: 'Sem entregador', value: 'none' },
  //   { title: 'Com entregador', value: 'with' },
  // ];
  // statusOptions = [
  //   { title: 'Aprovado', value: 'a' },
  //   { title: 'Transporte', value: 't' },
  //   { title: 'Pausado', value: 'stopped' },
  // ];
  constructor(
    private fb: UntypedFormBuilder,
    private reportsService: ReportsOperationService
  ) {}

  ngOnInit() {
    this.createForm();

    // this.form.valueChanges.subscribe(value => {
    //   localStorage.setItem('teste-forms', JSON.stringify(value));
    //   console.log(value)
    //   console.log(this.form.value)
    // });
    if (sessionStorage.getItem(`filters-sidebar-${this.tableName}`)) {
      this.formValues = JSON.parse(
        sessionStorage.getItem(`filters-sidebar-${this.tableName}`)
      );
      this.form.setValue(this.formValues);
      this.onLoadFilter.emit(this.formValues);
    }
  }

  createForm() {
    this.configForm?.forEach((control) => {
      if (control.dualField) {
        this.form.addControl(
          control.key_min,
          new FormControl(control.initialValue, control.validation)
        );
        this.form.addControl(
          control.key_max,
          new FormControl(control.initialValue, control.validation)
        );
      } else {
        this.form.addControl(
          control.key,
          new FormControl(control.initialValue, control.validation)
        );
      }
    });
  }

  getOptions(key) {
    switch (key) {
      case 'operators_id':
        return this.operators;
      case 'operator_id':
        return this.operators;
      case 'sectors':
        return this.sectors;
      case 'sectors_id':
        return this.sectors;
      case 'padlock':
        return this.padlock;
      case 'issue_flag':
        return this.types;
      case 'issues_flag':
        return this.types;
      default:
        break;
    }
  }

  filter() {
    sessionStorage.setItem(
      `filters-sidebar-${this.tableName}`,
      JSON.stringify(this.form.value)
    );
    let payload = { ...this.form.value };
    payload.time_min ? (payload.time_min = payload.time_min + ':00') : null;
    payload.time_max ? (payload.time_max = payload.time_max + ':00') : null;
    payload.issue_id ? (payload.issue_id = [payload.issue_id]) : null;
    // payload.purchase_date_start = this.formatDate(payload.purchase_date_start);
    // payload.purchase_date_end = this.formatDate(payload.purchase_date_end);
    // console.log(payload);
    if (this.savingFilter) this.saveFilter(payload);
    this.onFilter.emit(payload);
    this.hideFilters();
    this.form.markAsPristine();
  }

  saveFilter(payload) {
    if (!this.nameFilter) this.nameFilter = 'Filtro sem nome';
    // payload.city_id = payload.city_id ? payload.city_id.toString() : '';
    payload = {
      ...payload,
      ...{ name: this.nameFilter, filter_name: this.tableName },
    };
    this.reportsService
      .saveFilters(payload)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.onSaveFilter.emit(res.data);
          this.savingFilter = false;
          this.nameFilter = null;
        },
      });
  }

  formatDate(date) {
    if (date) {
      return format(new Date(date), 'yyyy-MM-dd');
    } else {
      return '';
    }
  }

  resetForm() {
    this.form.reset();
    this.form.markAsDirty();
  }

  hideFilters() {
    this.hideSidebar.emit(true);
  }
}
