import { getIntervalDate, parseDate } from "./dateFunctions";
import { getVisitorsData } from "./dataFetcher";
const createCsvWriter = require('csv-writer').createArrayCsvWriter;
import { DateRange, VisitorsData, FaceDataReport, EventData, EventDBRecord } from "./commonInterfaces";
import { globalParameters } from "./globalParameters";
import { processFaceData, getIntervalDateCustom, queryFacesEventsByDateRange } from "./facesDataFunctions";
const { timeIntervals, utc } = globalParameters;

type ExcelRow = [ string, 
                  string, 
                  number | string, 
                  number | string, 
                  string, 
                  string, 
                  string, 
                  string | number,
                  string, 
                  string, 
                  string, 
                  string, 
                  string,
                  string | number,
                  string | number,
                  string | number,
                  string | number,
                  string | number,
                  string | number,
                  string | number,
                  string | number,
                  string | number,
                  string | number,
                  string | number,
                  string | number,
                ];

const headers : ExcelRow = [
                  "DIRECCION_ip", 
                  "TIENDA", 
                  "ENTRADAS", 
                  "SALIDAS", 
                  "dia", 
                  "mes", 
                  "anio", 
                  "DIASEM", 
                  "hora", 
                  "SEMANA", 
                  "SOLOHORA", 
                  "DIA_SEMANA", 
                  "FECHAHORA",
                  "Hombres",
                  "Mujeres",
                  "0-15 anios",
                  "15-20 anios",
                  "20-30 anios",
                  "30-35 anios",
                  "35-40 anios",
                  "40-45 anios",
                  "45-50 anios",
                  "50-55 anios",
                  "55-60 anios",
                  "60+ anios",
                  ]
// fix to use the type

export const getFormatExcelData = (timeLine: EventData[], facesEvents : EventDBRecord[], date: Date): ExcelRow[] => {
  // Set data in format required by Colineal
  //let excelData = [["DIRECCION_ip", "TIENDA", "ENTRADAS", "SALIDAS", "dia", "mes", "anio", "DIASEM", "hora", "SEMANA", "SOLOHORA", "DIA_SEMANA", "FECHAHORA"]]
  const excelData : ExcelRow[]= []
  const year : string = date.getFullYear().toString();
  const month : string = (date.getMonth() + 1).toString().padStart(2, '0');
  const day : string = date.getDate().toString().padStart(2, '0');
  const dayOfWeek : number = date.getDay() + 1

  let stringDay : string;
  switch (dayOfWeek) {
    case 1:
      stringDay = "Domingo"
      break;
    case 2:
      stringDay = "Lunes"
      break;
    case 3:
      stringDay = "Martes"
      break;
    case 4:
      stringDay = "Miercoles"
      break;
    case 5:
      stringDay = "Jueves"
      break;
    case 6:
      stringDay = "Viernes"
      break;
    case 7:
      stringDay = "Sábado"
      break;
    default:
      stringDay = ""
  }

  for (const interval of timeIntervals) {
    // filter all register in each hour interval
    const registrosIntervalo = timeLine.filter( (registro: any ) => registro["timestamp"].getHours().toString().padStart(2, '0') === interval.substring(0, 2))
    const registrosIn = registrosIntervalo.filter((registro: any ) => registro.type === "PeopleIn")
    const registrosOut = registrosIntervalo.filter((registro: any ) => registro.type === "PeopleOut")

    const countIn = registrosIn.length
    const countOut = registrosOut.length

    let intervalFaceEvents : EventDBRecord[] = facesEvents.filter((faceEvent) => (new Date(faceEvent.timestamp)).getHours() + utc === Number(interval.slice(0,2)))
    const faceDataReport : FaceDataReport = processFaceData(intervalFaceEvents);
    // here

    const rowData: ExcelRow = [
                              "192.168.71.14", 
                              "Colineal", 
                              countIn, 
                              countOut, 
                              day, 
                              month, 
                              year, 
                              dayOfWeek, 
                              interval, 
                              "", 
                              interval.substring(0, 2), 
                              stringDay, 
                              `${year}-${month}-${day}`,
                              faceDataReport.countHombres,
                              faceDataReport.countMujeres,
                              faceDataReport.ageIntervals[0].count,
                              faceDataReport.ageIntervals[1].count,
                              faceDataReport.ageIntervals[2].count,
                              faceDataReport.ageIntervals[3].count,
                              faceDataReport.ageIntervals[4].count,
                              faceDataReport.ageIntervals[5].count,
                              faceDataReport.ageIntervals[6].count,
                              faceDataReport.ageIntervals[7].count,
                              faceDataReport.ageIntervals[8].count,
                              faceDataReport.ageIntervals[9].count
                            ]
    excelData.push(rowData)
  }
  return excelData
}

export const getAsyncExcelData = async ({initDate, finishDate}: DateRange): Promise<ExcelRow[]> =>{
  // Put headers in data
  // Can be used to group data from several days
  // To get data from just one day, initDate and finishData must refer to the same date
  const dateInf = new Date(parseDate(initDate))
  const dateSup = new Date(parseDate(finishDate))
  dateInf.setHours(0, 0, 0, 0) // set to the beginning of the day
  dateSup.setHours(0, 0, 0, 0)
  
  let excelData: ExcelRow[] = []

  while (dateInf < dateSup) { // colocar <= si se quiere incluir el dìa superior
    const intervalDate = getIntervalDate(dateInf)
    const { initDate, finishDate } = intervalDate    
    const visitorsData : VisitorsData = await getVisitorsData({ initDate, finishDate })

    const intervalDateForFaces = getIntervalDateCustom(dateInf);
    const { _initDate, _finishDate } = intervalDateForFaces;
    const facesEvents : EventDBRecord[] = await queryFacesEventsByDateRange(_initDate, _finishDate)
    
    const dayData: ExcelRow[] = getFormatExcelData(visitorsData._countTimeLine, facesEvents, dateInf)
    excelData = [...excelData, ...dayData]
    dateInf.setHours(24) // to forward to the next day
  }
  //excelData = [ headers, ...excelData]
  return excelData
}

export const writeCSVFile = async (records: ExcelRow[]): Promise<any> =>{  
  const filePath : String = "./visitorsData.csv"

  const csvWriter = createCsvWriter({
    header: headers,
    path: filePath
  });

  await csvWriter.writeRecords(records)  // returns a promise
    .then(() => {
      console.log('...Done');
    }).catch((err : any) => { throw new Error(err) });
}

export const createVisitorsFile = async () => {
  const now = new Date();
  //const now = new Date("2024-01-25 12:00:00")
  const intervalDate : DateRange = getIntervalDate(now)
  const {initDate, finishDate} = intervalDate
  
  const excelData = await getAsyncExcelData({initDate, finishDate});
  await writeCSVFile(excelData)
}