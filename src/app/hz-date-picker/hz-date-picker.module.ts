import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HzDatePickerComponent } from './hz-date-picker.component';
import { FormsModule } from '@angular/forms';
import { HzDateCellComponent } from './hz-date-cell/hz-date-cell.component';
import { HzDateMonthComponent } from './hz-date-month/hz-date-month.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { HzDateRangeComponent } from './hz-date-range/hz-date-range.component';



@NgModule({
  declarations: [HzDatePickerComponent, HzDateCellComponent, HzDateMonthComponent, HzDateRangeComponent],
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule
  ],
  exports: [HzDatePickerComponent]
})
export class HzDatePickerModule { }
