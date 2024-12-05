import { connectToMongoDB } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import Survey from "../../../../models/surveyModel";

export default async function handler (req: NextApiRequest, res: NextApiResponse  ) {
await connectToMongoDB();

try {
    const surveys = await Survey.find({});

    return res.status(200).json(surveys);
}
    catch(error){
        console.error(error);
        return res.status(500).json({message: 'Internal server error' });
}
}