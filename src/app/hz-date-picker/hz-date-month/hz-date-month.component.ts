import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import { DateDayCell } from '../hz-date-picker.interface';
import { HzDateCellComponent } from '../hz-date-cell/hz-date-cell.component';
import { merge } from 'rxjs/internal/observable/merge';
import { startWith, take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

const ONE_DAY_MILLISECOND = 24 * 60 * 60 * 1000;  // 一天的毫秒数
const SHOW_DAY_NUM = 42;

@Component({
  selector: 'app-hz-date-month',
  templateUrl: './hz-date-month.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class HzDateMonthComponent implements OnInit, AfterViewInit, OnDestroy {
  monthCells: DateDayCell[] = [];
  curMonth: number;
  curYear: number;
  monthHeader = ['一', '二', '三', '四', '五', '六', '日'];
  lastSelectedCell: DateDayCell;
  destroy$ = new Subject();

  @Input() dateValue: Date;
  @Input() isRange = false;
  @Input() rangeDate: Date[];
  @Input() rangeStart: boolean;
  @Input() rangeEnd: boolean;
  @Output() cellClick = new EventEmitter<DateDayCell>();
  @Output() rangeConfirm = new EventEmitter<Date[]>();
  @ViewChildren(HzDateCellComponent) listOfDateCellComponent: QueryList<HzDateCellComponent>;
  @HostBinding('style.display') display = 'inline-block';

  constructor(
  ) {
  }

  ngOnInit() {
    this.initDate();
    this.makeMonthCells();
  }

  ngAfterViewInit(): void {
    // single 模式下, 直接向 hz-date-picker 组件 emit 数据
    if (!this.isRange) {
      this.listOfDateCellComponent.changes.pipe(
        startWith(true),
        takeUntil(this.destroy$),
      ).subscribe(() => {
        const singleDateCellClick$ = merge(...this.listOfDateCellComponent.map(cell => cell.click$));
        singleDateCellClick$.pipe(takeUntil(this.listOfDateCellComponent.changes.pipe(take(1)))).subscribe(cell => {
          // 清空上次选择并更新
          if (this.lastSelectedCell) {
            this.lastSelectedCell.isSelected = false;
          }
          cell.isSelected = true;
          this.lastSelectedCell = cell;
          this.cellClick.emit(cell);
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initDate() {
    if (!this.isRange) {
      if (this.dateValue) {
        this.curMonth = this.dateValue.getMonth() + 1;
        this.curYear = this.dateValue.getFullYear();
      } else {
        this.curMonth = new Date().getMonth() + 1;
        this.curYear = new Date().getFullYear();
      }
    } else {
      if (this.rangeStart && this.rangeDate[0]) {
        this.curMonth = this.rangeDate[0].getMonth() + 1;
        this.curYear = this.rangeDate[0].getFullYear();
      } else if (this.rangeStart && !this.rangeDate[0]) {
        this.curMonth = new Date().getMonth() + 1;
        this.curYear = new Date().getFullYear();
      }
      if (this.rangeEnd && this.rangeDate[1]) {
        this.curMonth = this.rangeDate[1].getMonth() + 1;
        this.curYear = this.rangeDate[1].getFullYear();
        // 月份再 + 1
        this.changeMonth(true);
      } else if (this.rangeEnd && !this.rangeDate[1]) {
        this.curMonth = new Date().getMonth() + 1;
        this.curYear = new Date().getFullYear();
        // 月份再 + 1
        this.changeMonth(true);
      }
    }
  }

  makeMonthCells() {
    // value: Date;
    // title: string;
    // isSelected?: boolean;
    // isToday?: boolean;
    // isDisabled?: boolean;
    // isSelectedStartDate?: boolean;
    // isSelectedEndDate?: boolean;
    // isInRange?: boolean;
    this.monthCells = [];
    const firstDayOfMonth = new Date(`${this.curYear}/${this.curMonth}`);
    const weekStart = this.getWeekIndex(firstDayOfMonth);
    for (let i = 1; i < SHOW_DAY_NUM + 1; i++) {
      const distance = i - weekStart;
      const value = new Date(firstDayOfMonth.getTime() + ONE_DAY_MILLISECOND * distance);
      const cell = {
        value,
        title: value.toLocaleDateString(),
        isToday: new Date().toString().slice(0, 15) === value.toString().slice(0, 15),
        isLastMonth: distance < 0,
        isNextMonth: distance > 0 && value.getMonth() !== this.curMonth - 1,
        isSelected: this.dateValue && this.dateValue.toString().slice(0, 15) === value.toString().slice(0, 15),
        // isSelectedStartDate:
        // isSelectedEndDate:
      };
      this.monthCells.push(cell);
    }
  }

  // 1-7分别代表周一到周日
  getWeekIndex(date: Date) {
    const num = date.getDay();
    return num ? num : 7;
  }

  changeYear(bool: boolean) {
    if (bool) {
      this.curYear++;
    } else {
      if (this.curYear) {
        this.curYear--;
      }
    }
    this.makeMonthCells();
  }

  changeMonth(bool: boolean) {
    if (bool) {
      if (this.curMonth === 12) {
        this.curMonth = 1;
        this.curYear++;
      } else {
        this.curMonth++;
      }
    } else {
      if (this.curMonth === 1) {
        this.curMonth = 12;
        this.curYear--;
      } else {
        this.curMonth--;
      }
    }
    this.makeMonthCells();
  }

}
