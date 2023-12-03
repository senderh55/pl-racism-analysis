import natural from "natural";
import fs from "fs";
import { removeStopwords, eng } from "stopword";
import { fetchNewsArticles } from "./news.service";
import { Event } from "../models/event.model";

const { SentimentAnalyzer, PorterStemmer, WordTokenizer } = natural;
const tokenizer = new WordTokenizer();
const analyzer = new SentimentAnalyzer("English", PorterStemmer, "afinn");

let keywords: string[] = [];

const defaultRacismRelatedTerms = [
  "racism",
  "discrimination",
  "bigotry",
  "prejudice",
  "bias",
];

export const loadKeywords = (): void => {
  if (fs.existsSync("./keywords.json")) {
    try {
      const data = fs.readFileSync("./keywords.json", "utf8");
      keywords = JSON.parse(data);
      console.log("Keywords successfully loaded from file.");
    } catch (error) {
      console.error("Error loading keywords from file:", error);
      keywords = [...defaultRacismRelatedTerms];
    }
  } else {
    keywords = [...defaultRacismRelatedTerms];
  }
};

export const setKeywords = (newKeywords: string[]): void => {
  keywords = [...newKeywords];
  fs.writeFileSync("./keywords.json", JSON.stringify(newKeywords));
  console.log("Keywords saved to file.");
};

export const analyzeTextForRacism = (text: string): boolean => {
  const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
  console.log("Tokens:", tokens);

  const filteredTokens = removeStopwords(tokens, eng);

  const containsRacismKeywords = filteredTokens.some((token) =>
    keywords.includes(token)
  );
  const sentimentScore = analyzer.getSentiment(filteredTokens);
  console.log("Sentiment score:", sentimentScore);
  console.log("Contains racism keywords:", containsRacismKeywords);
  // Example logic
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
        const newEvent = new Event({
          title: article.title,
          content: content,
          source: article.source.name,
          sentimentScore: sentimentScore,
          date: new Date(article.publishedAt),
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
export const initializeKeywords = (): void => {
  loadKeywords();
};
