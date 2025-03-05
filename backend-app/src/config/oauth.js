import { AnalyticsAdminServiceClient } from "@google-analytics/admin";
// use the data api aswell
import  {BetaAnalyticsDataClient} from '@google-analytics/data';
const client = new AnalyticsAdminServiceClient({
  keyFilename: "./resources/service-account.json",
});


const dataClient = new BetaAnalyticsDataClient({
  keyFilename: "./resources/service-account.json",
});


// do a data
export { client, dataClient };

