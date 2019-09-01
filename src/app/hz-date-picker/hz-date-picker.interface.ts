
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

export interface DateWeekRows {
  isCurrent?: boolean; // Is the week that today stays in
  isActive?: boolean; // Is the week that current setting date stays in
  weekNum?: number;
  year?: number;
  classMap?: object;
  dateCells: DateDayCell[];
}
