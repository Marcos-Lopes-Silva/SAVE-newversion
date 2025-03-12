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

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" })
  }

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

      console.log("Dados salvos no Analytics:", savedAnalytics)
    }

    return res.status(200).json(savedAnalytics)
  } catch (error) {
    console.error("Erro completo:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

