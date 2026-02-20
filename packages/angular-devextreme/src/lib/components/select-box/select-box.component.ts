import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ValueChangedEvent } from 'devextreme/ui/select_box';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data';
import { DxSelectBoxComponent, DxSelectBoxModule, DxTemplateModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { SelectBoxDataProvider } from '../../interfaces/select-box.interface';
import { SELECTBOX_DATA_PROVIDER } from '../../tokens/select-box.token';
import { SelectBoxKey, SelectBoxLoadResult, SelectBoxParam } from '../../models/select-box.model';

@Component({
  selector: 'cnx-select-box',
  templateUrl: './select-box.component.html',
  styleUrl: './select-box.component.css',
  standalone: false,
})
export class SelectBoxComponent implements OnInit, OnChanges {
  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(SELECTBOX_DATA_PROVIDER) private service: SelectBoxDataProvider
  ) {}

  public ngOnInit(): void {
    this.setupDataSource();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const change = changes['cascadeBy'];
    if (!!change && !change.firstChange) {
      const { currentValue, previousValue } = change;
      const isChange = JSON.stringify(currentValue) !== JSON.stringify(previousValue);
      if (isChange) this.setupDataSource();
    }
    const customChange = changes['customDataSource'];
    if (!!customChange && !customChange.firstChange) {
      this.setupDataSource();
    }
  }

  @ViewChild('selectBox')
  public selectBox!: DxSelectBoxComponent;

  @Input('id') public id: string = '';
  @Input('name') public name: string = '';
  @Input('width') public width: string | number = '100%';
  @Input('placeholder') public placeholder: string = 'Please select...';

  @Input('displayExpr')
  set displayExpr(val: string | null) {
    const _val = val?.toString() || '';
    if (_val && _val !== this._displayExpr) this._displayExpr = _val;
  }
  get displayExpr(): string { return this._displayExpr; }
  private _displayExpr: string = 'text';

  @Input('valueExpr')
  set valueExpr(val: string | null) {
    const _val = val?.toString() || '';
    if (_val && _val !== this._valueExpr) this._valueExpr = _val;
  }
  get valueExpr(): string { return this._valueExpr; }
  private _valueExpr: string = 'value';

  @Input('searchExpr')
  set searchExpr(val: string | null) {
    const _val = val?.toString() || '';
    if (_val && _val !== this._searchExpr) this._searchExpr = _val;
  }
  get searchExpr(): string { return this._searchExpr; }
  private _searchExpr: string = 'dropdownText';

  @Input('dropdownExpr')
  set dropdownExpr(val: string | null) {
    const _val = val?.toString() || '';
    if (_val && _val !== this._dropdownExpr) {
      this._dropdownExpr = _val;
      this._searchExpr = _val;
    }
  }
  get dropdownExpr(): string { return this._dropdownExpr; }
  private _dropdownExpr: string = 'dropdownText';

  @Input('searchEnabled') public searchEnabled: boolean = true;
  @Input('searchTimeout') public searchTimeout: number = 500;
  @Input('showClearButton') public showClearButton: boolean = true;

  @Input('value')
  set value(val: string | number | null) {
    const _val = val?.toString() ?? '';
    if (_val !== this._value) this._value = _val;
  }
  get value(): string { return this._value; }
  private _value: string = '';

  public dataSource!: DataSource;
  @Input('customDataSource') public customDataSource?: any;

  @Input('dropdownWidth') public dropdownWidth!: string | number;
  @Input('maxLength') public maxLength: number = 0;
  @Input('disabled') public disabled: boolean = false;
  @Input('cascadeBy') public cascadeBy: any;
  @Input('selectBoxKey') public selectBoxKey: SelectBoxKey | null | undefined = null;
  @Input('ignoreValue') public ignoreValue!: string[];

  @Output('onValueChanged') public eventValueChanged = new EventEmitter<any>();
  @Output('onEnterKey') public eventEnterKey = new EventEmitter<void>();

  private paginate: boolean = true;
  private pageSize: number = 50;
  private clearValueOnCascade: boolean = false;
  public hasInitialValue: boolean = false;

  public onValueChanged($event: ValueChangedEvent): void {
    setTimeout(() => this.eventValueChanged.emit($event));
    this.cdr.detectChanges();
  }

  public onEnterKey(): void {
    this.eventEnterKey.emit();
  }

  private setupDataSource(): void {
    this.dataSource = new DataSource({
      load: (loadOptions) => this.setupDataSourceOnLoad(loadOptions),
      byKey: (key) => this.setupDataSourceByKey(key),
      paginate: this.paginate,
      pageSize: this.pageSize,
      requireTotalCount: true,
    });

    if (this.clearValueOnCascade && !!this.value && this.selectBox) {
      this.selectBox.value = '';
    }

    this.cdr.detectChanges();
  }

  private setupDataSourceOnLoad(loadOptions: LoadOptions): Promise<SelectBoxLoadResult> {
    return new Promise((resolve) => {
      if ((loadOptions?.take ?? 0) === 0) {
        resolve({ data: [], totalCount: 0 });
        return;
      }

      // -- Handle In-Memory Custom DataSource --
      if (this.customDataSource && Array.isArray(this.customDataSource)) {
        let filtered = [...this.customDataSource];
        if (loadOptions?.searchValue) {
          const search = loadOptions.searchValue.toString().toLowerCase();
          filtered = filtered.filter(
            (item) =>
              (item[this.searchExpr]?.toString() || '').toLowerCase().includes(search) ||
              (item[this.displayExpr]?.toString() || '').toLowerCase().includes(search)
          );
        }
        const skip = loadOptions?.skip ?? 0;
        const take = loadOptions?.take ?? 50;
        let pagedData = filtered.slice(skip, skip + take);

        if (this.ignoreValue?.length) {
          pagedData = pagedData.filter((f) => !this.ignoreValue.includes(f[this.valueExpr]));
        }

        resolve({ data: pagedData, totalCount: filtered.length, hasInitialValue: false });
        return;
      }
      // ----------------------------------------

      this.service
        .getService(this.selectBoxKey, {
          key: this.value,
          cascadeBy: this.cascadeBy,
          loadOptions: { ...loadOptions } as LoadOptions,
        } as SelectBoxParam)
        .subscribe((result) => {
          if (this.ignoreValue?.length) {
            result.data = result.data.filter((f) => !this.ignoreValue.includes(f.value));
          }
          this.hasInitialValue = result.hasInitialValue ?? false;
          resolve(result);
        });
    });
  }

  private setupDataSourceByKey(key: any): Promise<any> {
    return new Promise((resolve) => {
      if (!key) {
        resolve([]);
        return;
      }

      // -- Handle In-Memory Custom DataSource --
      if (this.customDataSource && Array.isArray(this.customDataSource)) {
        const found = this.customDataSource.filter((item) => item[this.valueExpr] === key);
        resolve(found);
        return;
      }
      // ----------------------------------------

      this.service
        .getService(this.selectBoxKey, {
          isByKey: true,
          key,
          cascadeBy: this.cascadeBy,
        } as SelectBoxParam)
        .subscribe((result) => resolve(result.data));
    });
  }
}
