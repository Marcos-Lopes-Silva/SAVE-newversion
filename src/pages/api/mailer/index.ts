import { NextApiRequest, NextApiResponse } from "next";
import { hashToken } from "@/lib/crypto";
import { transporter } from "@/lib/mailer";

const getHtml = async (name: string, institute: string, phone: string, email: string) => {

    if (!process.env.HASH_SECRET) {
        throw new Error('HASH_SECRET is not defined');
    }

    const token = await hashToken(email);
    const approveUrl = `${process.env.NEXTAUTH_URL}api/user/${email}/approve?token=${token}`;
    const rejectUrl = `${process.env.NEXTAUTH_URL}api/user/${email}/reject?token=${token}`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap');
            body { margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Open Sans', sans-serif; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background-color: #002147; padding: 20px; text-align: center; }
            .logo { max-width: 150px; height: auto; }
            .content { padding: 30px; color: #333333; }
            .university-border { border-top: 4px solid #002147; border-bottom: 2px solid #e0e0e0; }
            .details { margin: 25px 0; }
            .detail-item { margin: 15px 0; line-height: 1.6; }
            .button-container { margin-top: 30px; text-align: center; }
            .button { display: inline-block; padding: 12px 25px; margin: 0 10px; color: white !important; 
                    text-decoration: none; border-radius: 5px; font-weight: 600; }
            .approve { background-color: #28a745; border: 1px solid #218838; }
            .reject { background-color: #dc3545; border: 1px solid #c82333; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; 
                    color: #666666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header university-border">
                <img src="https://save-ten.vercel.app/favicon.ico" class="logo" alt="SAVE Logo">
            </div>
            
            <div class="content">
                <h2 style="color: #002147; margin-top: 0;">Nova Solicitação de Acesso</h2>
                
                <p>Prezado Administrador,</p>
                <p>O(a) Sr(a) <strong>${name}</strong> solicitou acesso ao SAVE como Gestor. Seguem os detalhes:</p>
                
                <div class="details">
                    <div class="detail-item">
                        <span style="color: #002147;">📋 Nome:</span> ${name}
                    </div>
                    <div class="detail-item">
                        <span style="color: #002147;">📧 E-mail:</span> ${email}
                    </div>
                    <div class="detail-item">
                        <span style="color: #002147;">📞 Telefone:</span> ${phone}
                    </div>
                    <div class="detail-item">
                        <span style="color: #002147;">🏛 Instituto:</span> ${institute}
                    </div>
                </div>

                <div class="button-container">
                    <a href="${approveUrl}" class="button approve">Aprovar Solicitação</a>
                    <a href="${rejectUrl}" class="button reject">Rejeitar Solicitação</a>
                </div>

                <p style="margin-top: 30px; color: #666;">Atenciosamente,<br>Equipe SAVE</p>
            </div>

            <div class="footer university-border">
                <p>📚 Sistema de Acompanhanto da Vida do Egresso</p>
                <p>📩 Dúvidas? <a href="mailto:egressas4@gmail.com" style="color: #002147;">suporte@SAVE.com</a></p>
                <p style="margin-top: 15px;">© ${new Date().getFullYear()} SAVE. Todos os direitos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { email, approved, to, subject, text, name, institute, phone } = req.body;

    let html = '';

    try {
        if (subject == 'Nova solicitação de acesso') {
            await transporter.sendMail({
                to: process.env.EMAIL_USER,
                subject,
                html: await getHtml(name, institute, phone, email)
            });
        } else if (approved) {
            await transporter.sendMail({
                to: email,
                subject: 'Solicitação aprovada',
                text: '',
                html: `<p>Olá,</p>
                <p>Sua solicitação de acesso foi aprovada.</p>
                <p>Por favor, acesse o <a href="${process.env.NEXTAUTH_URL}">sistema</a> para continuar.</p>`,
            });
        } else {
            await transporter.sendMail({
                to,
                subject,
                text,
                html
            });
        }


        return res.status(200).json({ message: 'Email sent' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error });
    }

}