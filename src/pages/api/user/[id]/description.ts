import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { connectToMongoDB } from "@/lib/db";
import User from "../../../../../models/userModel";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await connectToMongoDB();
    const { id } = req.query;

    if (req.method !== "PATCH") {
        res.setHeader("Allow", ["PATCH"]);
        return res.status(405).json({ 
            message: `Método ${req.method} não permitido`,
            allowedMethods: ["PATCH"] 
        });
    }

    try {
        if (!mongoose.Types.ObjectId.isValid(id as string)) {
            return res.status(400).json({ message: "ID de usuário inválido" });
        }

        const { description } = req.body;

        if (typeof description !== "string") {
            return res.status(400).json({ 
                message: "Formato de descrição inválido",
                details: "A descrição deve ser uma string"
            });
        }

        const trimmedDescription = description.trim();

        if (trimmedDescription.length > 500) {
            return res.status(400).json({
                message: "Descrição muito longa",
                details: "Máximo de 500 caracteres permitidos"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { description: trimmedDescription },
            { 
                new: true,
                runValidators: true,
                context: "query",
            }
        ).lean();

        if (!updatedUser) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        return res.status(200).json({
            success: true,
            message: "Descrição atualizada com sucesso",
            description: updatedUser.description
        });

    } catch (error: any) {
        console.error("Erro ao atualizar descrição:", error);

        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                message: "Erro de validação",
                details: error.message
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Conflito de dados",
                details: error.message
            });
        }

        return res.status(500).json({
            message: "Erro interno do servidor",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
}