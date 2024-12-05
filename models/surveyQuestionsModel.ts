import mongoose, { Document, Model } from "mongoose";

export interface IPage {
    name: string;
    title: string;
    elements: IElement[];
  }

  export interface IElement {
    type: string;
    name: string;
    title: string;
    isRequired?: boolean;
    inputType?: string;
    min?: number;
    visibleIf?: string;
    choices?: string[];
    choicesFromQuestion?: string;
    hasOther?: boolean;
    otherText?: string;
  }

export interface ISurveyQuestions {
    pages : IPage[];
}

export interface ISurveyQuestionsDocument extends ISurveyQuestions, Document {
    createdAt: Date,
    updatedAt: Date,
}

const SurveyQuestionsSchema = new mongoose.Schema<ISurveyQuestionsDocument>(
    {
    pages: {
        type: [],
        required: true,
    }
    },
    {
        timestamps: false,
    }
);
const SurveyQuestions : Model<ISurveyQuestionsDocument> = mongoose.models.SurveyQuestions || mongoose.model("SurveyQuestions", SurveyQuestionsSchema);

export default SurveyQuestions;
