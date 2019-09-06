export interface DateDayCell {
  value: Date;
  title: string;
  isSelected?: boolean;
  isToday?: boolean;
  isDisabled?: boolean;
  isSelectedStartDate?: boolean;
  isSelectedEndDate?: boolean;
  isInRange?: boolean;
  isLastMonth?: boolean;
  isNextMonth?: boolean;
}

export interface RecentYearCell {
  value: number;
  isLast: boolean;
  isNext: boolean;
}
