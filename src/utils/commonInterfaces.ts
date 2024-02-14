export interface DateRange {
  initDate: string;
  finishDate: string;
}

export interface EventsDto{
  events: {timestamp: string, type: string} []
}

export interface EventData {
  timestamp: Date,
  type: string
}