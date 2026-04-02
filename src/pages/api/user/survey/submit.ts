import { NextApiRequest, NextApiResponse } from "next";
import SurveyResult from "../../../../../models/surveyResultModel";
import SurveyAnalytics from "../../../../../models/surveyAnalytics";
import Survey from "../../../../../models/surveyModel";
import { processResults } from "../../../../lib/processresults";
import mongoose from "mongoose";
import { connectToMongoDB } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToMongoDB();
    const { surveyId, userId } = req.body;

    if (!surveyId || !userId) {
      return res.status(400).json({ message: "surveyId and userId are required" });
    }

    // Convert strings to ObjectIds for correct matching in MongoDB
    const sId = new mongoose.Types.ObjectId(surveyId);
    const uId = new mongoose.Types.ObjectId(userId);

    let surveyResult;

    const existingResult = await SurveyResult.findOne({ 
      surveyId: sId, 
      userId: uId 
    });

    if (existingResult) {
      surveyResult = await SurveyResult.findOneAndUpdate(
        { _id: existingResult._id },
        { ...req.body, surveyId: sId, userId: uId, isComplete: true },
        { new: true }
      );
    } else {
      surveyResult = await SurveyResult.create({
        ...req.body,
        surveyId: sId,
        userId: uId,
        isComplete: true
      });
    }

    const survey = await Survey.findById(sId);
    if (survey) {
      const allResults = await SurveyResult.find({ surveyId: sId });
      const analyticsData = processResults(survey, allResults);
      analyticsData.surveyId = sId;
      
      await SurveyAnalytics.findOneAndUpdate(
        { surveyId: sId },
        analyticsData,
        { upsert: true, new: true }
      );

      // Update response count on survey
      await Survey.findByIdAndUpdate(sId, { responses: allResults.length });
    }

    return res.status(existingResult ? 200 : 201).json(surveyResult);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
