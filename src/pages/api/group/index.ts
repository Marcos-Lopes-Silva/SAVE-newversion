import { connectToMongoDB } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';
import Group, { IUsers } from '../../../../models/groupModel';
import { compareToken, createSearchHash, hashToken } from '@/lib/crypto';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();

    switch (req.method) {
        case "POST":
            try {
                const newUsers = await Promise.all(
                    req.body.members.map(async (user: IUsers) => {
                        const cpf = user.cpf?.replace(/\D/g, '') ?? '';

                        const newUser = {
                            ...user,
                            cpf: await hashToken(cpf),
                            cpf_search: createSearchHash(cpf)
                        };

                        const memberHashed = await verifyUsersFromOthersGroups(newUser.cpf_search);

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

const verifyUsersFromOthersGroups = async (cpf_search: string) => {
    try {
        const group = await Group.findOne(
            { "members.cpf_search": cpf_search },
            { "members.$": 1 }
        );

        if (!group || !group.members.length) return null;

        return group.members[0].cpf;
    } catch (error) {
        console.error(error);
        return null;
    }
};