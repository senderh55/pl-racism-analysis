// File: src/__tests__/nlp.service.test.ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { analyzeFetchedArticles } from "../src/services/nlp.service";
import * as newsService from "../src/services/news.service";
import { Event } from "../src/models/event.model";

// Mock the newsService
jest.mock("../src/services/news.service");
type MockedFetchNewsArticles = jest.Mock<
  ReturnType<typeof newsService.fetchNewsArticles>,
  Parameters<typeof newsService.fetchNewsArticles>
>;
// Define the type for the mocked fetchNewsArticles function
// Define the type for the mocked Event model
type MockedEventModel = {
  findOne: jest.Mock<any, any>;
  save: jest.Mock<any, any>;
  // Other mock methods or properties as needed
};

jest.mock("../src/models/event.model", () => {
  const mockEventModel: MockedEventModel = {
    findOne: jest.fn(),
    save: jest.fn(),
    // Other mock methods or properties as needed
  };

  return {
    Event: mockEventModel,
  };
});

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

    (Event.findOne as jest.Mock).mockResolvedValue(null);

    await analyzeFetchedArticles("racism", "2023-11-07", "2023-12-10");

    expect(newsService.fetchNewsArticles).toHaveBeenCalledWith(
      "racism",
      "2023-11-07",
      "2023-12-10"
    );
    expect(Event.findOne).toHaveBeenCalledWith({ url: articles[0].url });
    expect(new Event().save).toHaveBeenCalled();
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

    const { Event } = require("../src/models/event.model");
    Event.findOne.mockResolvedValue(articles[0]);

    await analyzeFetchedArticles("racism", "2023-11-07", "2023-12-10");

    expect(Event.findOne).toHaveBeenCalledWith({ url: articles[0].url });
    expect(new Event().save).not.toHaveBeenCalled();
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

    expect(console.error).toHaveBeenCalledWith(
      "Error in analyzing fetched articles:",
      error
    );
    consoleErrorMock.mockRestore();
  });
});
