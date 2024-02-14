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

export interface EventWrapper{
  body: any,
  subject: string,
  subjects: string[],
  eventType: string,
  localization: any
}

export interface EventDBRecord {
  type: number,
  subjects: string[],
  timestamp: Date,
  event: EventWrapper,
  ts_vector: string
}