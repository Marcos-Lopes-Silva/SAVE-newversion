import { NextApiRequest, NextApiResponse } from "next";
import { connectToMongoDB } from "@/lib/db";
import Survey from "../../../../../models/surveyModel";
import { getSession } from "next-auth/react";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();
    const session = await getSession({ req });

    if (!session || session.user.role !== 'admin') {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query; // surveyId
    const survey = await Survey.findById(id);

    if (!survey) return res.status(404).json({ message: 'Survey not found' });
    if (survey.author.toString() !== session.user._id?.toString()) {
        return res.status(403).json({ message: 'Only the author can share this survey' });
    }

    if (survey.status === 'draft') {
        return res.status(400).json({ message: 'Draft surveys cannot be shared. Please activate the survey first.' });
    }

    if (req.method === 'GET') {
        // Return current shared users
        const populatedSurvey = await survey.populate('sharedWith', 'name email _id');
        return res.status(200).json(populatedSurvey.sharedWith);
    }

    if (req.method === 'POST') {
        const { userIds } = req.body; // Array of user IDs to share with
        if (!Array.isArray(userIds)) return res.status(400).json({ message: 'userIds must be an array' });

        try {
            survey.sharedWith = userIds.map(uid => new mongoose.Types.ObjectId(uid));
            await survey.save();
            return res.status(200).json({ message: 'Survey sharing updated successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
