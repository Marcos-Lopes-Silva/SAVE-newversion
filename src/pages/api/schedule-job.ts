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

            const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
                .container { max-width: 600px; margin: auto; background: #ffffff; }
                .header { background: #27272a; padding: 2rem; text-align: center; }
                .logo { max-width: 120px; height: auto; }
                .content { padding: 2rem; color: #27272a; font-family: 'Inter', sans-serif; }
                .divider { height: 2px; background: #e4e4e7; margin: 2rem 0; }
                .cta-button { display: inline-block; padding: 0.75rem 2rem; 
                            background: #27272a; color: white !important; text-decoration: none; 
                            border-radius: 6px; font-weight: 600; transition: opacity 0.3s; }
                .cta-button:hover { opacity: 0.9; }
                .footer { padding: 1.5rem; text-align: center; background: #fafafa; 
                        color: #71717a; font-size: 0.875rem; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://save-ten.vercel.app/favicon.ico" class="logo" alt="SAVE">
                </div>
                
                <div class="content">
                    <h1 style="margin: 0 0 1.5rem 0; font-weight: 600;">🎓 Sua Opinião Faz a Diferença</h1>
                    
                    <p>Prezado Egresso,</p>
                    
                    <p>Como parte de nossa comunidade acadêmica, seu feedback é essencial para:</p>
                    
                    <ul style="margin: 1rem 0; padding-left: 1.5rem;">
                        <li>Melhorar a qualidade dos nossos cursos</li>
                        <li>Otimizar o acompanhamento de egressos</li>
                        <li>Desenvolver novos programas acadêmicos</li>
                    </ul>

                    <div class="divider"></div>

                    <p style="font-weight: 500;">Convite para Participação:</p>
                    <p>Dedique alguns minutos para responder nossa pesquisa de acompanhamento:</p>
                    
                    <div style="margin: 2rem 0;">
                        <a href="https://save-ten.vercel.app/" class="cta-button">▶ Acessar Pesquisa</a>
                    </div>

                    <div style="background: #fafafa; padding: 1rem; border-radius: 6px;">
                        <p style="margin: 0; font-size: 0.875rem;">
                            📋 Pesquisa totalmente anônima<br>
                            ⏱ Tempo estimado: 15-30 minutos<br>
                            🔐 Acesso seguro através do sistema SAVE
                        </p>
                    </div>
                </div>

                <div class="footer">
                    Sistema de Acompanhamento da Vida do Egresso - SAVE</p>
                    <p>Dúvidas? <a href="mailto:egressas4@gmail.com" 
                               style="color: #27272a; text-decoration: underline;">egressas4@gmail.com</a></p>
                    <p style="margin-top: 1rem; font-size: 0.75rem;">
                        Esta mensagem é destinada exclusivamente ao destinatário acima
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;

            emails.forEach(async (email) => {
                await agenda.schedule(date, 'send email', { to: email, subject: `Olá, Egresso`, text: htmlContent });
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
              const processedData = processResults(survey, surveyResults);
          
              const analytics = await SurveyAnalytics.findOneAndUpdate(
                { surveyId },
                { 
                  surveyTitle: survey.title,
                  pages: processedData.pages 
                },
                { 
                  upsert: true, 
                  new: true,
                  setDefaultsOnInsert: true
                }
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