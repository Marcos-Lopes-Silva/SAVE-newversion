import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface ProcessedQuestionData {
  data: Array<{
    name?: string;
    value?: number;
    row?: string;
    options?: Array<{ name: string; value: number }>;   
  }>;
  otherTexts?: string[];
}

export interface SurveyQuestion {
  title: string
  name: string
  type: string
  processedData: ProcessedQuestionData
  isPublic: boolean
  chart?: string
}

export interface SurveyPage {
  title: string
  questions: Array<SurveyQuestion>
}

export interface ISurveyAnalytics {
  surveyId: mongoose.Types.ObjectId;
  surveyTitle: string;
  hasPublic: boolean;
  surveyDescription: string;
  pages: Array<SurveyPage>;
  openDate: String;
  endDate: String;
}

export interface ISurveyAnalyticsDocument extends ISurveyAnalytics, Document {}

const processedQuestionDataSchema = new Schema(
  {
    data: [
      {
        name: { type: String },
        value: { type: Number },
        row: { type: String },
        options: [
          {
            name: { type: String, required: true },
            value: { type: Number, required: true }
          }
        ]
      },
    ],
    otherTexts: { type: [String], default: [] }
  },
  { _id: false },
);

const surveyQuestionSchema = new Schema(
  {
    title: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    processedData: { type: processedQuestionDataSchema, required: true },
    isPublic: { type: Boolean, required: true },
    chart: { type: String, required: true },
  },
  { _id: false },
)

const surveyPageSchema = new Schema(
  {
    title: { type: String, required: true },
    questions: [surveyQuestionSchema],
  },
  { _id: false },
)

const surveyAnalyticsSchema = new Schema<ISurveyAnalyticsDocument>(
  {
    surveyId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'Survey'
    },
    surveyTitle: { type: String, required: true },
    surveyDescription: { type: String, required: true },
    pages: [surveyPageSchema],
    openDate: { type: String, required: true },
    endDate: { type: String, required: true },
    hasPublic: { type: Boolean, required: true },
  },
  { timestamps: true },
)

const SurveyAnalytics: Model<ISurveyAnalyticsDocument> =
  mongoose.models.SurveyAnalytics || mongoose.model("SurveyAnalytics", surveyAnalyticsSchema)

export default SurveyAnalytics