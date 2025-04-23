import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import User from '../../../../../models/userModel';
import mongoose from 'mongoose';
import multer from 'multer';
import { promisify } from 'util';

export const config = {
  api: {
    bodyParser: false,
  },
};

const storage = multer.memoryStorage(); 
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Tipo de arquivo não suportado'));
    }
    cb(null, true);
  },
});

const uploadMiddleware = promisify(upload.single('image'));

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  const userId = req.query.id as string;

  if (!session || !session.user?._id) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  try {
    const sessionUserId = new mongoose.Types.ObjectId(session.user._id);
    const requestUserId = new mongoose.Types.ObjectId(userId);

    if (!sessionUserId.equals(requestUserId)) {
      return res.status(401).json({ message: 'Não autorizado' });
    }
  } catch (error) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  await mongoose.connect(process.env.MONGODB_URI!);

  if (req.method === 'PATCH') {
    try {
      const adaptedReq = req as any;
      adaptedReq.file = undefined; 
      await new Promise<void>((resolve, reject) => {
        upload.single('image')(adaptedReq, res as any, (err: any) => {
          if (err) return reject(err);
          resolve();
        });
      }); 

      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({ message: 'Nenhuma imagem enviada' });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          image: {
            data: file.buffer,
            contentType: file.mimetype,
          },
        },
        { new: true }
      ).select('image');

      return res.status(200).json({
        message: 'Imagem salva com sucesso',
        image: {
          data: updatedUser?.image ? updatedUser.image.data.toString('base64') : null,
          contentType: updatedUser?.image ? updatedUser.image.contentType : null,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao salvar imagem', error });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await User.findByIdAndUpdate(userId, { $unset: { image: '' } });
      return res.status(200).json({ message: 'Imagem excluída com sucesso' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao excluir imagem', error });
    }
  }

  return res.status(405).json({ message: 'Método não permitido' });
}
