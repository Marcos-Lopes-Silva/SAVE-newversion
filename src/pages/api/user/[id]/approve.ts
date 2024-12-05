import { connectToMongoDB } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import User from "../../../../../models/userModel";
import { compareToken } from "@/lib/crypto";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();

    const { id, token } = req.query;

    try {
        const approved = await compareToken(id as string, token as string);

        if (!approved) return res.status(403).json({ message: 'Invalid token' });
        
        await User.findOneAndUpdate({ email: id }, { $set: { approved } }, { returnOriginal: false, upsert: true });

        const targetUrl = '/api/mailer';

        const data = {
            email: id,
            subject: 'Solicitação de acesso',
            text: 'Sua solicitação de acesso foi aprovada',
            approved
        }

        const form = `
            <form id="redirectForm" method="POST" action="${targetUrl}">
                ${Object.keys(data).map(key => `<input type="hidden" name="${key}" value="${data[key as keyof typeof data]}" />`).join('')}
            </form>
            <script type="text/javascript">
                document.getElementById('redirectForm').submit();
            </script>
        `;

        res.setHeader('Content-Type', 'text/html');
        return res.send(form);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}