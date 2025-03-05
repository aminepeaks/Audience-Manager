import { client, dataClient } from "../config/oauth.js";
import fs from 'fs';

export const runReport = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Validate required fields
    console.log(propertyId);


    // Run the report
    const response = await dataClient.runReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: "audienceName" }],
      metrics: [{ name: "activeUsers"},],
      dateRanges: [{ startDate: "2025-01-01", endDate: "2025-01-15" }]
    });

    res.json(response);
  } catch (error) {
    console.error('Error running report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}