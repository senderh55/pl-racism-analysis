// FILEPATH: /c:/Users/sende/Desktop/projects/PL-Racism-Analysis/backend/src/services/nlp.service.test.ts
import { analyzeFetchedArticles } from "../src/services/nlp.service";
import { fetchNewsArticles } from "../src/services/news.service";

// Define mock functions
const mockFindOne = jest.fn();
mockFindOne.mockResolvedValue({});
const mockSave = jest.fn();

jest.mock("../src/services/news.service");

// Mock the Event model
jest.doMock("../src/models/event.model", () => {
  return {
    Event: function () {
      return { save: mockSave };
    },
    findOne: mockFindOne,
  };
});

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
    (fetchNewsArticles as jest.Mock).mockResolvedValue(articles);
    mockFindOne.mockResolvedValue(null);

    await analyzeFetchedArticles("racism", "2023-11-07", "2023-12-10");

    expect(fetchNewsArticles).toHaveBeenCalledWith(
      "racism",
      "2023-11-07",
      "2023-12-10"
    );
    expect(mockFindOne).toHaveBeenCalledWith({ url: articles[0].url });
    expect(mockSave).toHaveBeenCalled();
  }, 5000); // Increased timeout

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
    (fetchNewsArticles as jest.Mock).mockResolvedValue(articles);
    mockFindOne.mockResolvedValue(articles[0]);

    await analyzeFetchedArticles("racism", "2023-11-07", "2023-12-10");

    expect(mockFindOne).toHaveBeenCalledWith({ url: articles[0].url });
    expect(mockSave).not.toHaveBeenCalled();
  }, 5000); // Increased timeout

  it("should handle errors during article analysis", async () => {
    const error = new Error("Test error");
    (fetchNewsArticles as jest.Mock).mockRejectedValue(error);
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
