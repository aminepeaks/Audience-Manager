import { AnalyticsAdminServiceClient } from "@google-analytics/admin";

const client = new AnalyticsAdminServiceClient({
  keyFilename: "./resources/service-account.json",
});

export { client };

