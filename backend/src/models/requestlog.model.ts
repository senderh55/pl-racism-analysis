import mongoose, { Schema, Document } from "mongoose";

export interface IRequestLog extends Document {
  endpoint: string;
  method: string;
  parameters: object;
  requestBody: object;
  timestamp: Date;
}

const requestLogSchema: Schema = new Schema({
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  parameters: { type: Object, required: false },
  requestBody: { type: Object, required: false },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IRequestLog>("RequestLog", requestLogSchema);
