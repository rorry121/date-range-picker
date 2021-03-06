import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HzDatePickerComponent } from './hz-date-picker.component';
import { FormsModule } from '@angular/forms';
import { HzDateCellComponent } from './hz-date-cell/hz-date-cell.component';
import { HzDateMonthComponent } from './hz-date-month/hz-date-month.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { HzDateRangeComponent } from './hz-date-range/hz-date-range.component';
import { HzTimePickerComponent } from './hz-time-picker/hz-time-picker.component';
import { HzTimePickerSelectComponent } from './hz-time-picker-select/hz-time-picker-select.component';
import { HzYearMonthSelectComponent } from './hz-year-month-select/hz-year-month-select.component';


@NgModule({
  declarations: [
    HzDatePickerComponent,
    HzDateCellComponent,
    HzDateMonthComponent,
    HzDateRangeComponent,
    HzTimePickerComponent,
    HzTimePickerSelectComponent,
    HzYearMonthSelectComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule
  ],
  exports: [HzDatePickerComponent, HzTimePickerComponent, HzYearMonthSelectComponent]
})
export class HzDatePickerModule {
}
