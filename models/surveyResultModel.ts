import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISurveyResult {
    surveyId: mongoose.Types.ObjectId | string,
    userId: mongoose.Types.ObjectId | string,
    currentPage: number,
    surveyResult: Record<string, any>,
    timeSpent?: number,
    isComplete?: boolean,
    termsAccepted?: boolean,
}

export interface ISurveyResultDocument extends ISurveyResult, Document {
    createdAt: Date,
    updatedAt: Date,
}

const surveyResultSchema: Schema = new Schema<ISurveyResultDocument>(
    {
        surveyId: {
            type: Schema.Types.ObjectId,
            ref: "Survey",
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        currentPage: {
            type: Number,
            required: true,
        },
        surveyResult: {
            type: Schema.Types.Mixed,
            required: true,
        },
        timeSpent: {
            type: Number,
            default: 0
        },
        isComplete: {
            type: Boolean,
            default: false,
        },
        termsAccepted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const SurveyResult: Model<ISurveyResultDocument> = mongoose.models.SurveyResult || mongoose.model("SurveyResult", surveyResultSchema);
export default SurveyResult;
