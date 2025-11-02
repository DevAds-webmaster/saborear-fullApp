import { Schema, model, Document } from "mongoose";

export interface IMacros extends Document {
  key: string;
  data: any;
  createdAt: Date;
}

export const macrosSchema = new Schema<IMacros>({
  key: { type: String, required: true, unique: true, trim: true },
  data: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default model<IMacros>("Macros", macrosSchema);


