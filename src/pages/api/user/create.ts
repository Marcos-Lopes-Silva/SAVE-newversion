import { connectToMongoDB } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import User from "../../../../models/userModel";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();
    const body = req.body;

    if (!(req.method === 'POST')) {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    if (!body) {
        return res.status(400).json({ message: 'No body provided' });
    }

    try {
        const user = await User.create(body);

        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}