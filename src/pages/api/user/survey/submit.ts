import { NextApiRequest, NextApiResponse } from "next";
import SurveyResult from "../../../../../models/surveyResults";
import SurveyAnalytics from "../../../../../models/surveyAnalytics";
import Survey from "../../../../../models/surveyModel";
import { processResults } from "../../../../lib/processresults";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { surveyId, userId } = req.body;
    let surveyResult;

    const existingResult = await SurveyResult.findOne({ surveyId, userId });

    if (existingResult) {
      surveyResult = await SurveyResult.findOneAndUpdate(
        { _id: existingResult._id },
        req.body,
        { new: true }
      );
    } else {
      surveyResult = await SurveyResult.create(req.body);
    }

    const survey = await Survey.findById(surveyId);
    if (survey) {
      const allResults = await SurveyResult.find({ surveyId });
      const analyticsData = processResults(survey, allResults);
      analyticsData.surveyId = new mongoose.Types.ObjectId(String(survey._id));
      await SurveyAnalytics.findOneAndUpdate(
        { surveyId: survey._id },
        analyticsData,
        { upsert: true, new: true }
      );
    }

    return res.status(existingResult ? 200 : 201).json(surveyResult);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
