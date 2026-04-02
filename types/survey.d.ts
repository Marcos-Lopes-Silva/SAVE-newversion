import { Document } from "mongoose";
import { ISurveyDocument } from "../models/surveyModel";
import { ISurveyResult } from "../models/surveyResultModel";

export interface ProcessedQuestionData {
  type: string;
  data: Array<{ name: string; value: number }>;
}

export type ProcessedSurveyData = Record<string, ProcessedQuestionData>;

export type SurveyResultDocument = Document & ISurveyResult;