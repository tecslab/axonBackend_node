import { globalParameters } from "./globalParameters";
import { DateRange } from "./commonInterfaces";
const { utc, detectionStartTime, detectionFinishTime } = globalParameters

export function dataToStdFormat(eventsArray: any[]): any[] {

  eventsArray.forEach(_event => {
    _event.timestamp = UTCTransform({ type: "toCurrentUTC", date: parseDate(_event.timestamp) })
  })

  return eventsArray;
}

interface DateToTransform {
  // meta dates are defined by the type and the date
  type: 'toUTC0' | 'toCurrentUTC';
  date: Date
}

export const UTCTransform = ({type, date}: DateToTransform): Date =>{
  // utc is the number of utc time zone
  let newDate: number | undefined;
  if (type==="toUTC0"){
    newDate = date.getTime() + (-utc * 60 * 60 * 1000);
  }else if(type==="toCurrentUTC"){
    newDate = date.getTime() + (utc * 60 * 60 * 1000);
  }
  return new Date(newDate?? 0);
}

export const parseDate = (dateString: string): Date =>{
  // convert "YYYYMMDDThhmmss" to date
  const year = parseInt(dateString.substring(0, 4), 10);
  const month = parseInt(dateString.substring(4, 6), 10) - 1;
  const day = parseInt(dateString.substring(6, 8), 10);
  const hours = parseInt(dateString.substring(9, 11), 10);
  const minutes = parseInt(dateString.substring(11, 13), 10);
  const seconds = parseInt(dateString.substring(13, 15), 10);  
  return new Date(year, month, day, hours, minutes, seconds);
}

export const dateInFormat = (date: Date): string => {
  // convert date to "YYYYMMDDThhmmss" string
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  const formattedDate = `${year}${month}${day}T${hours}${minutes}${seconds}`;
  return formattedDate;
};

export const getIntervalDate = (date: Date): DateRange => {
  // returns the day interval between the processing will be done
  // receives date On user UTC and transform it to UTC0
  const _initDate = new Date(date)
  _initDate.setHours(Number(detectionStartTime.substring(0, 2)))
  _initDate.setMinutes(Number(detectionStartTime.substring(2, 4)))
  const initDate = dateInFormat(UTCTransform({ type: "toUTC0", date: _initDate }))

  const _finishDate = new Date(date)
  _finishDate.setHours(Number(detectionFinishTime.substring(0, 2)))
  _finishDate.setMinutes(Number(detectionFinishTime.substring(2, 4)))
  const finishDate = dateInFormat(UTCTransform({ type: "toUTC0", date: _finishDate }))

  return { initDate, finishDate }
}