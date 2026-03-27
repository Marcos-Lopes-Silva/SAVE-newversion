import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMongoDB } from '@/lib/db';
import Group from '../../../../models/groupModel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid ID' });
    }

    try {
        switch (req.method) {
            case "GET":
                const group = await Group.findById(id);
                return res.status(200).json(group);

            case "PATCH":
                const updatedGroup = await Group.findByIdAndUpdate(
                    id,
                    { $set: req.body },
                    { new: true }
                );

                return res.status(200).json(updatedGroup);

            case "DELETE":
                await Group.findByIdAndDelete(id);
                return res.status(204).end();

            default:
                return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}