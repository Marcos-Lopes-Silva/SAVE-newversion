import mongoose, { Document, Model, ObjectId } from "mongoose";
import { IUser, IUserDocument } from "./userModel";
import { string } from "zod";

export interface IOption {
  id: number;
  value: string;
  label: string;
}

export interface IRow {
  id: number;
  text: string;
}

export interface IQuestion {
    id: number,
    title: string,
    name: string,
    type: "text" | "radio" | "checkbox" | "date" | "number" | "select" | "textarea" | "dropdown" | "rating" | 'table',
    options?: Array<IOption>, 
    rows?: Array<IRow>,  // New property for table type
    required: boolean,
    placeholder?: string,
    other?: boolean,
    region?: boolean,
    dependsOn?: string,
    dependsValue?: string,
    dependsOnOptions?: Array<IOption>,
    dependsOnValue?: string,
    dependsOnType?: "radio" | "checkbox" | "select",
}

export interface IPages {
  id: number;
  title: string;
  description: string;
  questions: Array<IQuestion>;
}

export interface ISurvey {
    title: string | "",
    description: string | "",
    author: string | null,
    pages: Array<IPages>,
    openDate: string,
    endDate: string,
    status: "draft" | "active" | "finished",
    responses: number,
    users: number,
    completeMessage: string,
}

export interface ISurveyDocument extends ISurvey, Document {
  createdAt: Date;
  updatedAt: Date;
}

const optionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  value: { type: String, required: true },
  label: { type: String, required: true },
});

const rowSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  text: { type: String, required: true },
});

const questionSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, default: "" },
    type: { type: String, enum: ["text", "radio", "checkbox", "date", "number", "select", "textarea", "rating", "dropdown", "table"], required: true },
    name: { type: String, required: true },
    options: [optionSchema],
    rows: [rowSchema],  // New field for table type
    required: { type: Boolean, required: true, default: false },
    dependsOn: { type: String },
    dependsValue: { type: String },
    dependsOnOptions: [optionSchema],
    dependsOnValue: { type: String },
    dependsOnType: { type: String, enum: ["radio", "checkbox", "select"] },
});

const pageSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    questions: [questionSchema],
});

const surveySchema: mongoose.Schema = new mongoose.Schema<ISurveyDocument>(
  {
    title: {
        type: String,
        default: "",
    },
    description: {
        type: String,
        default: "",        
    },
    author: {
      type: String,
      ref: "User",
      required: true,
    },
    pages: {
        type: [pageSchema],
        required: true,
    },
    openDate: {
        type: String,
        default: new Date().toISOString(),
    },
    endDate: {
        type: String,
        default: new Date().toISOString(),
    },
    status: {
      type: String,
      required: true,
      default: "draft",
    },
    responses: {
      type: Number,
      required: true,
      default: 0,
    },
    users: {
      type: Number,
      required: true,
      default: 0,
    },
    completeMessage: {
        type: String,
        default: "",
    },
}, {
    timestamps: true,
  }
);

const Survey: Model<ISurveyDocument> =
  mongoose.models.Survey ||
  mongoose.model<ISurveyDocument>("Survey", surveySchema);

export default Survey;