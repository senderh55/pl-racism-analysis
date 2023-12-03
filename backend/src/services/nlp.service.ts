import natural from "natural";
import fs from "fs";
import { removeStopwords, eng } from "stopword";
import { fetchNewsArticles } from "./news.service";
import { Event } from "../models/event.model";

const { SentimentAnalyzer, PorterStemmer, WordTokenizer } = natural;
const tokenizer = new WordTokenizer();
const analyzer = new SentimentAnalyzer("English", PorterStemmer, "afinn");

let keywords: string[] = [];
const KEYWORDS_FILE_PATH = "./keywords.json";
const DEFAULT_KEYWORDS = [
  "racism",
  "racial",
  "discrimination",
  "bigotry",
  "prejudice",
  "bias",
  "xenophobia",
  "stereotype",
  "inequality",
  "hate speech",
  "racial profiling",
  "ethnic slur",
  "hate crime",
  "segregation",
  "supremacy",
  "nationalism",
  "intolerance",
  "anti-semitism",
];

export const loadKeywords = (): void => {
  if (fs.existsSync(KEYWORDS_FILE_PATH)) {
    try {
      const data = fs.readFileSync(KEYWORDS_FILE_PATH, "utf8");
      keywords = JSON.parse(data);
      console.log("Keywords successfully loaded from file.");
    } catch (error) {
      console.error("Error loading keywords from file:", error);
      keywords = [...KEYWORDS_FILE_PATH];
    }
  } else {
    keywords = [...KEYWORDS_FILE_PATH];
  }
};

export const setKeywords = (newKeywords: string[]): void => {
  keywords = [...newKeywords];
  fs.writeFileSync("./keywords.json", JSON.stringify(newKeywords));
  console.log("Keywords saved to file.");
};

export const initializeKeywords = (): void => {
  loadKeywords();
};

// FIX UNTIL HERE

const analyzeTextForRacism = (text: string): boolean => {
  const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
  console.log("Tokens:", tokens);

  const filteredTokens = removeStopwords(tokens, eng);

  const containsRacismKeywords = filteredTokens.some((token) =>
    keywords.includes(token)
  );
  const sentimentScore = analyzer.getSentiment(filteredTokens);
  console.log("Sentiment score:", sentimentScore);
  console.log("Contains racism keywords:", containsRacismKeywords);

  return containsRacismKeywords && sentimentScore < 0;
};

export const analyzeFetchedArticles = async (
  query: string,
  fromDate: string,
  toDate: string
): Promise<void> => {
  try {
    const articles = await fetchNewsArticles(query, fromDate, toDate);

    for (const article of articles) {
      const content = article.content || article.description || "";
      if (!content) continue; // Skip articles without content (e.g. images)
      const isRacist = analyzeTextForRacism(content);
      const tokens = tokenizer.tokenize(content.toLowerCase()) || [];
      const sentimentScore = isRacist ? analyzer.getSentiment(tokens) : 0;

      if (isRacist) {
        const { title, source, url, publishedAt } = article;
        const newEvent = new Event({
          title,
          source: source.name,
          url,
          sentimentScore,
          date: new Date(publishedAt),
        });

        await newEvent.save();
        console.log(`Article titled "${article.title}" analyzed and saved.`);
      }
    }
  } catch (error) {
    console.error("Error in analyzing fetched articles:", error);
    throw error;
  }
};
