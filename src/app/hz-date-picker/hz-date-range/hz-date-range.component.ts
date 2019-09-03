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
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class HzDateRangeComponent implements OnInit, AfterViewInit, OnDestroy {
  tempRangeDate: DateDayCell[] = []; // 无序的
  destroy$ = new Subject();
  rangeSelected = false;
  modalType: 0 | 1;
  @Input() rangeDate: Date[] = [];
  @Input() placeholder: Array<string>;
  @Input() format: string;
  @Input() showTime = true;
  @Output() rangeConfirm = new EventEmitter<Date[]>();
  @Output() rangeCancel = new EventEmitter();
  @ViewChildren(HzDateMonthComponent) listOfHzDateMonthComponent: QueryList<HzDateMonthComponent>;
  @ViewChild('LDMComponent', {static: false}) LDMComponent: HzDateMonthComponent;
  @ViewChild('RDMComponent', {static: false}) RDMComponent: HzDateMonthComponent;

  constructor(
    private cdf: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    console.log('HzDateRangeComponent');

    this.cdf.detectChanges();
  }

  ngAfterViewInit(): void {
    console.log(this.LDMComponent, this.RDMComponent);
    console.log('listOfHzDateMonthComponent:', this.listOfHzDateMonthComponent);
    this.changModalType();
    // 左侧日期框点击
    const leftDMCChange$ = this.LDMComponent.listOfDateCellComponent.changes;
    leftDMCChange$.pipe(startWith(true), takeUntil(this.destroy$)).subscribe(() => {
      console.log('leftDMCChange$');
      this.isCellInRange(1);
      const leftDMCClick$ = merge(...this.LDMComponent.listOfDateCellComponent.map(cell => cell.click$));
      leftDMCClick$.pipe(
        takeUntil(leftDMCChange$.pipe(take(1)))
      ).subscribe(cell => {
        console.log('leftDMCClick$', cell);
        const compare = this.compareDateComp();
        // 点击下一月的日期
        if (cell.isNextMonth) {
          // 右侧日期框为左侧的下一个月
          if (compare === 1) {
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
          // 左侧日期框为右侧的下一个月
          if (compare === -1) {
            const sameCell = this.RDMComponent.monthCells.find(e => e.title === cell.title);
            this.handleRangeSelect(sameCell);
          } else {
            // 点击上一个月
            this.LDMComponent.changeMonth(false);
            // 切换月份后找到所点击的日期
            const sameCell = this.LDMComponent.monthCells.find(e => e.title === cell.title);
            this.handleRangeSelect(sameCell);
            this.isCellInRange(1);
          }
        } else {
          this.handleRangeSelect(cell);
        }
      });

      // 左侧组件mouseenter
      const LeftDMCMouseEnter$ = merge(...this.LDMComponent.listOfDateCellComponent.map(cell => cell.mouseenter$));
      LeftDMCMouseEnter$.pipe(
        filter(e => this.tempRangeDate.length > 0 && !this.rangeSelected),
        takeUntil(leftDMCChange$.pipe(take(1)))
      ).subscribe(cell => {
        // 清空上次选择的 cell 状态
        if (this.tempRangeDate[1]) {
          this.tempRangeDate[1].isSelectedEndDate = false;
          this.tempRangeDate[1].isSelectedStartDate = false;
        }
        const compare = this.compareDateComp();
        if (compare === 1 && cell.isNextMonth) {
          const sameCell = this.RDMComponent.monthCells.find(e => e.title === cell.title);
          this.handleWhenLengthOne(sameCell);
        } else if (compare === -1 && cell.isLastMonth) {
          const sameCell = this.RDMComponent.monthCells.find(e => e.title === cell.title);
          this.handleWhenLengthOne(sameCell);
        } else {
          this.handleWhenLengthOne(cell);
        }
        this.isCellInRange(0);
      });
    });

    // 右侧日期框点击
    const RightDMCChange$ = this.RDMComponent.listOfDateCellComponent.changes;
    RightDMCChange$.pipe(startWith(true), takeUntil(this.destroy$)).subscribe(() => {
      console.log('RightDMCChange$');
      this.isCellInRange(2);
      // 右侧组件click
      const RightDMCClick$ = merge(...this.RDMComponent.listOfDateCellComponent.map(cell => cell.click$));
      RightDMCClick$.pipe(
        takeUntil(RightDMCChange$.pipe(take(1)))
      ).subscribe(cell => {
        console.log('RightDMCClick$', cell);
        const compare = this.compareDateComp();
        // 点击上一月的日期
        if (cell.isLastMonth) {
          // 左侧日期框为右侧的上一个月
          if (compare === 1) {
            // 左侧选中右侧点击的日期
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
          // 左侧日期框为右侧的下一个月
          if (compare === -1) {
            const sameCell = this.LDMComponent.monthCells.find(e => e.title === cell.title);
            this.handleRangeSelect(sameCell);
          } else {
            // 点击下一个月
            this.RDMComponent.changeMonth(true);
            // 切换月份后找到所点击的日期
            const sameCell = this.RDMComponent.monthCells.find(e => e.title === cell.title);
            this.handleRangeSelect(sameCell);
            this.isCellInRange(2);
          }
        } else {
          this.handleRangeSelect(cell);
        }
      });
      // 右侧组件mouseenter
      const RightDMCMouseEnter$ = merge(...this.RDMComponent.listOfDateCellComponent.map(cell => cell.mouseenter$));
      RightDMCMouseEnter$.pipe(
        filter(e => this.tempRangeDate.length > 0 && !this.rangeSelected),
        takeUntil(RightDMCChange$.pipe(take(1)))
      ).subscribe(cell => {
        // 清空上次选择的 cell 状态
        if (this.tempRangeDate[1]) {
          this.tempRangeDate[1].isSelectedEndDate = false;
          this.tempRangeDate[1].isSelectedStartDate = false;
        }
        const compare = this.compareDateComp();
        if (compare === 1 && cell.isLastMonth) {
          const sameCell = this.LDMComponent.monthCells.find(e => e.title === cell.title);
          this.handleWhenLengthOne(sameCell);
        } else if (compare === -1 && cell.isNextMonth) {
          const sameCell = this.LDMComponent.monthCells.find(e => e.title === cell.title);
          this.handleWhenLengthOne(sameCell);
        } else {
          this.handleWhenLengthOne(cell);
        }
        this.isCellInRange(0);
      });
    });
    // const cellListChange$ = merge(...this.listOfHzDateMonthComponent.map(month => month.listOfDateCellComponent.changes));
    // cellListChange$.pipe(
    //   startWith(true),
    //   takeUntil(this.destroy$)
    // ).subscribe(() => {
    //   // console.log('cellListChange$');
    //   // // cell 点击事件
    //   // const rangeCellClick$ = merge(...this.listOfHzDateMonthComponent.map(month => merge(...month.listOfDateCellComponent.map(cell => cell.click$))));
    //   // rangeCellClick$.pipe(
    //   //   takeUntil(cellListChange$.pipe(take(1)))
    //   // ).subscribe(cell => {
    //   //   console.log(cell);
    //   //   this.handleRangeSelect(cell);
    //   // });
    //   // cell mouseenter事件
    //   const rangeCellMouseEnter$ = merge(...this.listOfHzDateMonthComponent.map(month => merge(...month.listOfDateCellComponent.map(cell => cell.mouseenter$))));
    //   rangeCellMouseEnter$.pipe(
    //     filter(e => this.tempRangeDate.length > 0 && !this.rangeSelected),
    //     takeUntil(cellListChange$.pipe(take(1)))
    //   ).subscribe(cell => {
    //     // if (cell.isLastMonth || cell.isNextMonth) {
    //     //   return;
    //     // }
    //     // 清空上次选择的 cell 状态
    //     if (this.tempRangeDate[1]) {
    //       this.tempRangeDate[1].isSelectedEndDate = false;
    //       this.tempRangeDate[1].isSelectedStartDate = false;
    //     }
    //     const compare = this.compareDateComp();
    //     if (compare === 1 || compare === -1) {
    //       const sameCell = this.RDMComponent.monthCells.find(e => e.title === cell.title);
    //       const sameCell1 = this.LDMComponent.monthCells.find(e => e.title === cell.title);
    //       if (cell.isNextMonth && sameCell) {
    //         this.handleWhenLengthOne(sameCell);
    //       } else if (cell.isLastMonth && sameCell1) {
    //         this.handleWhenLengthOne(sameCell1);
    //       } else {
    //         this.handleWhenLengthOne(cell);
    //       }
    //     } else {
    //       this.handleWhenLengthOne(cell);
    //     }
    //     this.isCellInRange(0);
    //   });
    // });
  }

  // 判定 isInRange， 仅left(1), 仅right（2), 全部（0）
  isCellInRange(num: number) {
    if (this.tempRangeDate.length !== 2) {
      return;
    }
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
    if (num === 0 || num === 1) {
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
    this.cdf.detectChanges();
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
    this.cdf.detectChanges();
  }

  handleWhenLengthTwo(cell: DateDayCell) {
    // 点击的日期为 mouseenter 的日期， 则范围选定
    if (!this.rangeSelected && cell.title === this.tempRangeDate[1].title) {
      this.rangeSelected = true;
      if (this.tempRangeDate[0].value.getTime() < this.tempRangeDate[1].value.getTime()) {
        this.rangeDate[0] = this.tempRangeDate[0].value;
        this.rangeDate[1] = this.tempRangeDate[1].value;
        this.rangeDate[1] = new Date(this.rangeDate[1].getTime());
      } else {
        this.rangeDate[0] = this.tempRangeDate[1].value;
        this.rangeDate[1] = this.tempRangeDate[0].value;
        this.rangeDate[1] = new Date(this.rangeDate[1].getTime());
      }
      // 判断是不是同一月
      const isSame = this.isSameMonth(this.tempRangeDate[0].value, this.tempRangeDate[1].value);
      if (isSame) {
        // 当选择日期为同一个月, 左侧变为这一个月，右侧为左侧下一个月
        if (this.LDMComponent.curYear !== this.rangeDate[0].getFullYear() || this.LDMComponent.curMonth !== this.rangeDate[0].getMonth() + 1) {
          this.LDMComponent.curMonth = this.rangeDate[0].getMonth() + 1;
          this.LDMComponent.curYear = this.rangeDate[0].getFullYear();
          this.LDMComponent.makeMonthCells();
          const startCell = this.LDMComponent.monthCells.find(e => e.value.getTime() === this.rangeDate[0].getTime());
          const endCell = this.LDMComponent.monthCells.find(e => e.value.getTime() === this.rangeDate[1].getTime());
          startCell.isSelectedStartDate = true;
          endCell.isSelectedEndDate = true;
          this.tempRangeDate[0] = startCell;
          this.tempRangeDate[1] = endCell;
          this.isCellInRange(1);
        }
        this.RDMComponent.curMonth = this.tempRangeDate[0].value.getMonth() + 1;
        this.RDMComponent.curYear = this.tempRangeDate[0].value.getFullYear();
        this.RDMComponent.changeMonth(true);
        this.RDMComponent.makeMonthCells();
      } else {
        // 当选择日期不为同一个月, 左侧变为开始月，右侧变为结束月
        this.LDMComponent.curMonth = this.rangeDate[0].getMonth() + 1;
        this.LDMComponent.curYear = this.rangeDate[0].getFullYear();
        this.LDMComponent.makeMonthCells();
        const startCell = this.LDMComponent.monthCells.find(e => e.value.getTime() === this.rangeDate[0].getTime());
        startCell.isSelectedStartDate = true;
        this.tempRangeDate[0] = startCell;
        this.RDMComponent.curMonth = this.rangeDate[1].getMonth() + 1;
        this.RDMComponent.curYear = this.rangeDate[1].getFullYear();
        this.RDMComponent.makeMonthCells();
        const endCell = this.RDMComponent.monthCells.find(e => e.value.getTime() === this.rangeDate[1].getTime());
        endCell.isSelectedEndDate = true;
        this.tempRangeDate[1] = endCell;
        this.isCellInRange(0);
        // // 当选择日期不为同一个月, 左侧变为开始月，右侧变为结束月
        // if (this.LDMComponent.curYear !== this.rangeDate[0].getFullYear() || this.LDMComponent.curMonth !== this.rangeDate[0].getMonth() + 1) {
        //   this.LDMComponent.curMonth = this.rangeDate[0].getMonth() + 1;
        //   this.LDMComponent.curYear = this.rangeDate[0].getFullYear();
        //   this.LDMComponent.makeMonthCells();
        //   const startCell = this.LDMComponent.monthCells.find(e => e.value.getTime() === this.rangeDate[0].getTime());
        //   startCell.isSelectedStartDate = true;
        //   this.tempRangeDate[0] = startCell;
        // }
        // // 当左大时，下面表达式不相等
        // if (this.RDMComponent.curYear !== this.rangeDate[1].getFullYear() || this.RDMComponent.curMonth !== this.rangeDate[1].getMonth() + 1) {
        //   this.RDMComponent.curMonth = this.rangeDate[1].getMonth() + 1;
        //   this.RDMComponent.curYear = this.rangeDate[1].getFullYear();
        //   this.RDMComponent.makeMonthCells();
        //   const endCell = this.LDMComponent.monthCells.find(e => e.value.getTime() === this.rangeDate[1].getTime());
        //   endCell.isSelectedEndDate = true;
        //   this.tempRangeDate[1] = endCell;
        //   console.log('test');
        // } else {
        //   this.tempRangeDate[1] = cell;
        // }
        // this.isCellInRange(0);
      }
      this.cdf.detectChanges();
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

  changModalType() {
    if (this.modalType) {
      this.modalType = 0;
    } else {
      this.modalType = 1;
      if (this.rangeDate[0] && this.rangeDate[1]) {
        if (this.isSameMonth(this.rangeDate[0], this.rangeDate[1])) {
          this.LDMComponent.curMonth = this.rangeDate[0].getMonth() + 1;
          this.LDMComponent.curYear = this.rangeDate[0].getFullYear();
          this.LDMComponent.rangeEnd = true;
          this.LDMComponent.makeMonthCells();
          this.RDMComponent.curMonth = this.rangeDate[0].getMonth() + 1;
          this.RDMComponent.curYear = this.rangeDate[0].getFullYear();
          this.RDMComponent.changeMonth(true);
          this.RDMComponent.makeMonthCells();
          this.tempRangeDate[0] = this.LDMComponent.rangeStartCell;
          this.tempRangeDate[1] = this.LDMComponent.rangeEndCell;
          this.LDMComponent.rangeEnd = false;
        } else {
          this.LDMComponent.curMonth = this.rangeDate[0].getMonth() + 1;
          this.LDMComponent.curYear = this.rangeDate[0].getFullYear();
          this.LDMComponent.makeMonthCells();
          this.RDMComponent.curMonth = this.rangeDate[1].getMonth() + 1;
          this.RDMComponent.curYear = this.rangeDate[1].getFullYear();
          this.RDMComponent.makeMonthCells();
          this.tempRangeDate[0] = this.LDMComponent.rangeStartCell;
          this.tempRangeDate[1] = this.RDMComponent.rangeEndCell;
        }
        this.isCellInRange(0);
        this.rangeSelected = true;
      } else {
        this.LDMComponent.curMonth = new Date().getMonth() + 1;
        this.LDMComponent.curYear = new Date().getFullYear();
        this.LDMComponent.makeMonthCells();
        this.RDMComponent.curMonth = new Date().getMonth() + 1;
        this.RDMComponent.curYear = new Date().getFullYear();
        this.RDMComponent.changeMonth(true);
        this.RDMComponent.makeMonthCells();
      }
      this.cdf.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 判断大小, 0 表示相等, 大于0 表示右大， 小于0表示左大, 其中绝对值为1，表示相邻; -1 表示相邻且左大; 1 表示相邻且右大，
  compareDateComp(): number {
    return (this.RDMComponent.curYear * 12 + this.RDMComponent.curMonth - this.LDMComponent.curYear * 12 - this.LDMComponent.curMonth);
  }

  // onStartTimeClick(date: Date) {
  //   this.rangeDate[0] = date;
  // }
  //
  // onEndTimeClick(date: Date) {
  //   this.rangeDate[1] = date;
  // }

  // 判断是否在同一个月
  isSameMonth(date1: Date, date2: Date) {
    return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  }
}
