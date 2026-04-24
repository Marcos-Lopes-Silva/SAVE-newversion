import { NextApiRequest, NextApiResponse } from "next";
import { connectToMongoDB } from "@/lib/db";
import User from "../../../../models/userModel";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

    await connectToMongoDB();
    const session = await getSession({ req });

    if (!session || session.user.role !== 'admin') {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const { role, search } = req.query;
        let query: any = {};
        
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Exclude the current user from the list
        query._id = { $ne: session.user._id };

        const users = await User.find(query).select('name email _id').limit(10);
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
