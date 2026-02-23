import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { DxNumberBoxComponent } from 'devextreme-angular';

@Component({
  selector: 'cnx-number-box',
  templateUrl: './cnx-number-box.component.html',
  styleUrl: './cnx-number-box.component.css',
  standalone: false,
})
export class CnxNumberBoxComponent implements OnInit, AfterViewInit {
  @ViewChild(DxNumberBoxComponent, { static: false })
  public numberBox!: DxNumberBoxComponent;

  @Input('id')
  public id: string = '';
  @Input('name')
  public name: string = '';

  @Input('disabled')
  public disabled: boolean = false;

  @Input('value')
  set value(val: number | null) {
    this._value = val;
  }
  get value(): number {
    return this._value as any;
  }
  private _value: number | null = null;
  
  @Output('onValueChanged')
  public eventValueChanged: EventEmitter<any> = new EventEmitter();

  @Output('onPaste')
  public eventPaste: EventEmitter<any> = new EventEmitter();

  @Output('onEnterKey')
  public emitEnterKey: EventEmitter<void> = new EventEmitter();

  @Input('format')
  public format: string = '#,##0';
  @Input('numberType')
  public numberType: null | 'positive' | 'negative' | 'percent' | 'positivePercent' = null;
  @Input('integer')
  public integer: number = 0;
  // integer is number before dot(.) ** digit must not exeed 15 when incliuding with decimal digit in format
  // 15 is max digit that dx-number-box can input
  @Input('max')
  public max: number = null as any;
  @Input('min')
  public min: number = null as any;
  @Input('allowEmpty')
  public allowEmpty: boolean = false;
  @Input('tabIndex')
  public tabIndex: number = null as any;

  @Input('disableArrow') disableArrow: boolean = false;

  private _orgFormat: string = '';
  private maxPosibleDigit: number = 15;

  constructor() {}

  public ngOnInit(): void {
    this._orgFormat = this.format;
    this.checkNumberType();
    this.checkDisplayValue(this.value, false);
  }

  public ngAfterViewInit(): void {
    if (this.disableArrow) {
      if (this.numberBox?.instance) {
        this.numberBox.instance.registerKeyHandler('upArrow', (e: any) => {
          e.preventDefault();
        });

        this.numberBox.instance.registerKeyHandler('downArrow', (e: any) => {
          e.preventDefault();
        });
      }
    }

    this.defaultZero();
  }

  public onValueChanged($event: any): void {
    let _event = { ...$event };
    if (_event?.value === 0 && this.allowEmpty) {
      _event = { ..._event, value: null };
    }
    
    // Check if it's from ngAfterViewInit default set
    if (!$event.previousValue && $event.value === 0 && !this.allowEmpty) {
      _event.fromInit = true;
    }
    
    this.eventValueChanged.emit(_event);
  }

  public onPaste($event: any): void {
    this.eventPaste.emit($event);
  }

  public onEnterKey(): void {
    this.emitEnterKey.emit();
  }

  public onFocusIn(): void {
    this.checkDisplayValue(this.value, true);
  }

  public onBlur(): void {
    this.checkDisplayValue(this.value ?? 0, false);
  }

  private checkDisplayValue(value: any, isFocus: boolean): void {
    if (isFocus) {
      this.format = this._orgFormat;
    } else if (this.allowEmpty) {
      if (value === 0) {
        this.format = this.format.replace(/0/g, '#');
      } else {
        this.format = this._orgFormat;
      }
    }
  }

  private defaultZero(): void {
    if (!this.value && !this.allowEmpty) {
      setTimeout(() => {
        if (this.numberBox?.instance) {
          this.numberBox.instance.option('value', 0);
        }
      });
    }
  }

  private checkNumberType(): void {
    const setMax = (value: number | null) => {
      if (!(this.max === null || this.max === undefined)) return;
      this.max = value as any;
    };
    const setMin = (value: number | null) => {
      if (!(this.min === null || this.min === undefined)) return;
      this.min = value as any;
    };

    let dotAndDecimalPlace = /\..*/.exec(this.format)?.[0] || '';
    let decimalPlace = dotAndDecimalPlace.replace('.', '');
    let decimalCount = decimalPlace.length;

    let integerCount = this.integer;
    if (!integerCount) {
      integerCount = this.maxPosibleDigit - decimalCount;
      if (!decimalCount) integerCount = 9; // for support C# int max value
    }

    if (this.numberType == 'positive') {
      setMax(+(''.padEnd(integerCount, '9') + '.' + ''.padEnd(decimalCount, '9')));
      setMin(0);
    } else if (this.numberType == 'negative') {
      setMax(0);
      setMin(-(+(''.padEnd(integerCount, '9') + '.' + ''.padEnd(decimalCount, '9'))));
    } else if (this.numberType == 'percent') {
      setMax(100);
      setMin(-100);
    } else if (this.numberType == 'positivePercent') {
      setMax(100);
      setMin(0);
    } else {
      setMax(+(''.padEnd(integerCount, '9') + '.' + ''.padEnd(decimalCount, '9')));
      setMin(-(+(''.padEnd(integerCount, '9') + '.' + ''.padEnd(decimalCount, '9'))));
    }
  }
}
