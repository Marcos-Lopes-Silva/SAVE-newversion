import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface ProcessedQuestionData {
  type: string
  data: Array<{ name: string; value: number }>
}

export interface SurveyQuestion {
  title: string
  name: string
  type: string
  processedData: ProcessedQuestionData
}

export interface SurveyDimension {
  title: string
  questions: Array<SurveyQuestion>
}

export interface ISurveyAnalytics {
  surveyId: mongoose.Types.ObjectId;
  surveyTitle: string;
  dimensions: Array<SurveyDimension>;
}

export interface ISurveyAnalyticsDocument extends ISurveyAnalytics, Document {}

const processedQuestionDataSchema = new Schema(
  {
    type: { type: String, required: true },
    data: [
      {
        name: { type: String, required: true },
        value: { type: Number, required: true },
      },
    ],
  },
  { _id: false },
)

const surveyQuestionSchema = new Schema(
  {
    title: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    processedData: { type: processedQuestionDataSchema, required: true },
  },
  { _id: false },
)

const surveyDimensionSchema = new Schema(
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
    dimensions: [surveyDimensionSchema],
  },
  { timestamps: true },
)

const SurveyAnalytics: Model<ISurveyAnalyticsDocument> =
  mongoose.models.SurveyAnalytics || mongoose.model("SurveyAnalytics", surveyAnalyticsSchema)

export default SurveyAnalytics

