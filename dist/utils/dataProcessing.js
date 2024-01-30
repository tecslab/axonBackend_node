"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeCSVFile = exports.getAsyncExcelData = exports.getFormatExcelData = void 0;
const dateFunctions_1 = require("./dateFunctions");
const dataFetcher_1 = require("./dataFetcher");
const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const timeIntervals = ['09H00', '10H00', '11H00', '12H00', '13H00', '14H00', '15H00', '16H00', '17H00', '18H00', '19H00', '20H00', '21H00'];
// fix to use the type
const getFormatExcelData = (timeLine, date) => {
    // Set data in format required by Colineal
    //let excelData = [["DIRECCION_ip", "TIENDA", "ENTRADAS", "SALIDAS", "dia", "mes", "anio", "DIASEM", "hora", "SEMANA", "SOLOHORA", "DIA_SEMANA", "FECHAHORA"]]
    const excelData = [];
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dayOfWeek = date.getDay() + 1;
    let stringDay;
    switch (dayOfWeek) {
        case 1:
            stringDay = "Domingo";
            break;
        case 2:
            stringDay = "Lunes";
            break;
        case 3:
            stringDay = "Martes";
            break;
        case 4:
            stringDay = "Miercoles";
            break;
        case 5:
            stringDay = "Jueves";
            break;
        case 6:
            stringDay = "Viernes";
            break;
        case 7:
            stringDay = "Sábado";
            break;
        default:
            stringDay = "";
    }
    for (const interval of timeIntervals) {
        // filter all register in each hour interval
        const registrosIntervalo = timeLine.filter((registro) => registro["timestamp"].getHours().toString().padStart(2, '0') === interval.substring(0, 2));
        const registrosIn = registrosIntervalo.filter((registro) => registro.type === "PeopleIn");
        const registrosOut = registrosIntervalo.filter((registro) => registro.type === "PeopleOut");
        const countIn = registrosIn.length;
        const countOut = registrosOut.length;
        const rowData = ["192.168.71.14", "Colineal", countIn, countOut, day, month, year, dayOfWeek, interval, "", interval.substring(0, 2), stringDay, `${year}-${month}-${day}`];
        excelData.push(rowData);
    }
    return excelData;
};
exports.getFormatExcelData = getFormatExcelData;
const getAsyncExcelData = ({ initDate, finishDate }) => __awaiter(void 0, void 0, void 0, function* () {
    // Put headers in data
    // Can be used to group data from several days
    // To get data from just one day, initDate and finishData must refer to the same date
    const dateInf = new Date((0, dateFunctions_1.parseDate)(initDate));
    const dateSup = new Date((0, dateFunctions_1.parseDate)(finishDate));
    dateInf.setHours(0, 0, 0, 0); // set to the beginning of the day
    dateSup.setHours(0, 0, 0, 0);
    let excelData = [];
    while (dateInf < dateSup) { // colocar <= si se quiere incluir el dìa superior
        const intervalDate = (0, dateFunctions_1.getIntervalDate)(dateInf);
        const { initDate, finishDate } = intervalDate;
        const result = yield (0, dataFetcher_1.getVisitorsData)({ initDate, finishDate });
        const dayData = (0, exports.getFormatExcelData)(result._countTimeLine, dateInf);
        excelData = [...excelData, ...dayData];
        dateInf.setHours(24); // to forward to the next day
    }
    //excelData = [ headers, ...excelData]
    return excelData;
});
exports.getAsyncExcelData = getAsyncExcelData;
const writeCSVFile = (records) => __awaiter(void 0, void 0, void 0, function* () {
    const headers = ["DIRECCION_ip", "TIENDA", "ENTRADAS", "SALIDAS", "dia", "mes", "anio", "DIASEM", "hora", "SEMANA", "SOLOHORA", "DIA_SEMANA", "FECHAHORA"];
    const filePath = "./visitorsData.csv";
    const csvWriter = createCsvWriter({
        header: headers,
        path: filePath
    });
    yield csvWriter.writeRecords(records) // returns a promise
        .then(() => {
        console.log('...Done');
    });
    // may be the best is just return the  status of the operation
    return filePath;
});
exports.writeCSVFile = writeCSVFile;
