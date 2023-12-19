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
  ftpPsw: string
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
  ftpPsw: "contador7377"
};

export { globalParameters };