"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIntervalDate = exports.dateInFormat = exports.parseDate = exports.UTCTransform = exports.dataToStdFormat = void 0;
const globalParameters_1 = require("./globalParameters");
const { utc, detectionStartTime, detectionFinishTime } = globalParameters_1.globalParameters;
function dataToStdFormat(eventsArray) {
    eventsArray.forEach(_event => {
        _event.timestamp = (0, exports.UTCTransform)({ type: "toCurrentUTC", date: (0, exports.parseDate)(_event.timestamp) });
    });
    return eventsArray;
}
exports.dataToStdFormat = dataToStdFormat;
const UTCTransform = ({ type, date }) => {
    // utc is the number of utc time zone
    let newDate;
    if (type === "toUTC0") {
        newDate = date.getTime() + (-utc * 60 * 60 * 1000);
    }
    else if (type === "toCurrentUTC") {
        newDate = date.getTime() + (utc * 60 * 60 * 1000);
    }
    return new Date(newDate !== null && newDate !== void 0 ? newDate : 0);
};
exports.UTCTransform = UTCTransform;
const parseDate = (dateString) => {
    // convert "YYYYMMDDThhmmss" to date
    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10) - 1;
    const day = parseInt(dateString.substring(6, 8), 10);
    const hours = parseInt(dateString.substring(9, 11), 10);
    const minutes = parseInt(dateString.substring(11, 13), 10);
    const seconds = parseInt(dateString.substring(13, 15), 10);
    return new Date(year, month, day, hours, minutes, seconds);
};
exports.parseDate = parseDate;
const dateInFormat = (date) => {
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
exports.dateInFormat = dateInFormat;
const getIntervalDate = (date) => {
    // returns the day interval between the processing will be done
    // receives date On user UTC and transform it to UTC0
    const _initDate = new Date(date);
    _initDate.setHours(Number(detectionStartTime.substring(0, 2)));
    _initDate.setMinutes(Number(detectionStartTime.substring(2, 4)));
    const initDate = (0, exports.dateInFormat)((0, exports.UTCTransform)({ type: "toUTC0", date: _initDate }));
    const _finishDate = new Date(date);
    _finishDate.setHours(Number(detectionFinishTime.substring(0, 2)));
    _finishDate.setMinutes(Number(detectionFinishTime.substring(2, 4)));
    const finishDate = (0, exports.dateInFormat)((0, exports.UTCTransform)({ type: "toUTC0", date: _finishDate }));
    return { initDate, finishDate };
};
exports.getIntervalDate = getIntervalDate;
