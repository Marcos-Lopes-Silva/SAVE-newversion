import { NextApiRequest, NextApiResponse } from "next";
import SurveyResult from "../../../../../models/surveyResults";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    try {
        const result = await SurveyResult.create(req.body);

        return res.status(201).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }

}