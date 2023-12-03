import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: String,
  content: String,
  source: String,
  sentimentScore: Number,
  date: Date,
});

export const Event = mongoose.model("Event", eventSchema);
