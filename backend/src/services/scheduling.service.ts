// scheduling.service.ts
const schedule = require("node-schedule");

import { createDataset } from "./nlp.service"; // Updated function name

export const startScheduler = async () => {
  // Perform initial keyword extraction and setup
  await createDataset("Premier League racism", "2022-01-01", "2022-12-31");

  const analysisInterval = process.env.ANALYSIS_INTERVAL || "0 0 1 * *"; // Example: First day of every month
  schedule.scheduleJob(analysisInterval, async () => {
    try {
      // Add logic here to fetch new articles, analyze them, and update the dataset
    } catch (error) {
      console.error(error);
    }
  });
};
