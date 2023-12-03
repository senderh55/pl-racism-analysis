import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: String,
  source: String,
  url: String,
  sentimentScore: Number,
  date: Date,
});

export const Event = mongoose.model("Event", eventSchema);
