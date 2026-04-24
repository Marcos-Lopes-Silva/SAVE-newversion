import { NextApiRequest, NextApiResponse } from "next";
import SurveyResult from "../../../../../models/surveyResultModel";
import SurveyAnalytics from "../../../../../models/surveyAnalytics";
import Survey from "../../../../../models/surveyModel";
import { processResults } from "../../../../lib/processresults";
import mongoose from "mongoose";
import { connectToMongoDB } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectToMongoDB();
    const { surveyId, userId, surveyResult, currentPage, termsAccepted } = req.body;

    if (!surveyId || !userId) {
      return res.status(400).json({ message: "surveyId and userId are required" });
    }

    const sId = new mongoose.Types.ObjectId(surveyId);
    const uId = new mongoose.Types.ObjectId(userId);

    const result = await SurveyResult.findOneAndUpdate(
      { surveyId: sId, userId: uId },
      { 
        surveyId: sId, 
        userId: uId, 
        surveyResult, 
        currentPage,
        termsAccepted,
        isComplete: false // Progress save is explicitly not complete
      },
      { upsert: true, new: true }
    );

    // Update Analytics in real-time
    const survey = await Survey.findById(sId);
    if (survey) {
      const allResults = await SurveyResult.find({ surveyId: sId, isComplete: true });
      const analyticsData = processResults(survey, allResults);
      analyticsData.surveyId = sId;

      await SurveyAnalytics.findOneAndUpdate(
        { surveyId: sId },
        analyticsData,
        { upsert: true, new: true }
      );

      await Survey.findByIdAndUpdate(sId, { responses: allResults.length });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Progress save error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
