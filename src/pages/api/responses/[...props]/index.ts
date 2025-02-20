import { connectToMongoDB } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import SurveyResult from "../../../../../models/surveyResultModel";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();

    const { surveyId, userId } = req.query;
    

    try {
        const responses = await SurveyResult.findOne({ surveyId, userId });

        if (!responses) res.status(200);

        res.status(200).json(responses);
    } catch (error) {
        console.error(error);
        res.status(200).json({ message: 'Internal server error' });
    }

}