import { Schema, model, Document } from "mongoose";


export interface IParameters {
    name: string;
    config: {
      enableMod: boolean;
      imageMod?: string;
      titleMod: string;
      descriptionMod?:string;
      codePromMod?:string;
      featuredTextMod?: string;
      featuredTextColorMod?: string;
    };
  }

export const parametersSchema = new Schema<IParameters>({
    name: { type: String, required: true },
    config: {
      enableMod: { type: Boolean, required: true },
      imageMod: String,
      titleMod: { type: String, required: true },
      descriptionMod: String,
      codePromMod: String,
      featuredTextMod: String,
      featuredTextColorMod: String
    }
  });

export default model<IParameters>("Parameters", parametersSchema);