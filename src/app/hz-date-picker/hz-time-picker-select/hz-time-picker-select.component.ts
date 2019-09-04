import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef, EventEmitter,
  forwardRef, HostBinding,
  OnInit, Output,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'hz-time-picker-select',
  templateUrl: './hz-time-picker-select.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => HzTimePickerSelectComponent)
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HzTimePickerSelectComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  time: Date;
  hour = new Array(24);
  minute = new Array(60);
  second = new Array(60);
  activeHour: number;
  activeMinute: number;
  activeSecond: number;

  @Output() timeClick = new EventEmitter<Date>();

  @ViewChild('hourScrollWrap', {static: false}) hourScrollWrap: ElementRef;
  @ViewChild('minuteScrollWrap', {static: false}) minuteScrollWrap: ElementRef;
  @ViewChild('secondScrollWrap', {static: false}) secondScrollWrap: ElementRef;

  @HostBinding('style.display') display = 'inline-block';

  constructor(
    private cdf: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {

  }

  changeTime(i: number, type: number) {
    if (type === 0) {
      this.changeHour(i);
    } else if (type === 1) {
      this.changeMinute(i);
    } else if (type === 2) {
      this.changeSecond(i);
    }
    const date = this.getSelectTime();
    this.writeValue(date);
    this.timeClick.emit(date);
  }

  changeHour(i: number) {
    this.activeHour = i;
    this.scrollToTop(i, this.hourScrollWrap);
  }

  changeMinute(i: number) {
    this.activeMinute = i;
    this.scrollToTop(i, this.minuteScrollWrap);
  }

  changeSecond(i: number) {
    this.activeSecond = i;
    this.scrollToTop(i, this.secondScrollWrap);
  }

  scrollToTop(i: number, elementRef: ElementRef) {
    elementRef.nativeElement.scrollTop = i * 24;
  }

  getSelectTime() {
    const day = this.time.getFullYear() + '/' + (this.time.getMonth() + 1) + '/' + this.time.getDate();
    console.log(day);
    return new Date(new Date(day).getTime() + this.activeHour * 60 * 60 * 1000 + this.activeMinute * 60 * 1000 + this.activeSecond * 1000);
  }

  // ------------------------------------------------------------------------
  // | Control value accessor implements
  // ------------------------------------------------------------------------
  onTouchedCallback: () => void = () => {
  }
  onChangeCallback: (_: any) => void = () => {
  }

  setValue(value: Date) {
    this.time = value;
    this.onChangeCallback(value);
    this.cdf.detectChanges();
  }

  writeValue(value): void {
    if (value) {
      console.log('writeValue:', value);
      this.setValue(value);
      if (!this.activeHour) {
        this.changeHour(this.time.getHours());
      }
      if (!this.activeMinute) {
        this.changeMinute(this.time.getMinutes());

      }
      if (!this.activeSecond) {
        this.changeSecond(this.time.getSeconds());
      }
      this.cdf.detectChanges();
    }
  }

  // tslint:disable-next-line:no-any
  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  // tslint:disable-next-line:no-any
  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

}
