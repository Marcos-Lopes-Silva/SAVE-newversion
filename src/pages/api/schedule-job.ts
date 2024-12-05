import agenda from "@/lib/agenda";
import { connectToMongoDB } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

interface ScheduleJob {
    job: 'send emails survey' | 'send emails results' | 'update database field',
    scheduleDate: string,
    emails?: string[],
    collection?: string
    field?: string,
    value?: string,
    id?: string,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();

    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' }); 
    
    const { scheduleDate, job, emails, collection, field, value, id } = req.body as ScheduleJob;

    const date = new Date(scheduleDate);

    switch (job) {
        case 'send emails survey': {

            if (!emails) return res.status(400).json({ message: 'Emails are required' });
            
            emails.forEach(async (email) => {
                await agenda.schedule(date, 'send email', {to: email, subject: 'Olá, ', text: `Você está sendo convidado para responder uma pesquisa. Acessa ela em ${process.env.NEXTAUTH_URL}, realize o login e responda a pesquisa.`});
            });

            break;
        }
        case 'send emails results': {

            if (!emails) return res.status(400).json({ message: 'Email are required' });

            await agenda.schedule(date, 'send email', { to: emails[0], subject: 'Resultados da pesquisa', text: 'Resultados da pesquisa' });
            break;
        }
        case 'update database field' : {
            await agenda.schedule(date, 'update database field', { collection, id, field, value });
            break;
        }
    }

    return res.status(200).json({ message: 'Job scheduled' });
}