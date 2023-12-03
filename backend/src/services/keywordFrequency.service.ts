// Importing necessary modules
import fs from "fs";
import natural from "natural";
import stopwords from "stopword";

// Initializing the tokenizer
const tokenizer = new natural.WordTokenizer();

// Function to extract and analyze keywords from a dataset
export const extractKeywordsFromDataset = (
  datasetPath: string
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    // Reading the dataset file
    fs.readFile(datasetPath, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      // Parsing the dataset assuming it's in JSON format
      const articles = JSON.parse(data);
      let wordFrequency: Record<string, number> = {};

      // Processing each article
      articles.forEach((article: { content: string | null }) => {
        if (article.content) {
          // Tokenizing and filtering the content
          const tokens = tokenizer.tokenize(article.content.toLowerCase());
          if (!tokens) return;
          const filteredTokens = stopwords.removeStopwords(tokens);

          // Counting word frequencies
          filteredTokens.forEach((token) => {
            wordFrequency[token] = (wordFrequency[token] || 0) + 1;
          });
        }
      });

      // Sorting words by frequency in descending order
      const sortedWords = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0]);

      resolve(sortedWords);
    });
  });
};
