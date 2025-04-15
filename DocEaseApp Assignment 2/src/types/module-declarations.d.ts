declare module 'react-native-calendars' {
  export interface DayObject {
    dateString: string;
    day: number;
    month: number;
    year: number;
    timestamp: number;
  }

  export interface CalendarListProps {
    current?: string;
    minDate?: string;
    maxDate?: string;
    onDayPress?: (day: DayObject) => void;
    markedDates?: {
      [date: string]: { selected?: boolean; marked?: boolean; selectedColor?: string };
    };
    theme?: {
      selectedDayBackgroundColor?: string;
      todayTextColor?: string;
      arrowColor?: string;
      [key: string]: any;
    };
    horizontal?: boolean;
    pagingEnabled?: boolean;
    calendarWidth?: number;
    style?: any;
  }

  export const CalendarList: React.FC<CalendarListProps>;
}

declare module 'moment' {
  import moment from 'moment';
  export default moment;
  
  interface Moment {
    format(format?: string): string;
    add(amount: number, unit: string): Moment;
    isBefore(date: Moment | string | Date): boolean;
  }
  
  function moment(): Moment;
  function moment(date: string | Date): Moment;
} 