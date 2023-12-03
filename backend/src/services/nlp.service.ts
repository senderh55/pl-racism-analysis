// nlp.service.ts
import natural from "natural";
import fs from "fs";
import stopwords from "stopword";
import { fetchNewsArticles } from "./news.service";

const { SentimentAnalyzer, PorterStemmer, WordTokenizer } = natural;
const tokenizer = new WordTokenizer();
const analyzer = new SentimentAnalyzer("English", PorterStemmer, "afinn");

let keywords: string[] = [];

export const setKeywords = (newKeywords: string[]) => {
  keywords = newKeywords;
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

export const analyzeFetchedArticlesAndExtractKeywords = async (
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
    // Save these keywords to a file or database for future use
    fs.writeFileSync("./keywords.json", JSON.stringify(extractedKeywords));

    // Set keywords for ongoing analysis
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
): Promise<any[]> => {
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
