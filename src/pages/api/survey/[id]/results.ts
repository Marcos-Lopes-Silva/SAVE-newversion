import { NextApiRequest, NextApiResponse } from "next";
import { connectToMongoDB } from "@/lib/db";
import Survey from "../../../../../models/surveyModel";
import SurveyResult from "../../../../../models/surveyResults";
import SurveyAnalytics, { ISurveyAnalytics, FilterCondition } from "../../../../../models/surveyAnalytics";
import { ISurveyDocument, IQuestion } from "../../../../../models/surveyModel";
import { SurveyResultDocument } from "../../../../../types/survey";
import { processResults } from "../../../../lib/processresults";
import { Types } from "mongoose";
import mongoose from "mongoose";

interface AnalyticsQuery {
  surveyId: mongoose.Types.ObjectId;
  filters?: FilterCondition[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ISurveyAnalytics | { message: string }>
) {
  await connectToMongoDB();
  const { id } = req.query;

  switch (req.method) {
    case "GET":
      try {
        const objectId = new Types.ObjectId(String(id));

        const filterQuestionParam = req.query.filterQuestion || req.query['filterQuestion[]'];
        const filterAnswerParam = req.query.filterAnswer || req.query['filterAnswer[]'];
        const filterRowParam = req.query.filterRow || req.query['filterRow[]'];
        let filters: FilterCondition[] | undefined = undefined;

        if (filterQuestionParam && filterAnswerParam) {
          if (Array.isArray(filterQuestionParam) && Array.isArray(filterAnswerParam)) {
            if (filterQuestionParam.length !== filterAnswerParam.length) {
              return res.status(400).json({ message: "Quantidade de filtros inconsistentes" });
            }
            filters = filterQuestionParam.map((q, index) => {
              const filter: FilterCondition = {
                questionName: q,
                answer: filterAnswerParam[index] as string,
              };
              // Se o parâmetro filterRow estiver presente, adiciona a propriedade "row"
              if (filterRowParam) {
                if (Array.isArray(filterRowParam)) {
                  filter.row = filterRowParam[index];
                } else if (typeof filterRowParam === "string") {
                  filter.row = filterRowParam;
                }
              }
              return filter;
            });
          } else if (typeof filterQuestionParam === "string" && typeof filterAnswerParam === "string") {
            const filter: FilterCondition = { questionName: filterQuestionParam, answer: filterAnswerParam };
            if (filterRowParam && typeof filterRowParam === "string") {
              filter.row = filterRowParam;
            }
            filters = [filter];
          }
        }

       // console.log("req.query:", req.query);
       // console.log("Filtros processados:", filters);

        const survey: ISurveyDocument | null = await Survey.findById(objectId);
        if (!survey) {
          return res.status(404).json({ message: "Pesquisa não encontrada" });
        }

        if (filters) {
          const questionNotFound = filters.find(filter =>
            !survey.pages.some(page =>
              page.questions.some((q: IQuestion) => q.name === filter.questionName)
            )
          );
          if (questionNotFound) {
            return res.status(400).json({ message: `Questão de filtro não encontrada: ${questionNotFound.questionName}` });
          }
        }

        // Consulta se já existe um analytics salvo com esses filtros
        let query: AnalyticsQuery = { surveyId: objectId };
        if (filters) {
          query.filters = filters;
        }
        
        let savedAnalytics: ISurveyAnalytics | null = await SurveyAnalytics.findOne(query).exec();

        if (!savedAnalytics) {
          const surveyResults: SurveyResultDocument[] = await SurveyResult.find({ surveyId: objectId }).exec();
          const processedData = processResults(survey, surveyResults, filters);
          processedData.surveyId = objectId;
          savedAnalytics = await SurveyAnalytics.create(processedData);
        }

        return res.status(200).json(savedAnalytics);
      } catch (error) {
        console.error("Erro completo:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

    case "PATCH":
      try {
        const { questions, hasPublic } = req.body;
        if (!id || !questions) {
          return res.status(400).json({ message: "ID e perguntas são obrigatórios" });
        }
        const objectId = new mongoose.Types.ObjectId(id as string);

        const updatedAnalytics = await SurveyAnalytics.findOneAndUpdate(
          { surveyId: objectId },
          { $set: { hasPublic } },
          { new: true }
        );
        if (!updatedAnalytics) {
          return res.status(404).json({ message: "Pesquisa não encontrada" });
        }
        
        if (questions && questions.length > 0) {
          for (const q of questions) {
            await SurveyAnalytics.updateOne(
              { surveyId: objectId, "pages.questions.name": q.name },
              { $set: { 
                "pages.$[].questions.$[question].isPublic": q.isPublic, 
                "pages.$[].questions.$[question].chart": q.chart, 
              } },
              { arrayFilters: [{ "question.name": q.name }] }
            );
          }
        }
  
        return res.status(200).json({ message: "Atualizado com sucesso" });
      } catch (error) {
        console.error("Erro ao atualizar:", error);
        return res.status(500).json({ message: "Erro interno do servidor" });
      }

    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}
