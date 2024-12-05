import { connectToMongoDB } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import User from "../../../../../models/userModel";
import { compareToken } from "@/lib/crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();

    const { id, token } = req.query;
    const rejected = await compareToken(id as string, token as string);
    
    if (!rejected) return res.status(403) 

    User.findOneAndUpdate({ email: id }, { approved: false }, { upsert: true });



    return res.redirect('/admin/dashboard');
}