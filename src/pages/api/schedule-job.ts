import agenda from "@/lib/agenda";
import { connectToMongoDB } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import SurveyAnalytics from "../../../models/surveyAnalytics";
import Survey from "../../../models/surveyModel";
import SurveyResult from "../../../models/surveyResults";
import { processResults } from "../../lib/processresults"; // Movemos a função para um arquivo separado
import { SurveyResultDocument } from "../../../types/survey";
import mongoose from "mongoose";

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
            if (!emails || !id) return res.status(400).json({ message: 'Email and survey ID are required' });
          
            try {
              const surveyId = new mongoose.Types.ObjectId(id);
              const survey = await Survey.findById(surveyId);
              if (!survey) return res.status(404).json({ message: 'Survey not found' });
          
              const surveyResults = await SurveyResult.find({ surveyId });
              const dimensions = processResults(survey, surveyResults);
          
              await SurveyAnalytics.findOneAndUpdate(
                { surveyId },
                { 
                  surveyTitle: survey.title,
                  dimensions
                },
                { upsert: true, new: true }
              );
          
              await agenda.schedule(date, 'send email', {
                to: emails[0],
                subject: 'Resultados da Pesquisa',
                html: `<p>Resultados disponíveis em: ${process.env.NEXTAUTH_URL}/survey/${id}/results</p>`
              });
          
              break;
            } catch (error) {
              console.error(error);
              return res.status(500).json({ message: 'Error processing results' });
            }
          }
        case 'update database field' : {
            await agenda.schedule(date, 'update database field', { collection, id, field, value });
            break;
        }
    }

    return res.status(200).json({ message: 'Job scheduled' });
}