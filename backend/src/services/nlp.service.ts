import natural from "natural";
import fs from "fs";
import { removeStopwords, eng } from "stopword";
import { fetchNewsArticles } from "./news.service";
import { Event } from "../models/event.model";

// Natural Language Processing Setup
const { SentimentAnalyzer, PorterStemmer, WordTokenizer } = natural;
const tokenizer = new WordTokenizer();
const analyzer = new SentimentAnalyzer("English", PorterStemmer, "afinn");

// Keywords Management
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
let keywords = [...DEFAULT_KEYWORDS];

export const loadKeywords = (): void => {
  try {
    if (fs.existsSync(KEYWORDS_FILE_PATH)) {
      const data = fs.readFileSync(KEYWORDS_FILE_PATH, "utf8");
      keywords = JSON.parse(data);
      console.log("Keywords successfully loaded from file.");
    } else {
      console.log("Default keywords are loaded.");
    }
  } catch (error) {
    console.error("Error while loading keywords:", error);
  }
};

// Text Analysis for Racism
const analyzeTextForRacism = (text: string): boolean => {
  if (!text) return false;

  const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
  // Remove duplicate tokens
  const uniqueTokens = [...new Set(tokens)];
  console.log("Unique Tokens:", uniqueTokens);

  const filteredTokens = removeStopwords(uniqueTokens, eng);
  const containsRacismKeywords = filteredTokens.some((token) =>
    keywords.includes(token)
  );
  const sentimentScore = analyzer.getSentiment(filteredTokens);
  console.log("Sentiment score:", sentimentScore);
  console.log("Contains racism keywords:", containsRacismKeywords);

  return containsRacismKeywords && sentimentScore < 0;
};

// Analyzing Fetched Articles
export const analyzeFetchedArticles = async (
  query: string,
  fromDate: string,
  toDate: string
): Promise<void> => {
  try {
    const articles = await fetchNewsArticles(query, fromDate, toDate);

    for (const article of articles) {
      const content = article.content || article.description || "";
      if (!content) continue;

      const isRacist = analyzeTextForRacism(content);
      const tokens = tokenizer.tokenize(content.toLowerCase()) || [];
      const sentimentScore = isRacist ? analyzer.getSentiment(tokens) : 0;
      if (isRacist) {
        const { title, source, url, publishedAt } = article;

        const existingEvent = await Event.findOne({ url });
        // If the event doesn't exist, save the new one
        if (!existingEvent) {
          const newEvent = new Event({
            title,
            source: source.name,
            url,
            sentimentScore, // Assuming sentimentScore is defined elsewhere in your code
            date: new Date(publishedAt),
          });

          await newEvent.save();
          console.log(`Article titled "${title}" analyzed and saved.`);
        } else {
          console.log(
            `Article titled "${title}" already exists in the database.`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error in analyzing fetched articles:", error);
    throw error;
  }
};
