import { startScheduler } from "../src/services/scheduling.service";
import { analyzeFetchedArticles } from "../src/services/nlp.service";
import schedule from "node-schedule";

jest.mock("node-schedule", () => ({
  scheduleJob: jest.fn(),
}));
jest.mock("../src/services/nlp.service");

describe("startScheduler", () => {
  it("should schedule a job with the correct interval", async () => {
    const scheduleJobMock = schedule.scheduleJob as jest.Mock;
    const analysisInterval = "*/2 * * * *";

    await startScheduler();

    expect(scheduleJobMock).toHaveBeenCalledWith(
      analysisInterval,
      expect.any(Function)
    );
  });

  it("should call analyzeFetchedArticles when the job is run", async () => {
    const scheduleJobMock = schedule.scheduleJob as jest.Mock;
    const analyzeFetchedArticlesMock = analyzeFetchedArticles as jest.Mock;

    await startScheduler();

    const jobFunction = scheduleJobMock.mock.calls[0][1];
    await jobFunction();

    expect(analyzeFetchedArticlesMock).toHaveBeenCalledWith(
      "racism in the Premier League",
      "2023-11-07",
      expect.any(String)
    );
  });

  it("should handle errors", async () => {
    const scheduleJobMock = schedule.scheduleJob as jest.Mock;
    const analyzeFetchedArticlesMock = analyzeFetchedArticles as jest.Mock;
    const error = new Error("Test error");
    analyzeFetchedArticlesMock.mockRejectedValue(error);
    console.error = jest.fn();

    await startScheduler();

    const jobFunction = scheduleJobMock.mock.calls[0][1];
    await jobFunction();

    expect(console.error).toHaveBeenCalledWith(
      "Error in scheduled job:",
      error
    );
  });
});
