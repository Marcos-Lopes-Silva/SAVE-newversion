import { NextApiRequest, NextApiResponse } from 'next';
import { connectToMongoDB } from '@/lib/db';
import mongoose from 'mongoose';
import Group from '../../../../models/groupModel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();

    let { id } = req.query;

    switch (req.method) {
        case "GET":
            try {
                let group = await Group.findById(new mongoose.Types.ObjectId(id as string));
                return res.status(200).json(group);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        case "PATCH":
            try {
                const group = await Group.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id as string) }, { $set: req.body }, { upsert: true, returnDocument: 'after' });

                return res.status(200).json(group);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        case "DELETE":
            try {
                await Group.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id as string) });

                return res.status(204);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }
    }
}