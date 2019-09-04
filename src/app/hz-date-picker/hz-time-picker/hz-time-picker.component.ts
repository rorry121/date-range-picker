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
  time: string| number | Date;
  modalDate: Date;
  format: string;
  timePickerOverlayRef: OverlayRef;
  inited = false;


  @Input() onlyTime = false;
  @Input() type: 'string' | 'date' = 'date';
  @Input() placeholder = '请选择时间';
  @ViewChild('timePickerTemplate', {static: false}) timePickerTemplate: TemplateRef<any>;

  constructor(
    private cdf: ChangeDetectorRef,
    private overlay: Overlay,
    private vc: ViewContainerRef
  ) {
  }

  ngOnInit() {

  }

  ngAfterViewInit(): void {
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
          const str = this.getOnlyTime();
          this.writeValue(str);
        } else {
          this.writeValue(this.modalDate.toLocaleString());
        }
      }
    }
    this.closeModal();
  }

  getOnlyTime() {
    let hour: string | number = this.modalDate.getHours();
    if (hour < 10) {
      hour = '0' + hour;
    }
    let minute: string | number  = this.modalDate.getMinutes();
    if (minute < 10) {
      minute = '0' + minute;
    }
    let second: string | number  = this.modalDate.getSeconds();
    if (second < 10) {
      second = '0' + second;
    }
    const str = hour + ':' + minute + ':' + second;
    return str;
  }

  closeModal() {
    if (this.timePickerOverlayRef && this.timePickerOverlayRef.hasAttached()) {
      this.timePickerOverlayRef.detach();
    }
  }

  showOverlay() {
    const StartAlignBottomWithTop: ConnectedPosition[] = [
      {originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top'},
      {originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'bottom'},
      {originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'top'},
      {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'bottom'},
    ];
    this.timePickerOverlayRef = this.show(event.currentTarget as HTMLElement, this.timePickerTemplate, this.vc, StartAlignBottomWithTop);
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
      if (!this.inited) {
        if (this.time && this.time instanceof  Date) {
          this.modalDate = this.time;
        } else if (!this.time) {
          this.modalDate = new Date();
        } else {
          if (this.type === 'string') {
            this.modalDate = this.onlyTime ? new Date('2000/1/1 ' + this.time) : new Date(this.time);
          }
        }
        this.inited = true;
      }
      console.log('this.modalDate :', this.modalDate);
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
