import { connectToMongoDB } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import Survey from "../../../../../models/surveyModel";
import SurveyUsers from "../../../../../models/surveyUsersModel";
import Group from "../../../../../models/groupModel";




export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();

    const { cpf } = req.query;

    try {
        const groups = await Group.find({ members: { $elemMatch: { cpf } } });
        let surveyIds: string[] = [];
        console.log(groups);
        for (const group of groups) {
            const surveyUser = await SurveyUsers.findOne({ groupId: group._id });
            if (surveyUser) {
                surveyIds.push(surveyUser.surveyId.toString());
            }
        }

        const surveys = await Survey.find({ _id: { $in: surveyIds } });
        return res.status(200).json(surveys);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}