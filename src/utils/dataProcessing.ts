import { getIntervalDate, parseDate } from "./dateFunctions";
import { getVisitorsData } from "./dataFetcher";
const createCsvWriter = require('csv-writer').createArrayCsvWriter;
import { DateRange } from "./commonInterfaces";

const timeIntervals = ['09H00', '10H00', '11H00', '12H00', '13H00', '14H00', '15H00', '16H00', '17H00', '18H00', '19H00', '20H00', '21H00']

type ExcelRow = [ string, string, number | string, number | string, string, string, string, string | number, string, string, string, string, string];
// fix to use the type

export const getFormatExcelData = (timeLine: any, date: Date): ExcelRow[] => {
  // Set data in format required by Colineal
  //let excelData = [["DIRECCION_ip", "TIENDA", "ENTRADAS", "SALIDAS", "dia", "mes", "anio", "DIASEM", "hora", "SEMANA", "SOLOHORA", "DIA_SEMANA", "FECHAHORA"]]
  const excelData = []
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const dayOfWeek = date.getDay() + 1

  let stringDay;
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

    const rowData: ExcelRow = ["192.168.71.14", "Colineal", countIn, countOut, day, month, year, dayOfWeek, interval, "", interval.substring(0, 2), stringDay, `${year}-${month}-${day}`]
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
    
    const result = await getVisitorsData({ initDate, finishDate })
    const dayData: ExcelRow[] = getFormatExcelData(result._countTimeLine, dateInf)
    excelData = [...excelData, ...dayData]
    dateInf.setHours(24) // to forward to the next day
  }
  //excelData = [ headers, ...excelData]
  return excelData
}



export const writeCSVFile = async (records: ExcelRow[]): Promise<any> =>{
  const headers : ExcelRow = ["DIRECCION_ip", "TIENDA", "ENTRADAS", "SALIDAS", "dia", "mes", "anio", "DIASEM", "hora", "SEMANA", "SOLOHORA", "DIA_SEMANA", "FECHAHORA"]
  const filePath : String = "./visitorsData.csv"

  const csvWriter = createCsvWriter({
    header: headers,
    path: filePath
  });

  await csvWriter.writeRecords(records)       // returns a promise
    .then(() => {
        console.log('...Done');
    });

  // may be the best is just return the  status of the operation
  return filePath
}