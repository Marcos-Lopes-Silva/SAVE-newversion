import { connectToMongoDB } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import Survey from "../../../../models/surveyModel";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();

    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    const body = req.body;

    try {
        const survey = await Survey.create(body);

        return res.status(201).json(survey);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}