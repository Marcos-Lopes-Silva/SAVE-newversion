import { NextApiRequest, NextApiResponse } from "next";
import { connectToMongoDB } from "@/lib/db";
import Survey from "../../../../../models/surveyModel";
import SurveyResult from "../../../../../models/surveyResults";
import SurveyAnalytics from "../../../../../models/surveyAnalytics";
import { ISurveyDocument, IQuestion } from "../../../../../models/surveyModel";
import { 
  ProcessedSurveyData,
  SurveyResultDocument
} from "../../../../../types/survey";
import { processResults } from "../../../../lib/processresults"
import mongoose from "mongoose"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToMongoDB()
  const { id } = req.query

  switch (req.method) {
    case "GET":
      try {
        const objectId = new mongoose.Types.ObjectId(id as string)
    
        let savedAnalytics = await SurveyAnalytics.findOne({ surveyId: objectId })
    
        if (!savedAnalytics) {
          const survey = await Survey.findById(objectId)
          if (!survey) {
            return res.status(404).json({ message: "Survey not found" })
          }
    
          const surveyResults = await SurveyResult.find({ surveyId: objectId })
          const processedData = processResults(survey, surveyResults)
    
          savedAnalytics = await SurveyAnalytics.findOneAndUpdate({ surveyId: objectId }, processedData, {
            upsert: true,
            new: true,
          })
        }
    
        return res.status(200).json(savedAnalytics)
      } catch (error) {
        console.error("Erro completo:", error)
        return res.status(500).json({ message: "Internal server error" })
      }
    
    case "PATCH":
      try {
        const { id } = req.query;
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
              { $set: { "pages.$[].questions.$[question].isPublic": q.isPublic } },
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
      return res.status(405).json({ message: "Method not allowed" })
}


}