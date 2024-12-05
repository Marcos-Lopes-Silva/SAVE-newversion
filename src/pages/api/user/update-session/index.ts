import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession, Session } from "next-auth";
import auth from "../../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const session: Session | null = await getServerSession(req, res, auth);
    const { cpf } = req.body;

    if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
    }


    try {
        session.user.cpf = cpf;

        return res.status(200).json({ message: 'CPF updated successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}