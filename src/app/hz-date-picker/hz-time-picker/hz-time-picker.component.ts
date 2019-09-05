import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef, EventEmitter,
  forwardRef, Input,
  OnInit, Output, TemplateRef,
  ViewChild, ViewContainerRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'hz-time-picker',
  templateUrl: './hz-time-picker.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => HzTimePickerComponent)
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HzTimePickerComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  time: string| number | Date | Date[] | string[];
  modalDate: Date;
  format: string;
  timePickerOverlayRef: OverlayRef;
  timeRangePickerOverlayRef: OverlayRef;
  initied = false;


  @Input() onlyTime = false;
  @Input() isRange = false;
  @Input() rangeDate: Date[];
  @Input() type: 'string' | 'date' = 'date';
  @Input() placeholder: string | string[];
  @ViewChild('timePickerTemplate', {static: false}) timePickerTemplate: TemplateRef<any>;
  @ViewChild('timeRangePickerTemplate', {static: false}) timeRangePickerTemplate: TemplateRef<any>;

  constructor(
    private cdf: ChangeDetectorRef,
    private overlay: Overlay,
    private vc: ViewContainerRef
  ) {
  }

  ngOnInit() {
    console.log('ngOnInit');
    if (!this.placeholder ) {
      this.placeholder = this.isRange ? ['开始时段', '结束时段'] : '请选择日期';
    }
    if (this.onlyTime && this.type === 'string') {
      if (!this.time) {
        this.time = [];
      }
      this.rangeDate = [new Date('2000/1/1 00:00:00'), new Date('2000/1/1 00:00:00')];
    }
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit');
    this.format = this.onlyTime ? 'HH:mm:ss' : 'yyyy/MM/dd HH:mm:ss';
  }

  onTimeClick(date: Date) {

  }

  confirm() {
    if (this.time && this.time instanceof  Date) {
      this.writeValue(this.modalDate);
    } else if (!this.time) {
      this.writeValue(this.modalDate);
    } else {
      if (this.type === 'string') {
        if (this.onlyTime) {
          const str = this.getOnlyTime(this.modalDate);
          this.writeValue(str);
        } else {
          this.writeValue(this.modalDate.toLocaleString());
        }
      }
    }
    this.closeModal();
  }

  getOnlyTime(date: Date) {
    let hour: string | number = date.getHours();
    if (hour < 10) {
      hour = '0' + hour;
    }
    let minute: string | number  = date.getMinutes();
    if (minute < 10) {
      minute = '0' + minute;
    }
    let second: string | number  = date.getSeconds();
    if (second < 10) {
      second = '0' + second;
    }
    const str = hour + ':' + minute + ':' + second;
    return str;
  }

  rangeConfirmClick() {
    console.log(this.rangeDate);
    const strArr = [];
    if (this.rangeDate[0].getTime() < this.rangeDate[1].getTime()) {
      strArr[0] = this.getOnlyTime(this.rangeDate[0]);
      strArr[1] = this.getOnlyTime(this.rangeDate[1]);
    } else {
      strArr[0] = this.getOnlyTime(this.rangeDate[1]);
      strArr[1] = this.getOnlyTime(this.rangeDate[0]);
    }
    this.writeValue(strArr);
    this.closeModal();
  }

  closeModal() {
    if (!this.isRange) {
      if (this.timePickerOverlayRef && this.timePickerOverlayRef.hasAttached()) {
        this.timePickerOverlayRef.detach();
      }
    } else {
      if (this.timeRangePickerOverlayRef && this.timeRangePickerOverlayRef.hasAttached()) {
        this.timeRangePickerOverlayRef.detach();
      }
    }
  }

  showOverlay(event: MouseEvent) {
    const StartAlignBottomWithTop: ConnectedPosition[] = [
      {originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top'},
      {originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'bottom'},
      {originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'top'},
      {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'bottom'},
    ];
    if (!this.isRange) {
      if (this.timePickerOverlayRef && this.timePickerOverlayRef.hasAttached()) {
        this.timePickerOverlayRef.detach();
      } else {
        this.timePickerOverlayRef = this.show(event.currentTarget as HTMLElement, this.timePickerTemplate, this.vc, StartAlignBottomWithTop);
      }
    } else {
      if (this.timeRangePickerOverlayRef && this.timeRangePickerOverlayRef.hasAttached()) {
        this.timeRangePickerOverlayRef.detach();
      } else {
        if (this.onlyTime && this.type === 'string') {
          if ((this.time as string[]).length === 2) {
            this.rangeDate = [new Date('2000/1/1 ' + this.time[0]), new Date('2000/1/1 ' + this.time[1])];
          }
        }
        this.timeRangePickerOverlayRef = this.show(event.currentTarget as HTMLElement, this.timeRangePickerTemplate, this.vc, StartAlignBottomWithTop);
      }
    }
  }

  // 根据点击元素，展示 modal
  show(origin: ElementRef | HTMLElement, template: TemplateRef<any>, viewContainer: ViewContainerRef, connectionPosition: ConnectedPosition[], context?: any): OverlayRef {
    const positionStrategy = this.overlay.position().flexibleConnectedTo(origin).withPositions(connectionPosition);
    const overlayRef = this.overlay.create({
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy,
    });
    if (overlayRef.hasAttached()) {
      overlayRef.detach();
    } else {
      overlayRef.attach(new TemplatePortal(template, viewContainer, {$implicit: context}));
    }
    return overlayRef;
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
