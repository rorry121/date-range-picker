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

  @ViewChild('hourScrollWrap', {static: true}) hourScrollWrap: ElementRef;
  @ViewChild('minuteScrollWrap', {static: true}) minuteScrollWrap: ElementRef;
  @ViewChild('secondScrollWrap', {static: true}) secondScrollWrap: ElementRef;

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
    console.log(this.hourScrollWrap.nativeElement.scrollTop);
    this.scrollToTop(i, this.hourScrollWrap);
  }

  changeMinute(i: number) {
    this.activeMinute = i;
    console.log(this.minuteScrollWrap.nativeElement.scrollTop);
    this.scrollToTop(i, this.minuteScrollWrap);
  }

  changeSecond(i: number) {
    this.activeSecond = i;
    console.log(this.secondScrollWrap.nativeElement.scrollTop);
    this.scrollToTop(i, this.secondScrollWrap);
  }

  scrollToTop(i: number, elementRef: ElementRef) {
    // elementRef.nativeElement.scrollTop = i * 24;
    this.animateScroll(i,  elementRef);
    this.cdf.detectChanges();
  }

  animateScroll(i, elementRef: ElementRef) {
    const total = i * 24;
    const distance = total - elementRef.nativeElement.scrollTop - 6;
    if (distance > 0) {
      elementRef.nativeElement.scrollTop = elementRef.nativeElement.scrollTop + 6;
      setTimeout(() => {
        this.animateScroll(i, elementRef);
      }, 5);
    } else {
      elementRef.nativeElement.scrollTop = total;
    }
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
        const num = this.time.getHours();
        this.activeHour = num;
        this.hourScrollWrap.nativeElement.scrollTop = num * 24;
      }
      if (!this.activeMinute) {
        const num = this.time.getMinutes();
        this.activeMinute = num;
        this.minuteScrollWrap.nativeElement.scrollTop = num * 24;
      }
      if (!this.activeSecond) {
        const num = this.time.getSeconds();
        this.activeSecond = num;
        this.secondScrollWrap.nativeElement.scrollTop = num * 24;
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
