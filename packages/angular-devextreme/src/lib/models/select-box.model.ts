import { LoadOptions } from 'devextreme/data';

export type SelectBoxKey =
  | 'cardType'
  | 'pages'
  | 'bank'
  | 'encoding'
  | 'department'
  | 'division'
  | 'fileType'
  | 'valueType'
  | 'applicationFormField'
  | 'currency'
  | 'paymentMethod'
  | 'paymentTerm'
  | 'transferMode'
  | 'bankAccount'
  | 'approveType'
  | 'user'
  | 'jobGrade'
  | 'roles'
  | 'creditType'
  | 'month'
  | 'year'
  | 'biborType'
  | 'interestPeriod'
  | 'accountNo'
  | 'statementType'
  | 'reconcileType'
  | 'fxRequestReason'
  | 'chequeType'
  | 'paymentType'
  | 'vendor'
  | 'unit'
  | 'period'
  | 'quarter'
  | 'loanName'
  | 'interestType'
  | 'paymentTypeGroup'
  | 'vendorAccount'
  | 'interestTypeOption'
  | string
  | null;

export class SelectBoxParam {
  key?: any;
  cascadeBy?: any;
  isByKey?: boolean;
  loadOptions?: LoadOptions;
}

export class SelectBoxViewModel {
  text: string;
  value: any;
  dropdownText: string;
}

export class SelectBoxLoadResult {
  data: SelectBoxViewModel[] = [];
  totalCount: number = 0;
  hasInitialValue?: boolean;
}
