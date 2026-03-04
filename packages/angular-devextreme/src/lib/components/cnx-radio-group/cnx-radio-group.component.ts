import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnInit,
    Optional,
    Output,
    SimpleChanges,
} from '@angular/core';
import {
    RadioGroupKey,
    RadioGroupParam,
    RadioGroupViewModel,
} from '../../models/cnx-radio-group.model';
import { ValueChangedEvent } from 'devextreme/ui/radio_group';
import { lastValueFrom } from 'rxjs';
import { RadioGroupDataProvider } from '../../interfaces/cnx-radio-group.interface';
import { RADIO_GROUP_DATA_PROVIDER } from '../../tokens/cnx-radio-group.token';
import { CascadeRule } from '../../models/cnx-cascade-value';

@Component({
    selector: 'cnx-radio-group',
    templateUrl: './cnx-radio-group.component.html',
    styleUrl: './cnx-radio-group.component.css',
    standalone: false,
})
export class CnxRadioGroupComponent implements OnInit, OnChanges {
    @Input('id') public id: string = '';
    @Input('name') public name: string = '';
    @Input('disabled') public disabled: boolean = false;
    @Input('layout') public layout: 'vertical' | 'horizontal' = 'horizontal';
    @Input('autoDefault') public autoDefault: boolean = true;

    @Input('displayExpr')
    set displayExpr(val: string | null) {
        const _val = val?.toString() || '';
        if (_val && _val !== this.displayExprOption)
            this.displayExprOption = _val;
    }
    get displayExpr(): string {
        return this.displayExprOption;
    }
    public displayExprOption: string = 'text';

    @Input('valueExpr')
    set valueExpr(val: string | null) {
        const _val = val?.toString() || '';
        if (_val && _val !== this.valueExprOption) this.valueExprOption = _val;
    }
    get valueExpr(): string {
        return this.valueExprOption;
    }
    public valueExprOption: string = 'value';

    @Input('radioGroupKey') public radioGroupKey:
        | RadioGroupKey
        | null
        | undefined = null;

    @Input('cascadeRule') public cascadeRule: CascadeRule | CascadeRule[];
    @Input('cascadeBy') public cascadeBy: any;
    @Input('ignoreValue') public ignoreValue: string[] = [];

    @Input('customDataSource')
    public customDataSource?: RadioGroupViewModel[] | any[];

    // @Input('dataSource')
    set dataSource(items: RadioGroupViewModel[] | any[]) {
        this._dataSource = (items || []).map((item) => ({ ...item }));
    }
    get dataSource(): RadioGroupViewModel[] | any[] {
        return this._dataSource;
    }
    private _dataSource: RadioGroupViewModel[] | any[] = [];

    @Input('value')
    set value(val: string | null) {
        this._value = val?.toString() ?? '';
        this.cdr.detectChanges();
    }
    get value(): string {
        return this._value;
    }
    public _value: string = '';

    @Output('onValueChanged')
    public eventValueChanged = new EventEmitter<ValueChangedEvent>();

    constructor(
        @Optional()
        @Inject(RADIO_GROUP_DATA_PROVIDER)
        private service: RadioGroupDataProvider,
        private cdr: ChangeDetectorRef,
    ) {}

    public async ngOnInit(): Promise<void> {
        await this.setupDataSource();
    }

    public async ngOnChanges(changes: SimpleChanges): Promise<void> {
        // ตรวจสอบการเปลี่ยนของ cascadeRule
        const cascadeRuleChange = changes['cascadeRule'];
        if (cascadeRuleChange && !cascadeRuleChange.firstChange) {
            const isDiff =
                JSON.stringify(cascadeRuleChange.currentValue) !==
                JSON.stringify(cascadeRuleChange.previousValue);

            if (isDiff) {
                await this.setupDataSource();
            }
        }

        // ตรวจสอบการเปลี่ยนของ cascadeBy
        const cascadeChange = changes['cascadeBy'];
        if (cascadeChange && !cascadeChange.firstChange) {
            const isDiff =
                JSON.stringify(cascadeChange.currentValue) !==
                JSON.stringify(cascadeChange.previousValue);
            if (isDiff) {
                this.value = '';
                await this.setupDataSource();
            }
        }

        // ตรวจสอบการเปลี่ยนของ customDataSource
        const customChange = changes['customDataSource'];
        if (customChange && !customChange.firstChange) {
            await this.setupDataSource();
        }
    }

    public onValueChanged($event: ValueChangedEvent): void {
        this.eventValueChanged.emit($event);
    }

    private async setupDataSource(): Promise<void> {
        // 1. In-memory customDataSource
        if (this.customDataSource && Array.isArray(this.customDataSource)) {
            let filtered = this.applyCascadeRule(this.customDataSource);
            this.dataSource = this.applyIgnoreValue(filtered);
            this.applyAutoDefault();
            return;
        }

        // 2. Key-based service
        if (this.radioGroupKey && this.service) {
            const result = await lastValueFrom(
                this.service.getService(this.radioGroupKey, {
                    cascadeBy: this.cascadeBy,
                } as RadioGroupParam),
            );
            this.dataSource = this.applyIgnoreValue(result);
            this.applyAutoDefault();
            return;
        }
    }

    private applyCascadeRule(items: RadioGroupViewModel[] | any[]): any[] {
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
                    parentVal = this.cascadeBy[rule.parentKey];
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

    private applyIgnoreValue(items: RadioGroupViewModel[] | any[]): any[] {
        if (!this.ignoreValue?.length) return items;
        return items.filter(
            (item) => !this.ignoreValue.includes(item[this.valueExprOption]),
        );
    }

    private applyAutoDefault(): void {
        if (this.autoDefault && !this.value && this.dataSource.length > 0) {
            // Use setTimeout to avoid NG0100 when updating parent's value synchronously
            setTimeout(() => {
                this.value = this.dataSource[0]?.[this.valueExprOption] ?? '';
                this.cdr.detectChanges();
            });
        }
    }
}
