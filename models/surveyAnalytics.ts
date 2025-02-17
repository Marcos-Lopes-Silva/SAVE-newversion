import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISurveyAnalytics {
  surveyId: mongoose.Types.ObjectId;
  surveyTitle: string;
  dimensions: Array<{
    title: string;
    questions: Array<{
      title: string;
      name: string;
      type: string;
      processedData: any;
    }>;
  }>;
}

export interface ISurveyAnalyticsDocument extends ISurveyAnalytics, Document {}

const surveyAnalyticsSchema = new Schema<ISurveyAnalyticsDocument>(
  {
    surveyId: { 
      type: Schema.Types.ObjectId,
      required: true, 
      unique: true,
      ref: 'Survey'
    },
    surveyTitle: { type: String, required: true },
    dimensions: [{
      title: { type: String, required: true },
      questions: [{
        title: { type: String, required: true },
        name: { type: String, required: true },
        type: { type: String, required: true },
        processedData: { type: Schema.Types.Mixed, required: true },
      }],
    }],
  },
  { timestamps: true }
);

const SurveyAnalytics: Model<ISurveyAnalyticsDocument> =
  mongoose.models.SurveyAnalytics ||
  mongoose.model("SurveyAnalytics", surveyAnalyticsSchema);

export default SurveyAnalytics;
