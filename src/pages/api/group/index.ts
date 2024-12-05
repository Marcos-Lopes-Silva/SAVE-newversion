import { connectToMongoDB } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';
import Group, { IUsers } from '../../../../models/groupModel';
import { compareToken, hashToken } from '@/lib/crypto';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();

    switch (req.method) {
        case "POST":
            try {
                const newUsers = await Promise.all(
                    req.body.members.map(async (user: IUsers) => {
                        const newUser = { ...user };
                        const memberHashed = await verifyUsersFromOthersGroups(newUser);
                        if (memberHashed) newUser.cpf = memberHashed;
                        else if (newUser.cpf) newUser.cpf = await hashToken(newUser.cpf) ?? '';
                        return newUser;
                    })
                );


                const group = await Group.create({ ...req.body, members: newUsers });

                return res.status(201).json(group);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        case "GET":
            try {
                const group = await Group.find({});
                return res.status(200).json(group);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
}

const verifyUsersFromOthersGroups = async (user: IUsers) => {
    if (!user.cpf) return null;
    try {
        const groups = await Group.find({});

        for (const group of groups) {
            for (const member of group.members) {

                if (!member.cpf) continue;
                const isMatch = await compareToken(user.cpf!!, member.cpf!!);
                if (isMatch) {
                    return member.cpf
                }
            }
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}