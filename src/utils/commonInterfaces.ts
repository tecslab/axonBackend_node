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

export interface VisitorsData {
  peopleIn: EventData[]; 
  peopleOut: EventData[]; 
  _countTimeLine: EventData[]; // merge in and out data in one timeline
  visitorsTimeLine: VisitorsPerHour[];
}

export interface VisitorsPerHour{
  hora: string,
  visitors: number
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

export interface FaceEventResult{
  age: number,
  gender: string,
  beginTime: string,
  bestQuality: number,
  temperature: {
    unit: string,
    value: number
  }
}

export interface FaceDataReport {
  countHombres: number,
  countMujeres: number,
  ageIntervals: AgeIntervalCount[]
}

export interface AgeIntervalCount{
  start: number,
  end: number,
  count: number,
  backgroundColor: String
}