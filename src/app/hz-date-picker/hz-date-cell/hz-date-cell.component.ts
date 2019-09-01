import { ChangeDetectionStrategy, Component, HostBinding, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { DateDayCell } from '../hz-date-picker.interface';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-hz-date-cell',
  templateUrl: './hz-date-cell.component.html',
  styleUrls: ['./hz-date-cell.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HzDateCellComponent implements OnInit, OnDestroy {
  @Input() cellValue: DateDayCell;
  @Input() rangeDate: Date[];
  click$ = new Subject<DateDayCell>();
  mouseenter$ = new Subject<DateDayCell>();
  destroy$ = new Subject();
  constructor() { }
  @HostBinding('class.hz-datepicker-cell') isCell = true;
  @HostBinding('class.hz-datepicker-last-month-cell') get isLastMonth() {
    return this.cellValue.isLastMonth;
  }
  @HostBinding('class.hz-datepicker-next-month-cell') get isNextMonth() {
    return this.cellValue.isNextMonth;
  }
  @HostBinding('class.hz-datepicker-today-cell') get isToday() {
    return this.cellValue.isToday;
  }
  @HostBinding('class.hz-datepicker-selected-cell') get isSelected() {
    return this.cellValue.isSelected;
  }
  @HostBinding('class.hz-datepicker-range-start-cell') get isRangeStart() {
    return this.rangeDate && this.cellValue.isSelectedStartDate;
  }
  @HostBinding('class.hz-datepicker-range-end-cell') get isRangeEnd() {
    return this.rangeDate && this.cellValue.isSelectedEndDate;
  }
  @HostBinding('class.hz-datepicker-in-range-cell') get isInRange() {
    return this.rangeDate && this.cellValue.isInRange;
  }
  @HostListener('click') onClick() {
    this.click$.next(this.cellValue);
  }
  @HostListener('mouseenter') onMouseEnter() {
    this.mouseenter$.next(this.cellValue);
  }
  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
