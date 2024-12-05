import { NextApiRequest, NextApiResponse } from "next";
import Group from "../../../../../models/groupModel";
import { compareToken } from "@/lib/crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { cpf } = req.query;
    if (!cpf) {
        return res.status(400).json({ message: 'CPF is required' });
    }

    if (cpf.length !== 11) {
        return res.status(400).json({ message: 'Invalid CPF' });
    }

    try {
        const groups = await Group.find({});

        for (const group of groups) {
            for (const member of group.members) {

                if (!member.cpf) continue;
                const isMatch = await compareToken(cpf.toString(), member.cpf!!);
                if (isMatch) {
                    return res.status(200).json({
                        message: "CPF found",
                        group: group,
                        cpf: member.cpf!!,
                        member: member,
                    });
                }
            }
        }

        return res.status(404).json({ message: "CPF not found in any group" });
    } catch (error) {
        console.error("Error verifying CPF:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}