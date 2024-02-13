const ftp = require("basic-ftp");
import { globalParameters } from "./globalParameters";
const { ftpAddress, ftpUser, ftpPsw } = globalParameters

interface FtpConfig {
  host: string,
  port: number,
  user: string,
  password: string
}

const ftpConfig : FtpConfig = {
  host: ftpAddress,
  port: 21,
  user: ftpUser,
  password: ftpPsw
}

const client = new ftp.Client();
//client.ftp.verbose = true; // For debug

export const sendFile = async (filePath: string, remoteDirPath: string) => {
  try {
    if (!client.accessed) {
      // Connect to the server only if the client has not been accessed before
      console.log("Conectando...");
      await client.access(ftpConfig);
    }

    await client.uploadFrom(filePath, remoteDirPath)
      .then(() => closeFTPConnection());
    //await client.downloadTo(".downloads.csv", "./public_html/uploads/visitorsData.csv");
  } catch (err : any) {
    throw new Error(err);
  }
};

const closeFTPConnection = async () => {
  try {
    await client.close();
    console.log("Connection closed.");
  } catch (err) {
    console.log(err);
  }
};