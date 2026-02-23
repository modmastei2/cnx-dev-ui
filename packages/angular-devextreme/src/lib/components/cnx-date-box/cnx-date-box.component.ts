import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  AfterViewInit,
  Output,
  ViewChild,
} from '@angular/core';
import { DxDateBoxComponent } from 'devextreme-angular';
import { ValueChangedEvent } from 'devextreme/ui/date_box';
import { dxCalendarOptions } from 'devextreme/ui/calendar';

// fallback utility for formatting without moment dependency
function formatDate(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'cnx-date-box',
  templateUrl: './cnx-date-box.component.html',
  styleUrl: './cnx-date-box.component.css',
  standalone: false,
})
export class CnxDateBoxComponent implements OnInit, AfterViewInit {
  public ngOnInit(): void {}
  @ViewChild('dateBox') public dateBox!: DxDateBoxComponent;

  @Input('id') public id: string = '';
  @Input('name') public name: string = '';
  @Input('placeholder') public placeholder: string = '';
  @Input('minDate') public minDate: Date | string | undefined;
  @Input('maxDate') public maxDate: Date | string | undefined;
  @Input('width') public width: number | string = 110;

  @Input('value')
  set value(val: string | null | Date) {
    if (!val) {
      this._value = null as any;
      return;
    }
    this._value = val?.toString() as any;
  }
  get value(): string {
    return this._value;
  }
  private _value: string = '';

  @Input('disabled') public disabled: boolean = false;

  @Input('disabledDates')
  set disabledDates(val: string[] | null) {
    this._disabledDates = (val || [])
      .map((dateStr) => new Date(dateStr))
      .filter((d) => !isNaN(d.getTime()));
    this._disabledDateSet = this.dateToSet(this._disabledDates);
  }
  get disabledDates(): Date[] {
    return this._disabledDates;
  }
  private _disabledDates: Date[] = [];
  private _disabledDateSet: Set<string> = new Set();

  @Input('format') public format: string = 'dd-MMM-yyyy';
  @Input('calendarOptions') public calendarOptions!: dxCalendarOptions;

  @Input('allowEmpty') public allowEmpty: boolean = true;
  @Input('autoDefault') public autoDefault: boolean = false;

  @Output('onValueChanged') public eventValueChanged = new EventEmitter<ValueChangedEvent>();
  @Output('onEnterKey') public eventEnterKey = new EventEmitter<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  public getClassHolidayCell(cell: any): string {
    if (!cell || !cell.date) return '';
    const cellDateStr = formatDate(cell.date);
    const isHoliday = cellDateStr ? this._disabledDateSet?.has(cellDateStr) : false;
    return isHoliday ? 'holiday-cell !rounded' : '';
  }

  public ngAfterViewInit(): void {
    if (!this.value && !this.disabled && this.autoDefault) {
      setTimeout(() => {
        if (this.dateBox?.instance) {
          this.dateBox.instance.option('value', new Date());
        }
      });
    }
  }

  public onValueChanged($event: ValueChangedEvent): void {
    if (!$event.value && !this.allowEmpty) {
      const today = new Date();
      if (this.dateBox && this.dateBox.instance) {
        this.dateBox.instance.option('value', today);
      }
      return;
    }

    let value: string | null = null;
    if (!!$event.value) {
      value = formatDate($event.value);
    }

    let previousValue: string | null = null;
    if (!!$event.previousValue) {
      previousValue = formatDate($event.previousValue);
    }

    this.eventValueChanged.emit({
      ...$event,
      value: value ? value : null,
      previousValue: previousValue ? previousValue : null,
    });

    this.cdr.detectChanges();
  }

  public onEnterKey(): void {
    this.eventEnterKey.emit();
  }

  public isValidChanged($event: boolean): void {
    if (!$event && this.dateBox?.instance) {
      this.dateBox.instance.option('value', undefined);
    }
  }

  private dateToSet(dates: Date[]): Set<string> {
    const formattedDates = (dates || [])
      .map((d) => formatDate(d))
      .filter((d): d is string => d !== null);
    return new Set(formattedDates);
  }
}
