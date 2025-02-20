import mongoose from "mongoose";
import { Model } from "mongoose";
import { ObjectId } from "mongoose";

export interface ISurveyResultData {
    [key: string]: string | number | boolean | string[] | number[] | boolean[] | null
}

export interface ISurveyResult {
    surveyId: ObjectId,
    userId: ObjectId,
    currentPage: number,
    surveyResult: ISurveyResultData[],
    timeSpent: number,
}

export interface ISurveyResultDocument extends ISurveyResult, Document {
    createdAt: Date,
    updatedAt: Date,
}

const surveyResultDataSchema: mongoose.Schema = new mongoose.Schema<ISurveyResultData>(
    {

    },
    {
        _id: false,
    }
)

const surveyResultSchema: mongoose.Schema = new mongoose.Schema<ISurveyResultDocument>(
    {
        surveyId: {
            type: mongoose.Types.ObjectId,
            required: true,
        },
        userId: {
            type: mongoose.Types.ObjectId,
            required: true,
        },
        currentPage: {
            type: Number,
            required: true,
        },
        surveyResult: {
            type: [surveyResultDataSchema],
            required: true,
        },
        timeSpent: {
            type: Number,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const SurveyResult: Model<ISurveyResultDocument> = mongoose.models.SurveyResult || mongoose.model("SurveyResult", surveyResultSchema);
export default SurveyResult;