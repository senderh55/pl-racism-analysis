// news.service.ts
import axios from "axios";

const API_KEY = "YOUR_API_KEY"; // Replace with your NewsAPI key
const BASE_URL = "https://newsapi.org/v2/everything";

export const fetchNewsArticles = async (
  query: string,
  fromDate: string,
  toDate: string
): Promise<any[]> => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: query,
        from: fromDate,
        to: toDate,
        apiKey: API_KEY,
        language: "en", // Assuming you want articles in English
      },
    });

    return response.data.articles;
  } catch (error) {
    console.error("Error fetching news articles:", error);
    throw error;
  }
};
