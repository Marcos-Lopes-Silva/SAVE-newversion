import { NextApiRequest, NextApiResponse } from "next";
import SurveyUsers from "../../../../../../models/surveyUsersModel";
import { connectToMongoDB } from "@/lib/db";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();
    const { id } = req.query;


    try {
        const surveyUser = await SurveyUsers.findOne({ surveyId: id as string });
        return res.status(200).json(surveyUser);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}