import { globalParameters } from "./globalParameters";
import { dataToStdFormat } from "./dateFunctions";
import { DateRange, EventData, EventsDto, VisitorsData, VisitorsPerHour } from "./commonInterfaces";

const {axxonOneServer, axxonOnePort, prefix, user,
password, vEntranceCamera, detectionStartTime } = globalParameters



async function getPeopleIn({ initDate, finishDate }: DateRange): Promise<EventsDto> {
  try {
    const baseURI = `http://${axxonOneServer}:${axxonOnePort}${prefix}`;
    const uriPeopleIn = `${baseURI}archive/events/detectors${vEntranceCamera}${initDate}/${finishDate}?type=PeopleIn&limit=1200`;

    const headers = new Headers();
    headers.set('Authorization', `Basic ${btoa(user + ':' + password)}`);

    const rawData = await fetch(uriPeopleIn, { headers });
    const eventsDto = await rawData.json();

    return eventsDto;
  } catch (error) {
    console.error("Error in fetch PeopleIn: ", error);
    throw error; // Re-throw the error to handle it in the calling code
  }
}
  
function getPeopleOut({initDate, finishDate}: DateRange) : Promise<EventsDto>{
  const baseURI = "http://" + axxonOneServer + ":" + axxonOnePort + prefix
  const uriPeopleOut = baseURI + 'archive/events/detectors' + vEntranceCamera + initDate + "/" + finishDate + "?type=PeopleOut&limit=1200"
  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + btoa(user + ':' + password));

  return fetch(uriPeopleOut, {headers})
    .then(res => res.json())
    .catch(e => {
      console.log('Error fetch en la ruta: /archive/events/detectors PeopleOut');
      console.log(e)
      throw e
    })
}
    
function mergeInTimeLine(eventsArray1: EventData[], eventsArray2: EventData[]): EventData[] {
  // merge 2 array of events in one ordered Time line array
  let eventsTimeLine : EventData[] = []
  let indexEvents1 = 0
  let indexEvents2 = 0
  let condition = (0 < eventsArray1.length) && (0 < eventsArray2.length)
  if (condition) {
    while (condition) {
      const nextEvent1 = eventsArray1[indexEvents1]
      const nextEvent2 = eventsArray2[indexEvents2]
      const inLower = nextEvent1.timestamp < nextEvent2.timestamp ? true : false;

      if (inLower) {
        eventsTimeLine.push(nextEvent1)
        indexEvents1++
        if (indexEvents1 >= eventsArray1.length) {
          condition = false
          eventsTimeLine.push(...eventsArray2.slice(indexEvents2))
        }
      } else {
        eventsTimeLine.push(nextEvent2)
        indexEvents2++
        if (indexEvents2 >= eventsArray2.length) {
          condition = false
          eventsTimeLine.push(...eventsArray1.slice(indexEvents1))
        }
      }
    }
  } else {
    eventsTimeLine = [...eventsArray1, ...eventsArray2]
  }
  return eventsTimeLine
}
  
function getVisitorsTimeLine(eventsTimeline: EventData[]): VisitorsPerHour[] {
  const visitorsTimeLine : VisitorsPerHour[]= [{ hora: detectionStartTime.substring(0, 2), visitors: 0 }]
  for (let i = 0; i < eventsTimeline.length; i++) {
    const hora = eventsTimeline[i]["timestamp"].getHours().toString().padStart(2, '0'); // para tomar solo la hora
    let currentVisitorsCount = visitorsTimeLine[visitorsTimeLine.length - 1]["visitors"] // última cuenta de visitantes
    eventsTimeline[i].type === "PeopleIn" ? currentVisitorsCount++ : currentVisitorsCount--
    visitorsTimeLine.push({ hora: hora, visitors: currentVisitorsCount })
  }
  return visitorsTimeLine
}

export const getVisitorsData = async ({ initDate, finishDate }: DateRange): Promise<VisitorsData> => {
  try {
    const dataPeopleIn : EventsDto = await getPeopleIn({ initDate, finishDate });
    const peopleIn : EventData[]= dataToStdFormat(dataPeopleIn.events);

    const dataPeopleOut : EventsDto = await getPeopleOut({ initDate, finishDate });
    const peopleOut : EventData[]= dataToStdFormat(dataPeopleOut.events);

    const _countTimeLine : EventData[] = mergeInTimeLine(peopleIn, peopleOut);
    const visitorsTimeLine = getVisitorsTimeLine(_countTimeLine);

    return { peopleIn, peopleOut, _countTimeLine, visitorsTimeLine };
  } catch (error) {
    console.error("Error capturing data:", error);
    return { peopleIn: [], peopleOut: [], _countTimeLine: [], visitorsTimeLine: [] };
  }
};

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
  
  // Start scheduling data fetching
  //scheduleDataFetching();