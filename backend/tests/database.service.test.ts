// FILEPATH: /c:/Users/sende/Desktop/projects/PL-Racism-Analysis/backend/src/services/database.service.test.ts
import mongoose from "mongoose";
import { connectToDatabase } from "../src/services/database.service";

jest.mock("mongoose");

describe("connectToDatabase", () => {
  it("should call mongoose.connect with the correct URI", async () => {
    const MONGO_URI = process.env.MONGO_URI;
    mongoose.connect = jest.fn().mockResolvedValue(null); // Mock the connect method

    await connectToDatabase();

    expect(mongoose.connect).toHaveBeenCalledWith(MONGO_URI);
  });

  it("should log an error if mongoose.connect throws an error", async () => {
    const error = new Error("Test error");
    mongoose.connect = jest.fn().mockRejectedValue(error); // Mock the connect method to throw an error
    console.error = jest.fn();

    await connectToDatabase();

    expect(console.error).toHaveBeenCalledWith(
      "Error connecting to MongoDB:",
      error
    );
  });
});
