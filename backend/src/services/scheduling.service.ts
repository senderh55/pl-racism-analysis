// scheduling.service.ts
const schedule = require("node-schedule");

export const startScheduler = async () => {
  const analysisInterval = process.env.ANALYSIS_INTERVAL || "0 0 1 * *"; // Example: First day of every month
  schedule.scheduleJob(analysisInterval, async () => {
    try {
      // Add logic here to fetch new articles, analyze them, and update the dataset
    } catch (error) {
      console.error(error);
    }
  });
};
