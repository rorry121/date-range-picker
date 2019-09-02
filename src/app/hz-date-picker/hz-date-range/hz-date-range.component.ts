import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, EventEmitter,
  Input,
  OnDestroy,
  OnInit, Output,
  QueryList, Renderer2, ViewChild,
  ViewChildren
} from '@angular/core';
import { DateDayCell } from '../hz-date-picker.interface';
import { HzDateMonthComponent, ONE_DAY_MILLISECOND } from '../hz-date-month/hz-date-month.component';
import { merge, Subject } from 'rxjs';
import { filter, startWith, take, takeUntil } from 'rxjs/operators';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';

@Component({
  selector: 'app-hz-date-range',
  templateUrl: './hz-date-range.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HzDateRangeComponent implements OnInit, AfterViewInit, OnDestroy {
  tempRangeDate: DateDayCell[] = []; // 无序的
  destroy$ = new Subject();
  rangeSelected = false;
  @Input() rangeDate: Date[] = [];
  @Input() placeholder: Array<string>;
  @Input() format: string;
  @Input() showTime = true;
  @Output() rangeConfirm = new EventEmitter<Date[]>();
  @Output() rangeCancel = new EventEmitter();
  @ViewChildren(HzDateMonthComponent) listOfHzDateMonthComponent: QueryList<HzDateMonthComponent>;
  @ViewChild('LDMComponent', {static: false}) LDMComponent: HzDateMonthComponent;
  @ViewChild('RDMComponent', {static: false}) RDMComponent: HzDateMonthComponent;

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    console.log(this.LDMComponent, this.RDMComponent);
    console.log('listOfHzDateMonthComponent:', this.listOfHzDateMonthComponent);

    // 左侧日期框点击
    const leftDMCChange$ = this.LDMComponent.listOfDateCellComponent.changes;
    leftDMCChange$.pipe(startWith(true), takeUntil(this.destroy$)).subscribe(() => {
      console.log('leftDMCChange$');
      const leftDMCClick$ = merge(...this.LDMComponent.listOfDateCellComponent.map(cell => cell.click$));
      leftDMCClick$.pipe(
        takeUntil(leftDMCChange$.pipe(take(1)))
      ).subscribe(cell => {
        console.log('leftDMCClick$', cell);
        // 点击下一月的日期
        if (cell.isNextMonth) {
          // 右侧日期框为左侧的下一个月
          if ((this.LDMComponent.curYear === this.RDMComponent.curYear &&
            this.LDMComponent.curMonth === this.RDMComponent.curMonth - 1) ||
            (this.LDMComponent.curYear === this.RDMComponent.curYear - 1 &&
              this.LDMComponent.curMonth === 12 && this.RDMComponent.curMonth === 1)
          ) {
            // 右侧选中左侧点击的日期
            const sameCell = this.RDMComponent.monthCells.find(e => e.title === cell.title);
            this.handleRangeSelect(sameCell);
          } else {
            this.LDMComponent.changeMonth(true);
            // 切换月份后找到所点击的日期
            const sameCell = this.LDMComponent.monthCells.find(e => e.title === cell.title);
            this.handleRangeSelect(sameCell);
            this.isCellInRange(1);
          }
        } else if (cell.isLastMonth) {
          // 点击上一个月
          this.LDMComponent.changeMonth(false);
          // 切换月份后找到所点击的日期
          const sameCell = this.LDMComponent.monthCells.find(e => e.title === cell.title);
          this.handleRangeSelect(sameCell);
          this.isCellInRange(1);
        } else {
          this.handleRangeSelect(cell);
        }
      });
    });

    // 右侧日期框点击
    const RightDMCChange$ = this.RDMComponent.listOfDateCellComponent.changes;
    RightDMCChange$.pipe(startWith(true), takeUntil(this.destroy$)).subscribe(() => {
      console.log('RightDMCChange$');
      const RightDMCClick$ = merge(...this.RDMComponent.listOfDateCellComponent.map(cell => cell.click$));
      RightDMCClick$.pipe(
        takeUntil(RightDMCChange$.pipe(take(1)))
      ).subscribe(cell => {
        console.log('RightDMCClick$', cell);
        // 点击上一月的日期
        if (cell.isLastMonth) {
          // 左侧日期框为右侧侧的上一个月
          if ((this.LDMComponent.curYear * 12 + this.LDMComponent.curMonth - this.RDMComponent.curYear * 12 - this.RDMComponent.curMonth) === -1) {
            // 左侧侧选中右侧点击的日期
            const sameCell = this.LDMComponent.monthCells.find(e => e.title === cell.title);
            this.handleRangeSelect(sameCell);
          } else {
            this.RDMComponent.changeMonth(false);
            // 切换月份后找到所点击的日期
            const sameCell = this.RDMComponent.monthCells.find(e => e.title === cell.title);
            this.handleRangeSelect(sameCell);
            this.isCellInRange(2);
          }
        } else if (cell.isNextMonth) {
          // 点击下一个月
          this.RDMComponent.changeMonth(true);
          // 切换月份后找到所点击的日期
          const sameCell = this.RDMComponent.monthCells.find(e => e.title === cell.title);
          this.handleRangeSelect(sameCell);
          this.isCellInRange(2);
        } else {
          this.handleRangeSelect(cell);
        }
      });
    });
    const cellListChange$ = merge(...this.listOfHzDateMonthComponent.map(month => month.listOfDateCellComponent.changes));
    cellListChange$.pipe(
      startWith(true),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // console.log('cellListChange$');
      // // cell 点击事件
      // const rangeCellClick$ = merge(...this.listOfHzDateMonthComponent.map(month => merge(...month.listOfDateCellComponent.map(cell => cell.click$))));
      // rangeCellClick$.pipe(
      //   takeUntil(cellListChange$.pipe(take(1)))
      // ).subscribe(cell => {
      //   console.log(cell);
      //   this.handleRangeSelect(cell);
      // });
      // cell mouseenter事件
      const rangeCellMouseEnter$ = merge(...this.listOfHzDateMonthComponent.map(month => merge(...month.listOfDateCellComponent.map(cell => cell.mouseenter$))));
      rangeCellMouseEnter$.pipe(
        filter(e => this.tempRangeDate.length > 0 && !this.rangeSelected),
        takeUntil(cellListChange$.pipe(take(1)))
      ).subscribe(cell => {
        // if (cell.isLastMonth || cell.isNextMonth) {
        //   return;
        // }
        // 清空上次选择的 cell 状态
        if (this.tempRangeDate[1]) {
          this.tempRangeDate[1].isSelectedEndDate = false;
          this.tempRangeDate[1].isSelectedStartDate = false;
        }
        if ((this.LDMComponent.curYear === this.RDMComponent.curYear &&
          this.LDMComponent.curMonth === this.RDMComponent.curMonth - 1) ||
          (this.LDMComponent.curYear === this.RDMComponent.curYear - 1 &&
            this.LDMComponent.curMonth === 12 && this.RDMComponent.curMonth === 1)
        ) {
          const sameCell = this.RDMComponent.monthCells.find(e => e.title === cell.title);
          const sameCell1 = this.LDMComponent.monthCells.find(e => e.title === cell.title);
          if (cell.isNextMonth && sameCell) {
            this.handleWhenLengthOne(sameCell);
          } else if (cell.isLastMonth && sameCell1) {
            this.handleWhenLengthOne(sameCell1);
          } else {
            this.handleWhenLengthOne(cell);
          }
        } else {
          this.handleWhenLengthOne(cell);
        }
        this.isCellInRange(0);
      });
    });
  }

  // 判定 isInRange， 仅left(1), 仅right（2), 全部（0）
  isCellInRange(num: number) {
    let endRange;
    let startRange;
    // 选中范围
    if (this.tempRangeDate[1].value.getTime() > this.tempRangeDate[0].value.getTime()) {
      endRange = this.tempRangeDate[1];
      startRange = this.tempRangeDate[0];
    } else {
      endRange = this.tempRangeDate[0];
      startRange = this.tempRangeDate[1];
    }
    if(num === 0 || num === 1) {
      // 左侧日期判断
      this.LDMComponent.monthCells.forEach(e => {
        if (e.value.getTime() < endRange.value.getTime() && e.value.getTime() > startRange.value.getTime()) {
          e.isInRange = true;
        } else {
          e.isInRange = false;
        }
      });
    }
    if (num === 0 || num === 2) {
      // 右侧日期判断
      this.RDMComponent.monthCells.forEach(e => {
        if (e.value.getTime() < endRange.value.getTime() && e.value.getTime() > startRange.value.getTime()) {
          e.isInRange = true;
        } else {
          e.isInRange = false;
        }
      });
    }
  }

  handleWhenLengthZorro(cell: DateDayCell) {
    cell.isSelectedStartDate = true;
    this.tempRangeDate.push(cell);
  }

  handleWhenLengthOne(cell: DateDayCell) {
    // 点击日期 和 this.tempRangeDate[0] 是同一天
    if (this.tempRangeDate[0].title === cell.title) {
      cell.isSelectedEndDate = true;
      this.tempRangeDate[1] = cell;
    } else if (this.tempRangeDate[0].value.getTime() > cell.value.getTime()) {
      // 点击日期 比 tempRangeDate[0]小
      this.tempRangeDate[0].isSelectedStartDate = false;
      this.tempRangeDate[0].isSelectedEndDate = true;
      cell.isSelectedStartDate = true;
      this.tempRangeDate[1] = cell;
    } else if (this.tempRangeDate[0].value.getTime() < cell.value.getTime()) {
      // 点击日期 比 tempRangeDate[0]大
      this.tempRangeDate[0].isSelectedStartDate = true;
      this.tempRangeDate[0].isSelectedEndDate = false;
      cell.isSelectedEndDate = true;
      this.tempRangeDate[1] = cell;
    }
  }

  handleWhenLengthTwo(cell: DateDayCell) {
    // 点击的日期为 mouseenter 的日期， 则范围选定
    if (!this.rangeSelected && cell.title === this.tempRangeDate[1].title) {
      this.rangeSelected = true;
      if (this.tempRangeDate[0].value.getTime() < this.tempRangeDate[1].value.getTime()) {
        this.rangeDate[0] = this.tempRangeDate[0].value;
        this.rangeDate[1] = this.tempRangeDate[1].value;
      } else {
        this.rangeDate[0] = this.tempRangeDate[1].value;
        this.rangeDate[1] = this.tempRangeDate[0].value;
      }
    } else if (this.rangeSelected) {
      // 重新选择范围
      this.rangeSelected = false;
      this.listOfHzDateMonthComponent.map(month => {
        month.monthCells.forEach(e => {
          e.isInRange = false;
        });
      });
      // 清空 this.tempRangeDate, 放入新cell
      this.tempRangeDate[0].isSelectedStartDate = false;
      this.tempRangeDate[0].isSelectedEndDate = false;
      this.tempRangeDate[1].isSelectedStartDate = false;
      this.tempRangeDate[1].isSelectedEndDate = false;
      this.tempRangeDate = [];
      cell.isSelectedStartDate = true;
      this.tempRangeDate.push(cell);
    }
  }

  handleRangeSelect(cell: DateDayCell) {
    if (!this.tempRangeDate.length) {
      this.handleWhenLengthZorro(cell);
    } else if (this.tempRangeDate.length === 1) {
      // 不移出，连续点两次同一 cell
      if (this.tempRangeDate[0].title === cell.title) {
        this.tempRangeDate[1] = {...cell};
        // this.tempRangeDate[1].value = new Date(new Date(this.tempRangeDate[0].title).getTime() + ONE_DAY_MILLISECOND - 1);
        this.rangeDate[0] = this.tempRangeDate[0].value;
        this.rangeDate[1] = this.tempRangeDate[1].value;
        this.rangeSelected = true;
      }
    } else if (this.tempRangeDate.length === 2) {
      // 这里的cell 可能为左右日期框对应过去的新cell
      // 点击日期 和 this.tempRangeDate[0] 是同一天
      if (this.tempRangeDate[0].title === cell.title) {
        cell.isSelectedEndDate = true;
      } else if (this.tempRangeDate[0].value.getTime() > cell.value.getTime()) {
        // 点击日期 比 tempRangeDate[0]小
        this.tempRangeDate[0].isSelectedStartDate = false;
        this.tempRangeDate[0].isSelectedEndDate = true;
        cell.isSelectedStartDate = true;
        // this.tempRangeDate.unshift(cell);
      } else if (this.tempRangeDate[0].value.getTime() < cell.value.getTime()) {
        // 点击日期 比 tempRangeDate[0]大
        cell.isSelectedEndDate = true;
      }
      this.handleWhenLengthTwo(cell);
    }
  }

  rangeConfirmClick() {
    this.rangeConfirm.emit(this.rangeDate);
  }

  rangeCancelClick() {
    this.rangeCancel.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initData() {
  }

  onCellClick(event: DateDayCell) {

  }
}
