interface GlobalParameters {
  axxonOneServer: string;
  axxonOnePort: string;
  prefix: string;
  user: string;
  password: string;
  utc: number;
  detectionStartTime: string;
  detectionFinishTime: string;
  vEntranceCamera: string;
  ftpAddress: string,
  ftpUser: string,
  ftpPsw: string,
  timeIntervals: string[]
}
  
const globalParameters: GlobalParameters = {
  axxonOneServer: "192.168.2.43",
  axxonOnePort: "82",
  prefix: "/",
  user: "root",
  password: "root",
  utc: -5,
  detectionStartTime: "0900",
  detectionFinishTime: "2100",
  vEntranceCamera: "/SVRCAMARAS/DeviceIpint.2/SourceEndpoint.video:0:0/",
  ftpAddress: "box.colinealcorp.com",
  ftpUser: "contadorpersonas",
  ftpPsw: "contador7377",
  timeIntervals: ['09H00', '10H00', '11H00', '12H00', '13H00', '14H00', '15H00', '16H00', '17H00', '18H00', '19H00', '20H00', '21H00']
};

export { globalParameters };