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
  Optional,
} from '@angular/core';
import { DxTagBoxComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { ValueChangedEvent } from 'devextreme/ui/tag_box';
import { LoadOptions } from 'devextreme/data';
import { TagBoxKey, TagBoxParam, TagBoxLoadResult, TagBoxViewModel } from '../../models/cnx-tag-box.model';
import { TagBoxDataProvider } from '../../interfaces/cnx-tag-box.interface';
import { TAGBOX_DATA_PROVIDER } from '../../tokens/cnx-tag-box.token';

@Component({
  selector: 'cnx-tag-box',
  templateUrl: './cnx-tag-box.component.html',
  styleUrl: './cnx-tag-box.component.css',
  standalone: false,
})
export class CnxTagBoxComponent implements OnInit, OnChanges {
  constructor(
    @Optional() @Inject(TAGBOX_DATA_PROVIDER) private service: TagBoxDataProvider,
    private cdr: ChangeDetectorRef
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

  @ViewChild('tagBox') public tagBox!: DxTagBoxComponent;

  @Input('id') public id: string = '';
  @Input('name') public name: string = '';
  @Input('width') public width: string | number = '100%';
  @Input('placeholder') public placeholder: string = 'Please select...';
  
  @Input('displayExpr')
  set displayExpr(val: string | null) {
    let _val = val || '';
    _val = _val.toString();
    if (!!_val && _val != this.displayExprOption) this.displayExprOption = _val;
  }
  get displayExpr(): string {
    return this.displayExprOption;
  }
  private displayExprOption: string = 'text';

  @Input('valueExpr')
  set valueExpr(val: string | null) {
    let _val = val || '';
    _val = _val.toString();
    if (!!_val && _val != this.valueExprOption) this.valueExprOption = _val;
  }
  get valueExpr(): string {
    return this.valueExprOption;
  }
  private valueExprOption: string = 'value';

  @Input('searchExpr')
  set searchExpr(val: string | null) {
    let _val = val || '';
    _val = _val.toString();
    if (!!_val && _val != this.searchExprOption) this.searchExprOption = _val;
  }
  get searchExpr(): string {
    return this.searchExprOption;
  }
  private searchExprOption: string = 'dropdownText';

  @Input('dropdownExpr')
  set dropdownExpr(val: string | null) {
    let _val = val || '';
    _val = _val.toString();
    if (!!_val && _val != this.dropdownExprOption) this.dropdownExprOption = _val; // fixed old bug mapping wrong prop
  }
  get dropdownExpr(): string {
    return this.dropdownExprOption;
  }
  private dropdownExprOption: string = 'dropdownText';

  @Input('searchEnabled') public searchEnabled: boolean = true;
  @Input('searchTimeout') public searchTimeout: number = 500;
  @Input('showClearButton') public showClearButton: boolean = true;
  @Input('showSelectionControls') public showSelectionControls: boolean = true;

  @Input('value')
  set value(val: string[] | number[] | null) {
    let _val = val || [];
    _val = _val.map((e) => e.toString());

    if (JSON.stringify(_val) !== JSON.stringify(this._value)) {
      this._value = _val as string[];
    }
  }
  get value(): string[] {
    return this._value;
  }
  private _value: string[] = [];

  public dataSource!: DataSource;
  @Input('customDataSource') public customDataSource?: any;

  @Input('dropdownWidth') public dropdownWidth!: string | number;
  @Input('maxLength') public maxLength: number = 0;
  @Input('disabled') public disabled: boolean = false;
  @Input('cascadeBy') public cascadeBy: any;
  @Input('tagBoxKey') public tagBoxKey: TagBoxKey | null | undefined = null;
  @Input('acceptCustomValue') public acceptCustomValue: boolean = false;

  @Output('onValueChanged') public eventValueChanged = new EventEmitter<any>();
  @Output('onEnterKey') public eventEnterKey = new EventEmitter<any>();
  @Output('onCustomItemCreating') public eventCustomItemCreating = new EventEmitter<any>();

  private paginate: boolean = true;
  private pageSize: number = 50;
  public hasInitialValue: boolean = false;

  public onValueChanged($event: ValueChangedEvent): void {
    setTimeout(() => this.eventValueChanged.emit($event));
    this.cdr.detectChanges();
  }

  public onEnterKey(): void {
    this.eventEnterKey.emit();
  }

  public onCustomItemCreating($event: any): void {
    this.eventCustomItemCreating.emit($event);
  }

  private setupDataSource(): void {
    this.dataSource = new DataSource({
      load: (loadOptions) => this.setupDataSourceOnLoad(loadOptions),
      byKey: (key) => this.setupDataSourceByKey(key),
      paginate: this.paginate,
      pageSize: this.pageSize,
      requireTotalCount: true,
    });
    this.cdr.detectChanges();
  }

  private setupDataSourceOnLoad(loadOptions: LoadOptions): Promise<TagBoxLoadResult> {
    return new Promise((resolve) => {
      let fromFilter = loadOptions?.filter?.filter((item: any) => typeof item === 'object').map((item: any[]) => {
        let index = item?.length - 1 >= 0 ? item?.length - 1 : 0;
        let i = item[index];
        return i;
      });

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

        resolve({ data: pagedData, totalCount: filtered.length, hasInitialValue: false });
        return;
      }
      // ----------------------------------------

      if (!this.service) {
        console.warn('CnxTagBox: TAGBOX_DATA_PROVIDER is not provided.');
        resolve({ data: [], totalCount: 0 });
        return;
      }

      this.service
        .getService(this.tagBoxKey, {
          key: (fromFilter?.length ?? 0) > 0 ? fromFilter : [],
          cascadeBy: this.cascadeBy ? { ...this.cascadeBy } : undefined, // pass cascade obj safely
          loadOptions: {
            ...loadOptions,
            searchValue: loadOptions.searchValue,
            take: this.pageSize,
          } as LoadOptions,
        } as TagBoxParam)
        .subscribe((result) => {
          this.hasInitialValue = result.hasInitialValue ?? false;

          if (this.hasInitialValue && this.tagBox) {
            let all = new Set(result.data.map((x: TagBoxViewModel) => x.value));
            this.tagBox.value = this.value.filter((x) => all.has(x));
          }

          resolve(result);
        });
    });
  }

  private setupDataSourceByKey(key: any | string | number): Promise<any> {
    return new Promise((resolve) => {
      if (!key) {
        resolve([]);
        return;
      }

      // -- Handle In-Memory Custom DataSource --
      if (this.customDataSource && Array.isArray(this.customDataSource)) {
        // TagBox byKey usually receives an array of keys
        let keys = Array.isArray(key) ? key : [key];
        const found = this.customDataSource.filter((item) => keys.includes(item[this.valueExpr]));
        resolve(found);
        return;
      }
      // ----------------------------------------

      if (!this.service) {
        resolve([]);
        return;
      }

      this.service
        .getService(this.tagBoxKey, {
          isByKey: true,
          key: key,
        } as TagBoxParam)
        .subscribe((result) => resolve(result.data));
    });
  }
}
