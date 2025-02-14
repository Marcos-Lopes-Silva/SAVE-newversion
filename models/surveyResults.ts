import mongoose, { Document, Model } from "mongoose";

export interface ISurveyResult {
    surveyId: string,
    userId: string,
    currentPage: number,
    surveyResult: Object,
}

export interface ISurveyUsersDocument extends ISurveyResult, Document {
    createdAt: Date,
    updatedAt: Date,
}

const surveyResultSchema: mongoose.Schema = new mongoose.Schema<ISurveyUsersDocument>(
    {
        surveyId: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        currentPage: {
            type: Number,
            required: true,
        },
        surveyResult: {
            type: Object,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const SurveyResult: Model<ISurveyResult> = mongoose.models.SurveyResult || mongoose.model("SurveyResult", surveyResultSchema);

export default SurveyResult;