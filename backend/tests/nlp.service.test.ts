import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { analyzeFetchedArticles } from "../src/services/nlp.service";
import * as newsService from "../src/services/news.service";
import { Event } from "../src/models/event.model";

// Mock the newsService
jest.mock("../src/services/news.service");

// Define the type for the mocked fetchNewsArticles function
type MockedFetchNewsArticles = jest.Mock<
  ReturnType<typeof newsService.fetchNewsArticles>,
  Parameters<typeof newsService.fetchNewsArticles>
>;

let mongoServer: MongoMemoryServer;

// Setup and teardown of the in-memory MongoDB instance
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Test suite for analyzeFetchedArticles
describe("analyzeFetchedArticles", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch articles and analyze them for racism", async () => {
    const articles = [
      {
        content: "This article discusses racism and discrimination.",
        title: "Racism in Society",
        source: { name: "News Source" },
        url: "http://example.com/racism-in-society",
        publishedAt: "2023-11-11T00:00:00Z",
      },
    ];

    (
      newsService.fetchNewsArticles as MockedFetchNewsArticles
    ).mockResolvedValue(articles);

    const findOneMock = jest.fn();
    const saveMock = jest.fn();

    findOneMock.mockResolvedValue(null);

    // Mock the Event model
    jest.spyOn(Event, "findOne").mockImplementation(findOneMock);
    jest.spyOn(Event.prototype, "save").mockImplementation(saveMock);

    await analyzeFetchedArticles("racism", "2023-11-07", "2023-12-10");

    expect(newsService.fetchNewsArticles).toHaveBeenCalledWith(
      "racism",
      "2023-11-07",
      "2023-12-10"
    );
    expect(findOneMock).toHaveBeenCalledWith({ url: articles[0].url });
    expect(saveMock).toHaveBeenCalled();
  });

  it("should not save an article if it already exists in the database", async () => {
    const articles = [
      {
        content: "This article discusses racism and discrimination.",
        title: "Racism in Society",
        source: { name: "News Source" },
        url: "http://example.com/racism-in-society",
        publishedAt: "2023-11-11T00:00:00Z",
      },
    ];

    (
      newsService.fetchNewsArticles as MockedFetchNewsArticles
    ).mockResolvedValue(articles);

    const findOneMock = jest.fn();
    const saveMock = jest.fn();

    findOneMock.mockResolvedValue(articles[0]);

    // Mock the Event model
    jest.spyOn(Event, "findOne").mockImplementation(findOneMock);
    jest.spyOn(Event.prototype, "save").mockImplementation(saveMock);

    await analyzeFetchedArticles("racism", "2023-11-07", "2023-12-10");

    expect(findOneMock).toHaveBeenCalledWith({ url: articles[0].url });
    expect(saveMock).not.toHaveBeenCalled();
  });

  it("should handle errors during article analysis", async () => {
    const error = new Error("Test error");

    (
      newsService.fetchNewsArticles as MockedFetchNewsArticles
    ).mockRejectedValue(error);

    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation();

    await expect(
      analyzeFetchedArticles("racism", "2023-11-11", "2023-11-11")
    ).rejects.toThrow(error);

    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error in analyzing fetched articles:",
      error
    );
    consoleErrorMock.mockRestore();
  });
});
