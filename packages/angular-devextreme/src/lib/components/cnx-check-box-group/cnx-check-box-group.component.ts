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
import { DxCheckBoxComponent } from 'devextreme-angular';
import { ValueChangedEvent } from 'devextreme/ui/check_box';
import { lastValueFrom } from 'rxjs';
import {
    CheckBoxKey,
    CheckBoxParam,
    CheckBoxViewModel,
} from '../../models/cnx-check-box-group.model';
import { CheckBoxDataProvider } from '../../interfaces/cnx-check-box-group.interface';
import { CHECKBOX_DATA_PROVIDER } from '../../tokens/cnx-check-box-group.token';
import { CascadeRule } from '../../models/cnx-cascade-value';

@Component({
    selector: 'cnx-check-box-group',
    templateUrl: './cnx-check-box-group.component.html',
    styleUrl: './cnx-check-box-group.component.css',
    standalone: false,
})
export class CnxCheckBoxGroupComponent implements OnInit, OnChanges {
    @Input('id') public id: string = '';
    @Input('name') public name: string = '';

    @Input('value')
    set value(val: string[] | null | undefined) {
        this._value = val ? [...val] : [];
        this.checkMapValue();
    }
    get value(): string[] {
        return this._value;
    }
    private _value: string[] = [];

    @Input('disabled')
    public disabled: boolean = false;

    @Input('direction')
    public direction: 'col' | 'row' = 'col';

    @Input('mode')
    public mode: 'multiple' | 'single' = 'multiple';

    @Input('checkBoxKey')
    public checkBoxKey: CheckBoxKey | null | undefined = null;
    @Input('cascadeRule')
    public cascadeRule: CascadeRule | CascadeRule[];
    @Input('cascadeBy')
    public cascadeBy: any;
    @Input('ignoreValue')
    public ignoreValue: string[] = [];

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

    @Input('customDataSource')
    public customDataSource?: CheckBoxViewModel[] | any[];

    // @Input('dataSource')
    set dataSource(items: CheckBoxViewModel[] | any[]) {
        this._dataSource = items.map((item) => ({ ...item }));
    }
    get dataSource(): CheckBoxViewModel[] | any[] {
        return this._dataSource;
    }
    private _dataSource: CheckBoxViewModel[] | any[] = [];

    @Output('onValueChanged')
    public eventValueChanged = new EventEmitter<{ value: string[] }>();

    constructor(
        @Optional()
        @Inject(CHECKBOX_DATA_PROVIDER)
        private service: CheckBoxDataProvider,
        private cdr: ChangeDetectorRef,
    ) {}

    public async ngOnInit(): Promise<void> {
        await this.setupDataSource();
    }

    public async ngOnChanges(changes: SimpleChanges): Promise<void> {
        // ตรวจสอบการเปลี่ยนของ value
        if (changes['value'] && !changes['value'].firstChange) {
            this.checkMapValue();
        }

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
        const cascadeByChange = changes['cascadeBy'];
        if (cascadeByChange && !cascadeByChange.firstChange) {
            const isCascadeByDiff =
                JSON.stringify(cascadeByChange.currentValue) !==
                JSON.stringify(cascadeByChange.previousValue);

            if (isCascadeByDiff) {
                await this.setupDataSource();
            }
        }

        // ตรวจสอบการเปลี่ยนของ customDataSource
        const customChange = changes['customDataSource'];
        if (customChange && !customChange.firstChange) {
            await this.setupDataSource();
        }
    }

    public onValueChanged(
        $event: ValueChangedEvent,
        item: CheckBoxViewModel | any,
    ): void {
        if (this.mode === 'single') {
            if ($event.value === true) {
                this.dataSource.forEach((i) => {
                    if (
                        i[this.valueExprOption] !== item[this.valueExprOption]
                    ) {
                        i.checked = false;
                    }
                });
            }
        }

        item.checked = $event.value;
        const value = this.dataSource
            .filter((i) => i.checked === true)
            .map((i) => i[this.valueExprOption]);

        this.eventValueChanged.emit({ value });
    }

    public onClickLabelCheckBox(checkBox: DxCheckBoxComponent): void {
        if (this.disabled) return;
        checkBox.value = !checkBox.value;
    }

    private async setupDataSource(): Promise<void> {
        // 1. In-memory customDataSource
        if (this.customDataSource && Array.isArray(this.customDataSource)) {
            let filtered = this.applyCascading(this.customDataSource);
            this.dataSource = this.applyIgnoreValue(filtered);
            this.checkMapValue();
            return;
        }

        // 2. Key-based service
        if (this.checkBoxKey && this.service) {
            const result = await lastValueFrom(
                this.service.getService(this.checkBoxKey, {
                    cascadeBy: this.cascadeBy,
                } as CheckBoxParam),
            );

            this.dataSource = this.applyIgnoreValue(result);
            this.checkMapValue();
        }
    }

    private applyCascading(items: CheckBoxViewModel[] | any[]): any[] {
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

    private applyIgnoreValue(items: CheckBoxViewModel[] | any[]): any[] {
        if (!this.ignoreValue?.length) return items;
        return items.filter(
            (item) => !this.ignoreValue.includes(item[this.valueExprOption]),
        );
    }

    private checkMapValue(): void {
        if (this.dataSource.length > 0) {
            this.dataSource.forEach((item) => {
                item.checked = this._value
                    ? this._value.includes(item[this.valueExprOption])
                    : false;
            });
            this.cdr.detectChanges();
        }
    }
}
