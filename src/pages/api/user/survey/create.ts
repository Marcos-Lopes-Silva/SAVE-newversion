import { NextApiRequest, NextApiResponse } from "next";
import { connectToMongoDB } from "@/lib/db";
import SurveyUsers from "../../../../../models/surveyUsersModel";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();

    if (req.method !== "POST") return res.status(405);

    const body = req.body;
    

    const response = await SurveyUsers.create(body);

    return res.status(201).json(response);
}