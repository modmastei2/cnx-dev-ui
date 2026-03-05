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
import { ValueChangedEvent } from 'devextreme/ui/select_box';
import DataSource from 'devextreme/data/data_source';
import { lastValueFrom } from 'rxjs';
import { LoadOptions } from 'devextreme/data';
import { DxSelectBoxComponent } from 'devextreme-angular';
import { SelectBoxDataProvider } from '../../interfaces/cnx-select-box.interface';
import { SELECTBOX_DATA_PROVIDER } from '../../tokens/cnx-select-box.token';
import {
    SelectBoxKey,
    SelectBoxLoadResult,
    SelectBoxParam,
    SelectBoxViewModel,
} from '../../models/cnx-select-box.model';
import { CascadeRule } from '../../models/cnx-cascade-value';

@Component({
    selector: 'cnx-select-box',
    templateUrl: './cnx-select-box.component.html',
    styleUrl: './cnx-select-box.component.css',
    standalone: false,
})
export class CnxSelectBoxComponent implements OnInit, OnChanges {
    constructor(
        private cdr: ChangeDetectorRef,
        @Optional()
        @Inject(SELECTBOX_DATA_PROVIDER)
        private service: SelectBoxDataProvider,
    ) {}

    public ngOnInit(): void {
        this.setupDataSource();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        // ตรวจสอบการเปลี่ยนของ cascadeRule
        const cascadeRuleChange = changes['cascadeRule'];
        if (!!cascadeRuleChange && !cascadeRuleChange.firstChange) {
            const { currentValue, previousValue } = cascadeRuleChange;
            const isChange =
                JSON.stringify(currentValue) !== JSON.stringify(previousValue);
            if (isChange) this.setupDataSource();
        }

        // ตรวจสอบการเปลี่ยนของ cascadeBy
        const change = changes['cascadeBy'];
        if (!!change && !change.firstChange) {
            const { currentValue, previousValue } = change;
            const isChange =
                JSON.stringify(currentValue) !== JSON.stringify(previousValue);
            if (isChange) this.setupDataSource();
        }

        // ตรวจสอบการเปลี่ยนของ customDataSource
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
    get displayExpr(): string {
        return this._displayExpr;
    }
    private _displayExpr: string = 'text';

    @Input('valueExpr')
    set valueExpr(val: string | null) {
        const _val = val?.toString() || '';
        if (_val && _val !== this._valueExpr) this._valueExpr = _val;
    }
    get valueExpr(): string {
        return this._valueExpr;
    }
    private _valueExpr: string = 'value';

    @Input('searchExpr')
    set searchExpr(val: string | null) {
        const _val = val?.toString() || '';
        if (_val && _val !== this._searchExpr) this._searchExpr = _val;
    }
    get searchExpr(): string {
        return this._searchExpr;
    }
    private _searchExpr: string = 'text';

    @Input('dropdownExpr')
    set dropdownExpr(val: string | null) {
        const _val = val?.toString() || '';
        if (_val && _val !== this._dropdownExpr) {
            this._dropdownExpr = _val;
            this._searchExpr = _val;
        }
    }
    get dropdownExpr(): string {
        return this._dropdownExpr;
    }
    private _dropdownExpr: string = 'text';

    @Input('searchEnabled') public searchEnabled: boolean = true;
    @Input('searchTimeout') public searchTimeout: number = 500;
    @Input('showClearButton') public showClearButton: boolean = true;

    @Input('value')
    set value(val: string | number | null) {
        const _val = val !== null ? val.toString() : null;
        if (_val !== this._value) this._value = _val;
    }
    get value(): string | null {
        return this._value;
    }
    private _value: string | null = null;

    public dataSource!: DataSource;
    @Input('customDataSource') public customDataSource?: any;

    @Input('dropdownWidth') public dropdownWidth!: string | number;
    @Input('maxLength') public maxLength: number = 0;
    @Input('disabled') public disabled: boolean = false;

    @Input('cascadeRule') public cascadeRule: CascadeRule | CascadeRule[];
    @Input('cascadeBy') public cascadeBy: any;

    @Input('selectBoxKey') public selectBoxKey:
        | SelectBoxKey
        | null
        | undefined = null;
    @Input('ignoreValue') public ignoreValue!: string[];

    @Output('onValueChanged') public eventValueChanged =
        new EventEmitter<any>();
    @Output('onEnterKey') public eventEnterKey = new EventEmitter<void>();

    private paginate: boolean = true;
    private pageSize: number = 50;
    private clearValueOnCascade: boolean = false;
    public hasInitialValue: boolean = false;

    public onValueChanged($event: ValueChangedEvent): void {
        this.eventValueChanged.emit($event);
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

    private async setupDataSourceOnLoad(
        loadOptions: LoadOptions,
    ): Promise<SelectBoxLoadResult> {
        if ((loadOptions?.take ?? 0) === 0) {
            return { data: [], totalCount: 0 };
        }

        // -- Handle In-Memory Custom DataSource --
        if (this.customDataSource && Array.isArray(this.customDataSource)) {
            let filtered = [...this.customDataSource];
            filtered = this.applyCascadeRule(filtered);
            filtered = this.applyIgnoreValue(filtered);

            if (loadOptions?.searchValue) {
                const search = loadOptions.searchValue.toString().toLowerCase();
                filtered = filtered.filter(
                    (item) =>
                        (item[this.searchExpr]?.toString() || '')
                            .toLowerCase()
                            .includes(search) ||
                        (item[this.displayExpr]?.toString() || '')
                            .toLowerCase()
                            .includes(search),
                );
            }
            const skip = loadOptions?.skip ?? 0;
            const take = loadOptions?.take ?? 50;
            let pagedData = filtered.slice(skip, skip + take);

            return {
                data: pagedData,
                totalCount: filtered.length,
                hasInitialValue: false,
            };
        }
        // ----------------------------------------

        // 2. Key-based service
        if (this.selectBoxKey && this.service) {
            const result = await lastValueFrom(
                this.service.getService(this.selectBoxKey, {
                    key: this.value,
                    cascadeBy: this.cascadeBy,
                    loadOptions: { ...loadOptions } as LoadOptions,
                } as SelectBoxParam),
            );

            result.data = this.applyIgnoreValue(result.data);
            this.hasInitialValue = result.hasInitialValue ?? false;
            return result;
        }

        return { data: [], totalCount: 0 };
    }

    private async setupDataSourceByKey(key: any): Promise<any> {
        if (!key) {
            return [];
        }

        // -- Handle In-Memory Custom DataSource --
        if (this.customDataSource && Array.isArray(this.customDataSource)) {
            let filtered = [...this.customDataSource];
            filtered = this.applyCascadeRule(filtered);
            filtered = this.applyIgnoreValue(filtered);
            const found = filtered.filter(
                (item) => item[this.valueExpr] === key,
            );
            return found;
        }
        // ----------------------------------------

        // 2. Key-based service
        if (this.selectBoxKey && this.service) {
            const result = await lastValueFrom(
                this.service.getService(this.selectBoxKey, {
                    isByKey: true,
                    key,
                    cascadeBy: this.cascadeBy,
                } as SelectBoxParam),
            );

            result.data = this.applyIgnoreValue(result.data);
            return result.data;
        }

        return [];
    }

    private applyCascadeRule(
        items: SelectBoxViewModel[] | any[],
    ): SelectBoxViewModel[] {
        if (
            !this.cascadeRule ||
            this.cascadeBy === undefined ||
            this.cascadeBy === null
        ) {
            return items;
        }

        const rules = Array.isArray(this.cascadeRule)
            ? this.cascadeRule
            : [this.cascadeRule];

        const filtered = items.filter((item) => {
            return rules.every((rule) => {
                let parentVal: any;

                if (
                    typeof this.cascadeBy === 'object' &&
                    this.cascadeBy !== null
                ) {
                    parentVal = this.cascadeBy[rule.childKey];
                } else if (
                    this.cascadeBy !== undefined &&
                    this.cascadeBy !== null
                ) {
                    parentVal = this.cascadeBy;
                }
                return item[rule.childKey] === parentVal;
            });
        });

        return filtered;
    }

    private applyIgnoreValue(
        items: SelectBoxViewModel[] | any[],
    ): SelectBoxViewModel[] {
        return !this.ignoreValue?.length
            ? items
            : items.filter(
                  (item) => !this.ignoreValue.includes(item[this.valueExpr]),
              );
    }
}
