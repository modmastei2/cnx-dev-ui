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
    @Input('cascadeBy')
    public cascadeBy: any;

    @Input('ignoreValue')
    public ignoreValue: string[] = [];

    @Input('dataSource')
    set dataSource(items: CheckBoxViewModel[]) {
        this._dataSource = items.map((item) => ({ ...item }));
    }
    get dataSource(): CheckBoxViewModel[] {
        return this._dataSource;
    }
    private _dataSource: CheckBoxViewModel[] = [];

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
        if (changes['value'] && !changes['value'].firstChange) {
            this.checkMapValue();
        }

        const cascadeChange = changes['cascadeBy'];
        if (cascadeChange && !cascadeChange.firstChange) {
            const isDiff =
                JSON.stringify(cascadeChange.currentValue) !==
                JSON.stringify(cascadeChange.previousValue);
            if (isDiff) {
                await this.setupDataSource();
            }
        }
    }

    public onValueChanged(
        $event: ValueChangedEvent,
        item: CheckBoxViewModel,
    ): void {
        if (this.mode === 'single') {
            if ($event.value === true) {
                this.dataSource.forEach((i) => {
                    if (i.value !== item.value) {
                        i.checked = false;
                    }
                });
            }
        }

        item.checked = $event.value;
        const value = this.dataSource
            .filter((i) => i.checked === true)
            .map((i) => i.value);

        this.eventValueChanged.emit({ value });
    }

    public onClickLabelCheckBox(checkBox: DxCheckBoxComponent): void {
        if (this.disabled) return;
        checkBox.value = !checkBox.value;
    }

    private async setupDataSource(): Promise<void> {
        // 1. In-memory customDataSource
        if (this.dataSource.length > 0 && Array.isArray(this.dataSource)) {
            this.dataSource = this.applyIgnoreValue(this.dataSource);
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

            console.log('result', result);
            this.dataSource = this.applyIgnoreValue(result);
            this.checkMapValue();
        }
    }

    private applyIgnoreValue(items: CheckBoxViewModel[]): CheckBoxViewModel[] {
        if (!this.ignoreValue?.length) return items;
        return items.filter((item) => !this.ignoreValue.includes(item.value));
    }

    private checkMapValue(): void {
        if (this.dataSource.length > 0) {
            this.dataSource.forEach((item) => {
                item.checked = this._value
                    ? this._value.includes(item.value)
                    : false;
            });
            this.cdr.detectChanges();
        }
    }
}
