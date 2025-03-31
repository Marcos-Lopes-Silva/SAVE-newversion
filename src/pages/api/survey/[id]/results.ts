import { NextApiRequest, NextApiResponse } from "next";
import { connectToMongoDB } from "@/lib/db";
import Survey from "../../../../../models/surveyModel";
import SurveyResult from "../../../../../models/surveyResults";
import SurveyAnalytics, { ISurveyAnalytics } from "../../../../../models/surveyAnalytics";
import { ISurveyDocument, IQuestion } from "../../../../../models/surveyModel";
import { SurveyResultDocument } from "../../../../../types/survey";
import { processResults } from "../../../../lib/processresults";
import { Types } from "mongoose";

interface AnalyticsQueryWithFilter {
  surveyId: Types.ObjectId;
  "filter.questionName": string;
  "filter.answer": string;
}

interface AnalyticsQueryWithoutFilter {
  surveyId: Types.ObjectId;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ISurveyAnalytics | { message: string }>
) {
  await connectToMongoDB();
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const objectId : Types.ObjectId = new Types.ObjectId(String(id));

    const filterQuestion = req.query.filterQuestion as string | undefined;
    const filterAnswer = req.query.filterAnswer as string | undefined;
    const filter = filterQuestion && filterAnswer
      ? { questionName: filterQuestion, answer: filterAnswer }
      : undefined;

    const survey: ISurveyDocument | null = await Survey.findById(new Types.ObjectId(objectId));
    if (!survey) {
      return res.status(404).json({ message: "Pesquisa não encontrada" });
    }

    if (filter) {
      const questionExists: boolean = survey.pages.some(page =>
        page.questions.some((q: IQuestion) => q.name === filter.questionName)
      );

      if (!questionExists) {
        return res.status(400).json({ message: "Questão de filtro não encontrada" });
      }
    }

    let query: AnalyticsQueryWithFilter | AnalyticsQueryWithoutFilter;
    if (filter) {
      query = {
        surveyId: objectId,
        "filter.questionName": filter.questionName,
        "filter.answer": filter.answer,
      };
    } else {
      query = { surveyId: objectId };
    }

    let savedAnalytics: ISurveyAnalytics | null = await SurveyAnalytics.findOne(query).exec();

    if (!savedAnalytics) {
      const surveyResults: SurveyResultDocument[] = await SurveyResult.find({ surveyId: objectId }).exec();
      const processedData = processResults(survey, surveyResults, filter);

      processedData.surveyId = objectId;
      if (filter) {
        processedData.filter = filter;
      }

      savedAnalytics = await SurveyAnalytics.create(processedData);
    }

    return res.status(200).json(savedAnalytics);
  } catch (error) {
    console.error("Erro completo:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}