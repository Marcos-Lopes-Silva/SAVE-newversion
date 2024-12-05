import { NextApiRequest, NextApiResponse } from "next";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {

    const { email } = req.query;

    
    return res.redirect('/api/mailer?email=' + email + '&approved=true');
}