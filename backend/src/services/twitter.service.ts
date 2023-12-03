import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";

dotenv.config();

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

export const fetchTweets = async (query: string): Promise<any[]> => {
  const tweets = await twitterClient.v2.search(query, {
    "tweet.fields": ["text"],
  });
  return tweets.data.data;
};
