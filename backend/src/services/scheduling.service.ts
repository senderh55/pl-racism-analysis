import schedule from "node-schedule";
import { analyzeFetchedArticles } from "./nlp.service";

export const startScheduler = async () => {
  const analysisInterval = process.env.ANALYSIS_INTERVAL || "*/2 * * * *"; // Every two minutes

  schedule.scheduleJob(analysisInterval, async () => {
    try {
      // Simply call the function without expecting a return value
      await analyzeFetchedArticles(
        "Racial Abuse in Premier League",
        "2023-11-11",
        new Date().toISOString()
      );

      console.log("Articles analysis and saving completed.");
    } catch (error) {
      console.error("Error in scheduled job:", error);
    }
  });
};
