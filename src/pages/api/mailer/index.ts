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

    return `<p>Olá Administrador,</p>
                <p>Você tem uma nova solicitação de acesso.</p>
                <p>O Sr(a). ${name} solicitou acesso recentemente, por favor responda sua solicitação.</p>
                <p> Nome: ${name}</p>
                <p> Email: ${email}</p>
                <p> Telefone: ${phone}</p>
                <p> Instituto: ${institute}</p>
                <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td>
                        <a href="${approveUrl}" style="background-color: #28a745; border: 1px solid #28a745; border-radius: 3px; color: #ffffff; display: inline-block; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; line-height: 44px; text-align: center; text-decoration: none; width: 100px; -webkit-text-size-adjust: none;">Aprovar</a>
                        </td>
                        <td style="width: 20px;">&nbsp;</td>
                        <td>
                        <a href="${rejectUrl}" style="background-color: #dc3545; border: 1px solid #dc3545; border-radius: 3px; color: #ffffff; display: inline-block; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: bold; line-height: 44px; text-align: center; text-decoration: none; width: 100px; -webkit-text-size-adjust: none;">Rejeitar</a>
                        </td>
                    </tr>
                </table>`
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