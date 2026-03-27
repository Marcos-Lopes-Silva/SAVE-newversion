import { NextApiRequest, NextApiResponse } from "next";
import Group from "../../../../../models/groupModel";
import { createSearchHash } from "@/lib/crypto";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { cpf } = req.query;

    if (!cpf || typeof cpf !== "string") {
        return res.status(400).json({ message: "CPF is required" });
    }

    if (cpf.length !== 11) {
        return res.status(400).json({ message: "Invalid CPF" });
    }

    try {
        const cpfSearch = createSearchHash(cpf);

        const group = await Group.findOne(
            { "members.cpf_search": cpfSearch },
            { "members.$": 1, name: 1 }
        );

        if (!group || !group.members.length) {
            return res.status(404).json({ message: "CPF not found" });
        }

        const member = group.members[0];

        return res.status(200).json({
            message: "CPF found",
            groupId: group._id,
            groupName: group.name,
            member,
        });
    } catch (error) {
        console.error("Error verifying CPF:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}