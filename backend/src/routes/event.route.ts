import express from "express";
import { Event } from "../models/event.model";

const router = express.Router();

router.get("/racist-events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data" });
  }
});

export default router;
