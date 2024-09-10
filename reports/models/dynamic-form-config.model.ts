import { ValidatorFn } from '@angular/forms';

export type Fields =
  | 'input-number'
  | 'input-text'
  | 'multiselect'
  | 'dropdown'
  | 'dual-number'
  | 'dual-calendar'
  | 'dual-money';

export type TypeControl = {
  field: Fields;
  typeField?: string;
};

export type DynamicFormConfig = {
  // type: string;
  type: Fields;
  label: string;
  key?: string;
  dualField?:boolean;
  key_min?: string;
  key_max?: string;
  min_value?: number;
  max_value?: number;
  suffix?: string;
  allowFilter?:boolean;
  initialValue?: any;
  placeholder?: string;
  options?: string[];
  validation?: ValidatorFn[];
};
