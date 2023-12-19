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
exports.getVisitorsData = void 0;
const globalParameters_1 = require("./globalParameters");
const dateFunctions_1 = require("./dateFunctions");
const { axxonOneServer, axxonOnePort, prefix, user, password, vEntranceCamera, detectionStartTime, detectionFinishTime } = globalParameters_1.globalParameters;
function getPeopleIn({ initDate, finishDate }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const baseURI = `http://${axxonOneServer}:${axxonOnePort}${prefix}`;
            const uriPeopleIn = `${baseURI}archive/events/detectors${vEntranceCamera}${initDate}/${finishDate}?type=PeopleIn&limit=1200`;
            const headers = new Headers();
            headers.set('Authorization', `Basic ${btoa(user + ':' + password)}`);
            const rawData = yield fetch(uriPeopleIn, { headers });
            const jsonData = yield rawData.json();
            return jsonData;
        }
        catch (error) {
            console.error("Error in fetch PeopleIn: ", error);
            throw error; // Re-throw the error to handle it in the calling code
        }
    });
}
function getPeopleOut({ initDate, finishDate }) {
    const baseURI = "http://" + axxonOneServer + ":" + axxonOnePort + prefix;
    const uriPeopleOut = baseURI + 'archive/events/detectors' + vEntranceCamera + initDate + "/" + finishDate + "?type=PeopleOut&limit=1200";
    const headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa(user + ':' + password));
    //console.log(uriPeopleOut)
    return fetch(uriPeopleOut, { headers })
        .then(res => res.json())
        .catch(e => {
        console.log('Error fetch en la ruta: /archive/events/detectors PeopleOut');
        console.log(e);
        throw e;
    });
}
function mergeInTimeLine(eventsArray1, eventsArray2) {
    // merge 2 array of events in one ordered Time line array
    let eventsTimeLine = [];
    let indexEvents1 = 0;
    let indexEvents2 = 0;
    let condition = (indexEvents1 < eventsArray1.length) && (indexEvents2 < eventsArray2.length);
    if (condition) {
        while (condition) {
            const nextEvent1 = eventsArray1[indexEvents1];
            const nextEvent2 = eventsArray2[indexEvents2];
            const inLower = nextEvent1.timestamp < nextEvent2.timestamp ? true : false;
            if (inLower) {
                eventsTimeLine.push(nextEvent1);
                indexEvents1++;
                if (indexEvents1 >= eventsArray1.length) {
                    condition = false;
                    eventsTimeLine.push(...eventsArray2.slice(indexEvents2));
                }
            }
            else {
                eventsTimeLine.push(nextEvent2);
                indexEvents2++;
                if (indexEvents2 >= eventsArray2.length) {
                    condition = false;
                    eventsTimeLine.push(...eventsArray1.slice(indexEvents1));
                }
            }
        }
    }
    else {
        eventsTimeLine = [...eventsArray1, ...eventsArray2];
    }
    return eventsTimeLine;
}
function getVisitorsTimeLine(eventsTimeline) {
    const visitorsTimeLine = [{ hora: detectionStartTime.substring(0, 2), visitors: 0 }];
    for (let i = 0; i < eventsTimeline.length; i++) {
        const hora = eventsTimeline[i]["timestamp"].getHours().toString().padStart(2, '0'); // para tomar solo la hora
        let currentVisitorsCount = visitorsTimeLine[visitorsTimeLine.length - 1]["visitors"]; // última cuenta de visitantes
        eventsTimeline[i].type === "PeopleIn" ? currentVisitorsCount++ : currentVisitorsCount--;
        visitorsTimeLine.push({ hora: hora, visitors: currentVisitorsCount });
    }
    return visitorsTimeLine;
}
const getVisitorsData = ({ initDate, finishDate }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dataPeopleIn = yield getPeopleIn({ initDate, finishDate });
        const peopleIn = (0, dateFunctions_1.dataToStdFormat)(dataPeopleIn.events);
        const dataPeopleOut = yield getPeopleOut({ initDate, finishDate });
        const peopleOut = (0, dateFunctions_1.dataToStdFormat)(dataPeopleOut.events);
        const _countTimeLine = mergeInTimeLine(peopleIn, peopleOut);
        const visitorsTimeLine = getVisitorsTimeLine(_countTimeLine);
        return { peopleIn, peopleOut, _countTimeLine, visitorsTimeLine };
    }
    catch (error) {
        console.log("Error capturing data:", error);
        return { peopleIn: [], peopleOut: [], _countTimeLine: [], visitorsTimeLine: [] };
    }
});
exports.getVisitorsData = getVisitorsData;
/* async function fetchData() {
  const url = "http://test.com"; // Replace with your actual URL
  const response = await fetch(url);

  if (response.ok) {
    const data = await response.json();
    console.log("Data fetched successfully:", data);
    // Process or store the data as needed
  } else {
    console.error("Failed to fetch data. Status:", response.status);
  }
} */
// Function to schedule data fetching every day at 23:00
/* const scheduleDataFetching = async (): Promise<any> => {
  const now = new Date();
  const targetTime = new Date( now.getFullYear(), now.getMonth(), now.getDate(), 23, 0, 0, 0 );
  let delay = targetTime.getTime() - now.getTime();
  delay = delay < 0 ? 24 * 60 * 60 * 1000 - delay: delay;

  const intervalDate = getIntervalDate(now)
  const {initDate, finishDate} = intervalDate

  // Calculate the time until the next 23:00

  // Schedule the data fetching at 23:00 every day
  setTimeout(() => {
      setInterval(()=> {

        let result = await getVisitorsData({ initDate, finishDate })

      }, 24*60*60*1000)
    }, delay);
} */
// Start scheduling data fetching
//scheduleDataFetching();
