import { connectToMongoDB } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import Survey from "../../../../models/surveyModel";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();

    const { id } = req.query;
    
    const objectId = new mongoose.Types.ObjectId(id as string);

    switch (req.method) {
        case "GET":
            try {
                return res.status(200).json(await Survey.findById(objectId));
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        case "PATCH":
            try {
                return res.status(200).json(await Survey.findByIdAndUpdate(objectId, { $set: req.body }, { returnOriginal: false, upsert: true }));
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        case "DELETE":
            try {
                return res.status(200).json(await Survey.findByIdAndDelete(objectId));
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
}