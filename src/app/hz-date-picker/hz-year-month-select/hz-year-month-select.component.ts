import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { RecentYearCell } from '../hz-date-picker.interface';

@Component({
  selector: 'app-hz-year-month-select',
  templateUrl: './hz-year-month-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HzYearMonthSelectComponent implements OnInit {
  curYear: number;
  recentStartYear: number;
  recentYear: Array<RecentYearCell>;
  monthList = new Array(12);

  @Input() set year(value) {
    if (value) {
      this.curYear = value;
      const num = this.curYear % 10;
      this.recentStartYear = this.curYear - num;
      this.makeRecentYear();
    }
  }

  @Input() month;
  @Output() yearChange = new EventEmitter<number>();
  @Output() monthChange = new EventEmitter<{year: number; month: number}>();
  @HostBinding('style.display') display = 'inline-block';

  constructor() {
  }

  ngOnInit() {
  }

  makeRecentYear() {
    this.recentYear = [];
    const lastCell: RecentYearCell = {value: this.recentStartYear - 1, isLast: true, isNext: false};
    this.recentYear.push(lastCell);
    for (let i = 0; i < 10; i++) {
      const cell: RecentYearCell = {value: this.recentStartYear + i, isLast: false, isNext: false};
      this.recentYear.push(cell);
    }
    const nextCell: RecentYearCell = {value: this.recentStartYear + 10, isLast: false, isNext: true};
    this.recentYear.push(nextCell);
  }

  selectYear(cell: RecentYearCell) {
    if (cell.isLast) {
      this.changeRecent(false);
      return;
    }
    if (cell.isNext) {
      this.changeRecent(true);
      return;
    }
    this.curYear = cell.value;
    this.yearChange.emit(this.curYear);
  }

  selectMonth(num: number) {
    this.month = num + 1;
    this.monthChange.emit({year: this.curYear, month: this.month});
  }

  changeRecent(add: boolean) {
    if (this.month) {
      if (add) {
        this.curYear = this.curYear + 1;
      } else {
        this.curYear = this.curYear - 1;
      }
    } else {
      if (add) {
        this.recentStartYear = this.recentStartYear + 10;
        this.makeRecentYear();
      } else {
        this.recentStartYear = this.recentStartYear - 10;
        this.makeRecentYear();
      }
    }
  }
}
