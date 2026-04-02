import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { connectToMongoDB } from "@/lib/db";
import User from "../../../../../models/userModel";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToMongoDB();
  const { id } = req.query;

  switch (req.method) {
    case "GET":
      try {
        const filter = mongoose.isValidObjectId(id as string)
          ? { _id: new mongoose.Types.ObjectId(id as string) }
          : { email: id };

        console.log("Filtro usado no GET:", filter); // Log para depuração

        const user = await User.findOne(filter).lean();

        console.log("Usuário encontrado:", user); // Log para depuração

        return res.status(200).json(user);
      } catch (error) {
        console.error("Erro no GET /api/user/[id]:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

    case "PATCH":
      try {
        const { name, email, phone, birthday, course, graduationYear, cpf } = req.body;

        const updateData: any = {
          name,
          email,
          cpf,
          phone: phone ? parseInt(phone, 10) : null,
          birthday,
          course: course?.trim() || "",
          graduationYear: graduationYear ? parseInt(graduationYear, 10) : null,
        };

        console.log("Dados recebidos para atualização:", updateData); // Log para depuração

        const user = await User.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(id as string) },
          { $set: updateData },
          {
            new: true,
            runValidators: true,
            context: "query",
          }
        );

        if (!user) {
          return res.status(404).json({ message: "Usuário não encontrado." });
        }
        return res.status(200).json(user);
      } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        return res.status(500).json({ message: "Erro interno do servidor" });
      }

    case "DELETE":
      try {
        await User.findOneAndDelete({ _id: new mongoose.Types.ObjectId(id as string) });
        return res.status(204).end();
      } catch (error) {
        console.error("Erro no DELETE /api/user/[id]:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

    default:
      res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
