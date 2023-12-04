import mongoose, { Schema } from "mongoose";

const requestLogSchema: Schema = new Schema({
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  parameters: { type: Object, required: false },
  requestBody: { type: Object, required: false },
  timestamp: { type: Date, default: Date.now },
});
const RequestLogModel = mongoose.model("RequestLog", requestLogSchema);
export default RequestLogModel;
