const dotenv = require("dotenv");
import mongoose from "mongoose";
import RequestLogModel from "../models/requestlog.model";

const MONGO_URI = process.env.MONGO_URI || "your_default_mongo_uri";

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export const logRequest = async (request: object) => {
  const requestLog = new RequestLogModel(request);
  await requestLog.save();
};
