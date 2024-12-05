import { connectToMongoDB } from "@/lib/db";
import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import User from "../../../../../models/userModel";
import { hashToken } from "@/lib/crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();

    const { id } = req.query;
    let searchParam: string = 'id';

    if (id?.includes('@')) {
        searchParam = 'email';
    }

    switch (req.method) {
        case "GET":
            try {
                if (searchParam === 'id') {
                    let user = await User.findOne({ _id: new mongoose.Types.ObjectId(id as string) });

                    return res.status(200).json(user);
                }

                let user = await User.findOne({ email: id });

                return res.status(200).json(user);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        case "PATCH":
            try {
                const { cpf } = req.body;

                const user = await User.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id as string) }, { $set: { ...req.body, cpf: cpf } }, { upsert: true, returnDocument: 'after' });

                return res.status(200).json(user);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        case "DELETE":
            try {
                await User.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id as string) });

                return res.status(204);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
}