import { connectToMongoDB } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import User from "../../../../models/userModel";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();

    if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

    try {
        const users = await User.find({});

        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}