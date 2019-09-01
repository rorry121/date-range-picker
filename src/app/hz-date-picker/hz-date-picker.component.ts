import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ContentChildren,
  ElementRef,
  forwardRef, HostBinding,
  Input,
  OnInit, QueryList,
  TemplateRef, ViewChild, ViewChildren, ViewContainerRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateDayCell } from './hz-date-picker.interface';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { HzDateCellComponent } from './hz-date-cell/hz-date-cell.component';
import { merge } from 'rxjs';
import { HzDateMonthComponent } from './hz-date-month/hz-date-month.component';

@Component({
  selector: 'app-hz-date-picker',
  templateUrl: './hz-date-picker.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => HzDatePickerComponent)
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HzDatePickerComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  @Input() isRange = false;
  @Input() showTime = true;
  @Input() format: string;
  @Input() placeholder: string | Array<string>;
  dateValue: CompatibleDate = null;
  singleModalDate: Date;
  rangeModalDate: Date[];
  singleDateOverlayRef: OverlayRef;
  rangeDateOverlayRef: OverlayRef;
  cell: DateDayCell;
  @ViewChild('singleDatePickTemplate', {static: false}) singleDatePickTemplate: TemplateRef<any>;
  @ViewChild('rangeDatePickTemplate', {static: false}) rangeDatePickTemplate: TemplateRef<any>;
  @ViewChildren(HzDateCellComponent) listOfDateCellComponent: QueryList<HzDateCellComponent>;

  @HostBinding('style.cursor') cursor = 'pointer';

  constructor(
    private cdf: ChangeDetectorRef,
    private overlay: Overlay,
    private vc: ViewContainerRef
  ) {
  }

  ngOnInit() {
    this.initValue();
    this.cell = {
      value: new Date(),
      title: new Date().toDateString(),
      isSelected: false,
    };
  }

  ngAfterViewInit(): void {
    // console.log(this.singleDateMonth);
    // const cellClick$ = merge(this.singleDateMonthComponent.listOfDateCellComponent.changes, ...this.singleDateMonthComponent.listOfDateCellComponent.map(e => e.click$));
    // cellClick$.subscribe((cell: DateDayCell) => {
    //   console.log(cell);
    //   this.dateValue = cell.value;
    // });
  }

  changeDate() {
    this.writeValue(new Date());
  }

  initValue() {
    this.dateValue = this.isRange ? [] : null;
    if (!this.format) {
      this.format = this.showTime ? 'yyyy-MM-dd: HH:mm:ss' : 'yyyy-MM-dd';
    }
    if (!this.placeholder ) {
      this.placeholder = this.isRange ? ['开始日期', '结束日期'] : '请选择日期';
    }
  }

  showOverlay(event: MouseEvent) {
    if (!this.isRange) {
      if (this.singleDateOverlayRef && this.singleDateOverlayRef.hasAttached()) {
        this.singleDateOverlayRef.detach();
      } else {
        this.singleModalDate = this.dateValue as Date;
        const StartAlignBottomWithTop: ConnectedPosition[] = [
          {originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top'},
          {originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'bottom'},
        ];
        this.singleDateOverlayRef = this.show(event.currentTarget as HTMLElement, this.singleDatePickTemplate, this.vc, StartAlignBottomWithTop);
      }
    } else {
      if (this.rangeDateOverlayRef && this.rangeDateOverlayRef.hasAttached()) {
        this.rangeDateOverlayRef.detach();
      } else {
        this.rangeModalDate = [...this.dateValue as Date[]];
        const StartAlignBottomWithTop: ConnectedPosition[] = [
          {originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top'},
          {originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'bottom'},
          {originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'top'},
          {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'bottom'},
        ];
        this.rangeDateOverlayRef = this.show(event.currentTarget as HTMLElement, this.rangeDatePickTemplate, this.vc, StartAlignBottomWithTop);
      }
    }
  }

  onCellClick(event: DateDayCell) {
    this.singleModalDate = event.value;
  }

  onSingleConfirm() {
    this.dateValue = this.singleModalDate;
    if (this.singleDateOverlayRef && this.singleDateOverlayRef.hasAttached()) {
      this.singleDateOverlayRef.detach();
    }
    this.cdf.detectChanges();
  }

  onRangeConfirm(rangeDate: Date[]) {
    this.dateValue = rangeDate;
    if (this.rangeDateOverlayRef && this.rangeDateOverlayRef.hasAttached()) {
      this.rangeDateOverlayRef.detach();
    }
    this.cdf.detectChanges();
  }

  closeSingleModal() {
    if (this.singleDateOverlayRef && this.singleDateOverlayRef.hasAttached()) {
      this.singleDateOverlayRef.detach();
    }
  }

  closeRangeModal() {
    if (this.rangeDateOverlayRef && this.rangeDateOverlayRef.hasAttached()) {
      this.rangeDateOverlayRef.detach();
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

  setValue(value: CompatibleDate) {
    this.dateValue = value;
    this.onChangeCallback(value);
    this.cdf.detectChanges();
  }

  writeValue(value): void {
    if (value) {
      console.log('writeValue:', value);
      this.setValue(value);
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

export type CompatibleDate = Date | Date[];
