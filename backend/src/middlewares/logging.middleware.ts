import { Request, Response, NextFunction } from "express";
import RequestLog from "../models/requestlog.model";

/** Middleware to log all requests to the database. */
export const logRequest = (req: Request, res: Response, next: NextFunction) => {
  const log = new RequestLog({
    endpoint: req.originalUrl,
    method: req.method,
    parameters: req.params,
    requestBody: req.body,
    timestamp: new Date(),
  });

  log
    .save()
    .then(() => next())
    .catch((err) => {
      console.error("Failed to save request log:", err);
      next();
    });
};
