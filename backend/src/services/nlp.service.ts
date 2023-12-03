// nlp.service.ts
import natural from "natural";
import fs from "fs";
import stopwords from "stopword";
import { fetchNewsArticles } from "./news.service";

const { SentimentAnalyzer, PorterStemmer, WordTokenizer } = natural;
const tokenizer = new WordTokenizer();
const analyzer = new SentimentAnalyzer("English", PorterStemmer, "afinn");

let keywords: string[] = [];

export const loadKeywords = () => {
  try {
    const data = fs.readFileSync("./keywords.json", "utf8");
    keywords = JSON.parse(data);
    console.log("Keywords successfully loaded from file.");
  } catch (error) {
    console.error("Error loading keywords from file:", error);
  }
};

export const setKeywords = (newKeywords: string[]) => {
  keywords = newKeywords;
  fs.writeFileSync("./keywords.json", JSON.stringify(newKeywords));
  console.log("Keywords saved to file.");
};

export const analyzeTextForRacism = (text: string): boolean => {
  const tokens = tokenizer.tokenize(text);
  if (!tokens) {
    return false;
  }

  const sentimentScore = analyzer.getSentiment(tokens);
  const containsKeywords = tokens.some((token) =>
    keywords.includes(token.toLowerCase())
  );

  return sentimentScore < 0 && containsKeywords;
};

export const extractKeywordsFromArticles = (articles: any[]): string[] => {
  let wordFrequency: Record<string, number> = {};

  articles.forEach((article) => {
    const content = article.content || "";
    const tokens = tokenizer.tokenize(content.toLowerCase());
    const filteredTokens = stopwords.removeStopwords(tokens || []);

    filteredTokens.forEach((token) => {
      wordFrequency[token] = (wordFrequency[token] || 0) + 1;
    });
  });

  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0]);

  return sortedWords;
};

export const createDataset = async (
  query: string,
  fromDate: string,
  toDate: string
): Promise<void> => {
  try {
    const articles = await fetchNewsArticles(query, fromDate, toDate);
    const potentiallyRacistArticles = articles.filter((article) =>
      analyzeTextForRacism(article.content || article.description || "")
    );

    // Extract keywords from the identified articles
    const extractedKeywords = extractKeywordsFromArticles(
      potentiallyRacistArticles
    );
    setKeywords(extractedKeywords);
  } catch (error) {
    console.error("Error in analyzing fetched articles:", error);
    throw error;
  }
};

export const analyzeFetchedArticles = async (
  query: string,
  fromDate: string,
  toDate: string
): Promise<string[]> => {
  try {
    const articles = await fetchNewsArticles(query, fromDate, toDate);
    return articles.filter((article) =>
      analyzeTextForRacism(article.content || article.description || "")
    );
  } catch (error) {
    console.error("Error in analyzing fetched articles:", error);
    throw error;
  }
};

export const initializeKeywords = async () => {
  if (fs.existsSync("./keywords.json")) {
    loadKeywords();
  } else {
    await createDataset("Premier League racism", "2023-11-03", "2023-12-02");
  }
};
