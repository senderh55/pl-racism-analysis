import express from "express";

import dotenv from "dotenv";
import cors from "cors";

import eventRoute from "./routes/event.route";
import { startScheduler } from "./services/scheduling.service";
import { connectToDatabase } from "./services/database.service";
import { rateLimit } from "express-rate-limit";
import { logRequest } from "./middlewares/logging.middleware";
import { initializeKeywords } from "./services/nlp.service";

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many requests, please try again later.",
});

dotenv.config();
connectToDatabase();
startScheduler();
initializeKeywords();

const app = express();
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use(logRequest);

app.use("/api", eventRoute);

export default app;
