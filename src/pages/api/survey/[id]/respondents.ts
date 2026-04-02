import { connectToMongoDB } from "@/lib/db";
import SurveyResult from "../../../../../models/surveyResultModel";
import User from "../../../../../models/userModel";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    const session = await getSession({ req });

    if (!session || session.user.role !== 'admin') {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        await connectToMongoDB();

        const results = await SurveyResult.find({ surveyId: id }).select('userId createdAt').lean();
        
        const userIds = results.map(r => r.userId);
        const users = await User.find({ _id: { $in: userIds } }).select('name email').lean();

        const respondents = results.map(result => {
            const user = users.find(u => u._id.toString() === result.userId.toString());
            return {
                name: user?.name || 'Unknown',
                email: user?.email || 'Unknown',
                respondedAt: result.createdAt
            };
        });

        return res.status(200).json({
            count: respondents.length,
            respondents
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
