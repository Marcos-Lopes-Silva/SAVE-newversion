import { connectToMongoDB } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';
import SurveyQuestions from '../../../../models/surveyQuestionsModel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();

    switch (req.method) {
        case "GET":
            try {
                const surveyQuestion = await SurveyQuestions.find({});
                return res.status(200).json(surveyQuestion);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        default:
            return res.status(405).json({ message: 'Method not allowed' });
        }
} 